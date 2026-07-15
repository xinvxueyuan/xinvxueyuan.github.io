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
			new Set(albums.flatMap(({ photos }) => photos.map(({ id }) => id)))
				.size,
		).toBe(albums.reduce((count, { photos }) => count + photos.length, 0));
		expect(getAlbum("acg-example")).toBe(albums[0]);
		expect(getAlbum("missing")).toBeUndefined();
	});

	it("uses HTTPS links and complete authored image metadata", () => {
		const allLinks = [
			...profile.links,
			...projects.flatMap(({ links }) => links),
			...timeline.flatMap(({ links }) => links),
			...friends.map(({ link }) => link),
			...devices.flatMap(({ links }) => links),
		];
		const allImages = [
			...projects.flatMap(({ image }) => (image ? [image] : [])),
			...friends.flatMap(({ image }) => (image ? [image] : [])),
			...devices.map(({ image }) => image),
			...diary.flatMap(({ images }) => images),
			...albums.flatMap(({ cover, photos }) => [
				cover,
				...photos.map(({ image }) => image),
			]),
		];

		expect(allLinks.every(({ href }) => href.startsWith("https://"))).toBe(
			true,
		);
		expect(
			allImages.every(
				({ alt, width, height }) =>
					alt.trim().length > 0 &&
					Number.isInteger(width) &&
					width > 0 &&
					Number.isInteger(height) &&
					height > 0,
			),
		).toBe(true);
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
	});
});
