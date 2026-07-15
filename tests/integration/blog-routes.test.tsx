import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { GET as getAtom } from "../../src/app/atom.xml/route";
import { GET as getLlmsFull } from "../../src/app/llms-full.txt/route";
import { GET as getLlms } from "../../src/app/llms.txt/route";
import notFoundPage from "../../src/app/not-found";
import homePage, { metadata as homeMetadata } from "../../src/app/page";
import postPage, {
	generateMetadata,
	generateStaticParams,
} from "../../src/app/posts/[slug]/page";
import {
	backgroundImageAsset,
	contentType as ogContentType,
	generateStaticParams as generateOgStaticParams,
	size as ogSize,
} from "../../src/app/posts/[slug]/opengraph-image";
import robots from "../../src/app/robots";
import { GET as getRss } from "../../src/app/rss.xml/route";
import sitemap from "../../src/app/sitemap";
import { getTaxonomy } from "../../src/lib/content/taxonomy";
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
		expect(html).toContain('type="application/ld+json"');
		expect(html).toContain("https://schema.org");
		expect(html).toContain("BlogPosting");
	});

	it(
		"serves feed and llms routes with exact media types",
		async () => {
			const [rss, atom, llms, llmsFull] = await Promise.all([
				getRss(),
				getAtom(),
				getLlms(),
				getLlmsFull(),
			]);
			expect(rss.headers.get("content-type")).toBe(
				"application/rss+xml; charset=utf-8",
			);
			expect(atom.headers.get("content-type")).toBe(
				"application/atom+xml; charset=utf-8",
			);
			expect(llms.headers.get("content-type")).toBe(
				"text/plain; charset=utf-8",
			);
			expect(llmsFull.headers.get("content-type")).toBe(
				"text/plain; charset=utf-8",
			);
			expect(await rss.text()).toContain("<rss version=\"2.0\"");
			expect(await atom.text()).toContain(
				'<feed xmlns="http://www.w3.org/2005/Atom">',
			);
		},
		30_000,
	);

	it("statically generates article Open Graph images for published posts", async () => {
		const posts = await getPublishedPosts();
		expect(await generateOgStaticParams()).toEqual(
			posts.map((post) => ({ slug: post.slug })),
		);
		expect(ogSize).toEqual({ height: 630, width: 1200 });
		expect(ogContentType).toBe("image/png");
		expect(backgroundImageAsset).toBe(
			"public/assets/brand/xinvstar-night-orbit-og.png",
		);
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
		const taxonomy = getTaxonomy(posts);
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
			absoluteUrl("/archive/"),
			absoluteUrl("/search/"),
			...taxonomy.categories.map((category) =>
				absoluteUrl(`/categories/${encodeURIComponent(category.slug)}/`),
			),
			...taxonomy.tags.map((tag) =>
				absoluteUrl(`/tags/${encodeURIComponent(tag.slug)}/`),
			),
			...posts.map((post) => absoluteUrl(`/posts/${post.slug}/`)),
		]);
		expect(sitemapEntries.map((entry) => entry.url).join("\n")).not.toMatch(
			/(?:rss|atom|llms)/u,
		);
	});
});
