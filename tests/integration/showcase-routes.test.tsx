import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import aboutPage, { metadata as aboutMetadata } from "../../src/app/about/page";
import devicesPage, {
	metadata as devicesMetadata,
} from "../../src/app/devices/page";
import diaryPage, {
	DiaryEntries,
	metadata as diaryMetadata,
} from "../../src/app/diary/page";
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
import type { DiaryEntry } from "../../src/lib/showcase/types";
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

	it("renders complete non-empty Diary entries in source order", () => {
		const entries = [
			{
				id: "first-entry",
				content: "第一条公开日记。",
				publishedAt: "2026-07-14",
				mood: "平静",
				location: "书桌前",
				tags: ["夜航", "记录"],
				images: [
					{
						src: "/images/diary/first.webp",
						alt: "书桌上的夜灯",
						width: 1200,
						height: 800,
					},
				],
			},
			{
				id: "second-entry",
				content: "第二条公开日记。",
				publishedAt: "2026-07-15",
				tags: [],
				images: [],
			},
		] satisfies readonly DiaryEntry[];
		const html = renderToStaticMarkup(<DiaryEntries entries={entries} />);

		expect(html.indexOf("第一条公开日记")).toBeLessThan(
			html.indexOf("第二条公开日记"),
		);
		expect(html).toContain('<time dateTime="2026-07-14">');
		expect(html).toContain("<dt>心情</dt><dd>平静</dd>");
		expect(html).toContain("<dt>地点</dt><dd>书桌前</dd>");
		expect(html).toContain(
			'<ul aria-label="标签"><li>夜航</li><li>记录</li></ul>',
		);
		expect(html).toContain('alt="书桌上的夜灯"');
		expect(html).toContain('width="1200"');
		expect(html).toContain('height="800"');
	});
});
