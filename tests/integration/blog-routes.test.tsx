import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import notFoundPage from "../../src/app/not-found";
import homePage, { metadata as homeMetadata } from "../../src/app/page";
import postPage, {
	generateMetadata,
	generateStaticParams,
} from "../../src/app/posts/[slug]/page";
import robots from "../../src/app/robots";
import sitemap from "../../src/app/sitemap";
import { getPublishedPosts } from "../../src/lib/posts";
import { absoluteUrl, siteConfig } from "../../src/lib/site";

describe("blog routes", () => {
	it("renders every published post on the home page in date-descending order", async () => {
		const posts = await getPublishedPosts();
		const html = renderToStaticMarkup(await homePage());
		const positions = posts.map((post) => html.indexOf(post.title));

		expect(positions.every((position) => position >= 0)).toBe(true);
		expect(positions).toEqual(
			[...positions].sort((left, right) => left - right),
		);
		expect(html).not.toContain("draft.md");
	});

	it("statically generates only published article slugs", async () => {
		const posts = await getPublishedPosts();

		expect(await generateStaticParams()).toEqual(
			posts.map((post) => ({ slug: post.slug })),
		);
	});

	it("renders an article and exposes canonical Open Graph metadata", async () => {
		const [post] = await getPublishedPosts();
		const route = { params: Promise.resolve({ slug: post.slug }) };
		const html = renderToStaticMarkup(await postPage(route));
		const metadata = await generateMetadata(route);

		expect(html).toContain(`<h1>${post.title}</h1>`);
		expect(html).toContain(post.body.includes("## ") ? "<h2" : "<p");
		expect(metadata.alternates?.canonical).toBe(
			absoluteUrl(`/posts/${post.slug}/`),
		);
		expect(metadata.openGraph).toMatchObject({
			title: post.title,
			type: "article",
			url: absoluteUrl(`/posts/${post.slug}/`),
		});
	});

	it("returns Next.js' real 404 for an unknown article", async () => {
		await expect(
			postPage({ params: Promise.resolve({ slug: "missing-post" }) }),
		).rejects.toThrow(/404|NEXT_HTTP_ERROR_FALLBACK/u);

		const html = renderToStaticMarkup(notFoundPage());
		expect(html).toContain("404");
	});

	it("returns 404 instead of throwing for malformed encoded slugs", async () => {
		await expect(
			postPage({ params: Promise.resolve({ slug: "%E0%A4%A" }) }),
		).rejects.toThrow(/404|NEXT_HTTP_ERROR_FALLBACK/u);
	});

	it(
		"renders exactly one level-one heading for every published article",
		async () => {
			for (const post of await getPublishedPosts()) {
				const html = renderToStaticMarkup(
					await postPage({ params: Promise.resolve({ slug: post.slug }) }),
				);
				expect(
					html.match(/<h1(?:\s|>)/gu),
					post.sourcePath,
				).toHaveLength(1);
			}
		},
		30_000,
	);

	it("publishes root canonical metadata, robots and all post sitemap entries", async () => {
		const posts = await getPublishedPosts();
		const sitemapEntries = await sitemap();

		expect(homeMetadata.alternates?.canonical).toBe(siteConfig.url);
		expect(homeMetadata.openGraph).toMatchObject({
			images: [absoluteUrl(siteConfig.defaultOgImage)],
			title: siteConfig.title,
			url: siteConfig.url,
		});
		expect(robots()).toMatchObject({
			rules: { allow: "/", userAgent: "*" },
			sitemap: absoluteUrl("/sitemap.xml"),
		});
		expect(sitemapEntries.map((entry) => entry.url)).toEqual([
			siteConfig.url,
			...posts.map((post) => absoluteUrl(`/posts/${post.slug}/`)),
		]);
	});
});
