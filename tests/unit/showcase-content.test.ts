import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import {
	albums,
	devices,
	diary,
	friends,
	getAlbum,
	profile,
	projects,
	skills,
	timeline,
} from "../../src/lib/showcase/content";

describe("personal showcase content contract", () => {
	it("has unique record identifiers and deterministic album lookup", () => {
		expect(new Set(projects.map(({ slug }) => slug)).size).toBe(
			projects.length,
		);
		expect(new Set(timeline.map(({ id }) => id)).size).toBe(
			timeline.length,
		);
		expect(new Set(skills.map(({ id }) => id)).size).toBe(skills.length);
		expect(new Set(friends.map(({ id }) => id)).size).toBe(friends.length);
		expect(new Set(devices.map(({ id }) => id)).size).toBe(devices.length);
		expect(new Set(diary.map(({ id }) => id)).size).toBe(diary.length);
		expect(new Set(albums.map(({ slug }) => slug)).size).toBe(
			albums.length,
		);
		expect(
			new Set(
				albums.flatMap(({ photos }) => photos.map(({ src }) => src)),
			).size,
		).toBe(albums.reduce((count, { photos }) => count + photos.length, 0));
		expect(getAlbum("acg-example")).toBe(albums[0]);
		expect(getAlbum("missing")).toBeUndefined();
	});

	it("uses HTTPS links and complete authored image metadata", () => {
		const allLinks = [
			...profile.links,
			...projects.flatMap(({ links }) => links),
			...timeline.flatMap(({ links }) => links ?? []),
			...friends.map(({ url }) => url),
			...devices.flatMap(({ url }) => (url ? [url] : [])),
		];
		const allImages = [
			...projects.flatMap(({ cover }) => (cover ? [cover] : [])),
			...friends.flatMap(({ avatar }) => (avatar ? [avatar] : [])),
			...devices.map(({ image }) => image),
			...diary.flatMap(({ images }) => images),
			...albums.flatMap(({ cover, photos }) => [cover, ...photos]),
		];

		expect(allLinks.every(({ href }) => href.startsWith("https://"))).toBe(
			true,
		);
		expect(
			allImages.every(
				({ alt, src, width, height }) =>
					src.trim().length > 0 &&
					alt.trim().length > 0 &&
					Number.isInteger(width) &&
					width > 0 &&
					Number.isInteger(height) &&
					height > 0,
			),
		).toBe(true);
	});

	it("uses parseable ISO dates in deterministic source order", () => {
		const isoDate = /^\d{4}-\d{2}-\d{2}$/u;
		const parseable = (date: string) => {
			if (!isoDate.test(date)) return false;
			const parsed = new Date(`${date}T00:00:00.000Z`);
			return (
				!Number.isNaN(parsed.getTime()) &&
				parsed.toISOString().slice(0, 10) === date
			);
		};
		const ascending = (dates: readonly string[]) =>
			dates.every(
				(date, index) => index === 0 || dates[index - 1]! <= date,
			);
		const descending = (dates: readonly string[]) =>
			dates.every(
				(date, index) => index === 0 || dates[index - 1]! >= date,
			);
		const timelineDates = timeline.map(({ date }) => date);
		const diaryDates = diary.map(({ publishedAt }) => publishedAt);
		const albumDates = albums.flatMap(({ date }) => (date ? [date] : []));
		const photoDates = albums.flatMap(({ photos }) =>
			photos.flatMap(({ date }) => (date ? [date] : [])),
		);
		const dates = [
			...timelineDates,
			...diaryDates,
			...albumDates,
			...photoDates,
		];

		expect(dates.every(parseable)).toBe(true);
		expect(ascending(timelineDates)).toBe(true);
		expect(descending(diaryDates)).toBe(true);
		expect(descending(albumDates)).toBe(true);
	});

	it("declares every content source with literal-safe data and a consumable readonly view", async () => {
		const contracts = [
			[
				"profile.ts",
				/as const satisfies Profile/u,
				/profile: Readonly<Profile>/u,
			],
			[
				"projects.ts",
				/as const satisfies readonly Project\[\]/u,
				/projects: readonly Project\[\]/u,
			],
			[
				"timeline.ts",
				/as const satisfies readonly TimelineEntry\[\]/u,
				/timeline: readonly TimelineEntry\[\]/u,
			],
			[
				"skills.ts",
				/as const satisfies readonly Skill\[\]/u,
				/skills: readonly Skill\[\]/u,
			],
			[
				"friends.ts",
				/as const satisfies readonly Friend\[\]/u,
				/friends: readonly Friend\[\]/u,
			],
			[
				"devices.ts",
				/as const satisfies readonly Device\[\]/u,
				/devices: readonly Device\[\]/u,
			],
			[
				"diary.ts",
				/as const satisfies readonly DiaryEntry\[\]/u,
				/diary: readonly DiaryEntry\[\]/u,
			],
			[
				"albums.ts",
				/as const satisfies readonly Album\[\]/u,
				/albums: readonly Album\[\]/u,
			],
		] as const;

		for (const [file, dataContract, viewContract] of contracts) {
			const source = await readFile(`src/content/${file}`, "utf8");
			expect(source, `${file} literal data contract`).toMatch(
				dataContract,
			);
			expect(source, `${file} readonly consumer view`).toMatch(
				viewContract,
			);
		}
	});

	it("publishes only approved and verifiable content", () => {
		expect(projects.map(({ slug }) => slug)).toEqual([
			"xinvstar",
			"lingchu-bot",
		]);
		expect(friends).toEqual([]);
		expect(diary).toEqual([]);
		expect(albums).toHaveLength(1);
		expect(albums[0]?.photos.length).toBeGreaterThan(0);
		expect(devices.map(({ category }) => category)).toEqual([
			"phone",
			"network",
		]);

		const untrustedText = JSON.stringify([timeline, friends, diary]);
		expect(untrustedText).not.toContain("example.com");
		expect(skills.every((skill) => !("proficiency" in skill))).toBe(true);
		expect(skills.every((skill) => !("level" in skill))).toBe(true);
		expect(
			projects.every(({ featured }) => typeof featured === "boolean"),
		).toBe(true);
	});
});
