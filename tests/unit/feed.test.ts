import { XMLParser } from "fast-xml-parser";
import { describe, expect, it } from "vitest";

import { serializeAtom, serializeRss } from "@/lib/content/feed";
import type { Post } from "@/lib/content/posts";

const posts: Post[] = [
	{
		body: `Second <post> & body

\`\`\`mermaid title="Flow"
graph TD
  A --> B
\`\`\`
`,
		category: "工程 & 架构",
		comment: true,
		draft: false,
		published: new Date("2026-07-14T00:00:00.000Z"),
		slug: "second-post",
		sourcePath: "second-post.md",
		tags: ["Next.js"],
		title: "Second <post> & notes",
	},
	{
		body: "First body",
		comment: true,
		draft: false,
		published: new Date("2026-07-01T00:00:00.000Z"),
		slug: "first-post",
		sourcePath: "first-post.md",
		tags: [],
		title: "First post",
		updated: new Date("2026-07-20T00:00:00.000Z"),
	},
	{
		body: "Never publish this",
		comment: true,
		draft: true,
		published: new Date("2026-07-15T00:00:00.000Z"),
		slug: "draft-post",
		sourcePath: "draft-post.md",
		tags: [],
		title: "Draft post",
	},
];

describe("feed serializers", () => {
	const parser = new XMLParser({ ignoreAttributes: false });

	it("serializes deterministic RSS with escaped metadata and published order", async () => {
		const xml = await serializeRss(posts);
		const document = parser.parse(xml) as {
			rss: { channel: { item: Array<{ link: string }>; lastBuildDate: string } };
		};

		expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/u);
		expect(xml).toContain("<rss version=\"2.0\"");
		expect(xml).toContain("Second &lt;post&gt; &amp; notes");
		expect(xml).toContain("https://www.xinvstar.xyz/posts/second-post/");
		expect(xml).not.toContain("Draft post");
		expect(xml.indexOf("Second &lt;post&gt;")).toBeLessThan(
			xml.indexOf("First post"),
		);
		expect(document.rss.channel.lastBuildDate).toBe(
			"Mon, 20 Jul 2026 00:00:00 GMT",
		);
		expect(document.rss.channel.item.map((item) => item.link)).toEqual([
			"https://www.xinvstar.xyz/posts/second-post/",
			"https://www.xinvstar.xyz/posts/first-post/",
		]);
	});

	it("serializes Atom with canonical absolute identifiers and ISO dates", async () => {
		const xml = await serializeAtom(posts);
		const document = parser.parse(xml) as {
			feed: { entry: Array<{ id: string }>; updated: string };
		};

		expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom">');
		expect(document.feed.updated).toBe("2026-07-20T00:00:00.000Z");
		expect(document.feed.entry.map((entry) => entry.id)).toEqual([
			"https://www.xinvstar.xyz/posts/second-post/",
			"https://www.xinvstar.xyz/posts/first-post/",
		]);
		expect(xml).toContain('<link href="https://www.xinvstar.xyz/atom.xml" rel="self"/>');
		expect(xml).toContain("<id>https://www.xinvstar.xyz/posts/second-post/</id>");
		expect(xml).not.toContain("Draft post");
	});

	it("removes interactive enhancement attributes but retains readable code", async () => {
		const [rss, atom] = await Promise.all([
			serializeRss(posts),
			serializeAtom(posts),
		]);

		for (const xml of [rss, atom]) {
			expect(xml).not.toMatch(/data-(?:code|mermaid|interactive)[\w-]*=/u);
			expect(xml).toContain("graph TD");
			expect(() => parser.parse(xml)).not.toThrow();
		}
	});
});
