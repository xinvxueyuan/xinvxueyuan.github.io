import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { renderMarkdown } from "../../src/lib/markdown";

describe("renderMarkdown", () => {
	it("renders GFM, links and stable heading ids", async () => {
		const { html } = await renderMarkdown(`# Hello, world!

[Next.js](https://nextjs.org)

| Name | Value |
| --- | --- |
| xinvStar | blog |
`);

		expect(html).toContain('<h2 id="hello-world">Hello, world!</h2>');
		expect(html).not.toContain("<h1");
		expect(html).toContain('<a href="https://nextjs.org">Next.js</a>');
		expect(html).toContain("<table>");
		expect(html).toContain("<td>blog</td>");
	});

	it("reserves level-one headings for the article page title", async () => {
		const { html } = await renderMarkdown("# Body title\n\n## Section");

		expect(html).toContain('<h2 id="body-title">Body title</h2>');
		expect(html).toContain('<h2 id="section">Section</h2>');
		expect(html).not.toContain("<h1");
	});

	it("highlights known fenced languages on the server", async () => {
		const { html } = await renderMarkdown(
			"```ts\nconst answer: number = 42\n```",
		);

		expect(html).toContain("shiki");
		expect(html).toContain("const");
		expect(html).toContain("answer");
	});

	it("keeps unknown fenced languages readable", async () => {
		const { html } = await renderMarkdown(
			"```not-a-real-language\nlaunch --target stars\n```",
		);

		expect(html).toContain("launch --target stars");
		expect(html).toContain("<pre");
		expect(html).toContain("<code");
	});

	it("does not emit embedded raw HTML", async () => {
		const { html } = await renderMarkdown(
			'<script>alert("owned")</script>\n\nStill safe.\n\n<img src=x onerror=alert(1)>',
		);

		expect(html).not.toContain("<script");
		expect(html).not.toContain("onerror");
		expect(html).not.toContain("<img");
		expect(html).toContain("Still safe.");
	});

	it("removes dangerous link URL protocols before HTML reaches React", async () => {
		const { html } = await renderMarkdown(`
[javascript](javascript:alert)
[mixed case](JaVaScRiPt:alert)
[entity colon](javascript&#x3A;alert)
[leading control](&#x09;javascript:alert)
[percent encoded](%6Aavascript%3Aalert)
[vbscript](vbscript:alert)
[data](data:text/html,alert)
`);

		for (const label of [
			"javascript",
			"mixed case",
			"entity colon",
			"leading control",
			"percent encoded",
			"vbscript",
			"data",
		]) {
			expect(html).toContain(`<a>${label}</a>`);
		}
		expect(html).not.toMatch(/<a\b[^>]*\bhref=/iu);
	});

	it("removes dangerous image URL protocols", async () => {
		const { html } = await renderMarkdown(`
![javascript](javascript:alert)
![mixed case](JaVaScRiPt:alert)
![entity colon](javascript&#x3A;alert)
![leading control](&#x09;javascript:alert)
![percent encoded](%6Aavascript%3Aalert)
![vbscript](vbscript:alert)
![data](data:image/svg+xml,alert)
`);

		for (const label of [
			"javascript",
			"mixed case",
			"entity colon",
			"leading control",
			"percent encoded",
			"vbscript",
			"data",
		]) {
			expect(html).toMatch(new RegExp(`<img(?![^>]*\\bsrc=)[^>]*alt="${label}"`));
		}
		expect(html).not.toMatch(/<img\b[^>]*\bsrc=/iu);
	});

	it("preserves the explicit link and image URL allowlists", async () => {
		const { html } = await renderMarkdown(`
[root](/posts/hello)
[relative](../hello)
[fragment](#hello)
[http](http://example.com)
[https](https://example.com)
[email](mailto:hello@example.com)
[phone](tel:+123456)

![root](/cover.webp)
![relative](../cover.webp)
![http](http://example.com/cover.webp)
![https](https://example.com/cover.webp)
`);

		for (const url of [
			"/posts/hello",
			"../hello",
			"#hello",
			"http://example.com",
			"https://example.com",
			"mailto:hello@example.com",
			"tel:+123456",
		]) {
			expect(html).toContain(`href="${url}"`);
		}
		for (const url of [
			"/cover.webp",
			"../cover.webp",
			"http://example.com/cover.webp",
			"https://example.com/cover.webp",
		]) {
			expect(html).toContain(`src="${url}"`);
		}
	});

	it("renders the allowlisted extended Markdown contract", async () => {
		const fixture = await readFile(
			path.join(process.cwd(), "tests/fixtures/markdown/extended.md"),
			"utf8",
		);
		const result = await renderMarkdown(fixture);

		expect(result.headings).toEqual([
			{ depth: 2, id: "section", text: "Section" },
		]);
		expect(result.html).toContain('class="katex"');
		expect(result.html).toContain('data-mermaid-source="');
		expect(result.html).toContain('class="admonition admonition--tip"');
		expect(result.html).toContain('class="video-embed"');
		expect(result.html).toContain('class="github-card"');
		expect(result.html).toContain("data-code-block");
		expect(result.html).not.toContain("<iframe");
		expect(result.html).not.toContain("<script");
		expect(result.hasMermaid).toBe(true);
	});

	it.each(["note", "tip", "important", "warning", "caution"])(
		"supports the %s admonition",
		async (kind) => {
			const { html } = await renderMarkdown(
				`:::${kind}[Safe title]\nBody\n:::`,
			);
			expect(html).toContain(`admonition admonition--${kind}`);
			expect(html).toContain("Safe title");
		},
	);

	it("accepts only safe video IDs and GitHub repository names", async () => {
		const { html } = await renderMarkdown(`
::video{provider="youtube" id="5gIf0_xpFPI"}
::video{provider="bilibili" id="BV1fK4y1s7Qf"}
::video{provider="youtube" id="bad/id" onclick="alert(1)"}
::video{provider="bilibili" id="bad?autoplay=1"}
::github{repo="owner/repo"}
::github{repo="owner/repo/extra" onclick="alert(1)"}
`);

		expect(html).toContain("https://www.youtube.com/watch?v=5gIf0_xpFPI");
		expect(html).toContain("https://www.bilibili.com/video/BV1fK4y1s7Qf");
		expect(html).toContain("https://github.com/owner/repo");
		expect(html).not.toContain("bad/id");
		expect(html).not.toContain("autoplay");
		expect(html).not.toContain("onclick");
		expect(html.match(/class="video-embed"/gu)).toHaveLength(2);
		expect(html.match(/class="github-card"/gu)).toHaveLength(1);
	});

	it("fails open for malformed math and preserves code metadata", async () => {
		const { html } = await renderMarkdown(
			"Broken $\\notacommand{$ math.\n\n```ts title=example.ts\nconst ok = true\n```",
		);
		expect(html).toContain("Broken");
		expect(html).toContain("data-code-block");
		expect(html).toContain("data-code-language=\"ts\"");
		expect(html).toContain("data-code-title=\"example.ts\"");
		expect(html).not.toContain("<script");
	});

	it("drops dangerous and unknown directive attributes", async () => {
		const { html } = await renderMarkdown(`
:::tip[Safe]{onclick="alert(1)" style="background:url(javascript:alert)"}
Body
:::
::unknown{href="javascript:alert(1)" onclick="alert(1)"}
`);
		expect(html).toContain("admonition--tip");
		expect(html).not.toContain("onclick");
		expect(html).not.toContain("javascript:");
		expect(html).not.toContain("style=");
	});
});
