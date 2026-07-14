import { describe, expect, it } from "vitest";

import { renderMarkdown } from "../../src/lib/markdown";

describe("renderMarkdown", () => {
	it("renders GFM, links and stable heading ids", async () => {
		const html = await renderMarkdown(`# Hello, world!

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
		const html = await renderMarkdown("# Body title\n\n## Section");

		expect(html).toContain('<h2 id="body-title">Body title</h2>');
		expect(html).toContain('<h2 id="section">Section</h2>');
		expect(html).not.toContain("<h1");
	});

	it("highlights known fenced languages on the server", async () => {
		const html = await renderMarkdown(
			"```ts\nconst answer: number = 42\n```",
		);

		expect(html).toContain("shiki");
		expect(html).toContain("const");
		expect(html).toContain("answer");
	});

	it("keeps unknown fenced languages readable", async () => {
		const html = await renderMarkdown(
			"```not-a-real-language\nlaunch --target stars\n```",
		);

		expect(html).toContain("launch --target stars");
		expect(html).toContain("<pre");
		expect(html).toContain("<code");
	});

	it("does not emit embedded raw HTML", async () => {
		const html = await renderMarkdown(
			'<script>alert("owned")</script>\n\nStill safe.\n\n<img src=x onerror=alert(1)>',
		);

		expect(html).not.toContain("<script");
		expect(html).not.toContain("onerror");
		expect(html).not.toContain("<img");
		expect(html).toContain("Still safe.");
	});

	it("removes dangerous link URL protocols before HTML reaches React", async () => {
		const html = await renderMarkdown(`
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
		const html = await renderMarkdown(`
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
		const html = await renderMarkdown(`
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
});
