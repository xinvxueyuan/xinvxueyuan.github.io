import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import aboutPage, { metadata as aboutMetadata } from "../../src/app/about/page";
import devicesPage, {
	metadata as devicesMetadata,
} from "../../src/app/devices/page";
import diaryPage, { metadata as diaryMetadata } from "../../src/app/diary/page";
import friendsPage, {
	metadata as friendsMetadata,
} from "../../src/app/friends/page";
import projectsPage, {
	metadata as projectsMetadata,
} from "../../src/app/projects/page";
import skillsPage, {
	metadata as skillsMetadata,
} from "../../src/app/skills/page";
import timelinePage, {
	metadata as timelineMetadata,
} from "../../src/app/timeline/page";
import { absoluteUrl } from "../../src/lib/site";

function countHeadings(html: string, level: number): number {
	return html.match(new RegExp(`<h${level}(?:\\s|>)`, "gu"))?.length ?? 0;
}

describe("personal showcase routes", () => {
	it.each([
		["about", aboutPage, aboutMetadata],
		["projects", projectsPage, projectsMetadata],
		["timeline", timelinePage, timelineMetadata],
		["skills", skillsPage, skillsMetadata],
		["friends", friendsPage, friendsMetadata],
	] as const)(
		"server-renders /%s/ with one H1, honest content, and canonical metadata",
		(route, Page, metadata) => {
			const html = renderToStaticMarkup(<Page />);

			expect(countHeadings(html, 1)).toBe(1);
			expect(metadata.title).toBeTruthy();
			expect(metadata.description).toBeTruthy();
			expect(metadata.alternates?.canonical).toBe(
				absoluteUrl(`/${route}/`),
			);
			expect(html).not.toContain("example.com");
		},
	);

	it("makes About the hub for all seven sibling showcase routes", () => {
		const html = renderToStaticMarkup(aboutPage());

		for (const route of [
			"projects",
			"timeline",
			"skills",
			"friends",
			"devices",
			"diary",
			"albums",
		]) {
			expect(html).toContain(`href="/${route}"`);
		}
	});

	it("renders both approved projects and safe external links", () => {
		const html = renderToStaticMarkup(projectsPage());

		expect(html).toContain("xinvStar");
		expect(html).toContain("Lingchu Bot");
		expect(html).toContain('target="_blank"');
		expect(html).toContain('rel="noopener noreferrer"');
	});

	it("uses explicit Chinese empty states for unpublished timeline and friends data", () => {
		const timelineHtml = renderToStaticMarkup(timelinePage());
		const friendsHtml = renderToStaticMarkup(friendsPage());

		expect(timelineHtml).toContain("暂时没有可公开验证的时间线记录");
		expect(timelineHtml).not.toContain("<ol");
		expect(friendsHtml).toContain("友链列表正在整理中");
		expect(friendsHtml).not.toContain("<ul");
	});

	it("renders both approved devices with complete image output and use-based categories", () => {
		const html = renderToStaticMarkup(devicesPage());
		const images = html.match(/<img\b[^>]*>/gu) ?? [];

		expect(html).toContain("iQOO Neo 10 Pro+");
		expect(html).toContain("ZTE U25S");
		expect(html).not.toContain("OnePlus");
		expect(images).toHaveLength(2);
		expect(
			images.every(
				(image) =>
					/\balt="[^"]+"/u.test(image) &&
					/\bwidth="[1-9]\d*"/u.test(image) &&
					/\bheight="[1-9]\d*"/u.test(image),
			),
		).toBe(true);
		expect(devicesMetadata.alternates?.canonical).toBe(
			absoluteUrl("/devices/"),
		);
	});

	it("renders Diary with one H1 and an honest empty state", () => {
		const html = renderToStaticMarkup(diaryPage());

		expect(countHeadings(html, 1)).toBe(1);
		expect(html).toContain("暂时没有可公开的日记记录");
		expect(diaryMetadata.alternates?.canonical).toBe(
			absoluteUrl("/diary/"),
		);
	});
});
