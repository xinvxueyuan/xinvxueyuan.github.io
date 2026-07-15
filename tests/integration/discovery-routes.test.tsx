import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import archivePage, {
	metadata as archiveMetadata,
} from "../../src/app/archive/page";
import categoryPage, {
	generateMetadata as generateCategoryMetadata,
	generateStaticParams as generateCategoryStaticParams,
} from "../../src/app/categories/[category]/page";
import searchPage, {
	metadata as searchMetadata,
} from "../../src/app/search/page";
import tagPage, {
	generateMetadata as generateTagMetadata,
	generateStaticParams as generateTagStaticParams,
} from "../../src/app/tags/[tag]/page";
import { PostCard } from "../../src/components/post-card";
import { getPublishedPosts } from "../../src/lib/content/posts";
import { getTaxonomy, getTaxonomySlug } from "../../src/lib/content/taxonomy";
import { absoluteUrl } from "../../src/lib/site";

describe("discovery routes", () => {
	it("renders the archive in deterministic published order", async () => {
		const posts = await getPublishedPosts();
		const html = renderToStaticMarkup(await archivePage());
		const positions = posts.map((post) => html.indexOf(post.title));

		expect(positions.every((position) => position >= 0)).toBe(true);
		expect(positions).toEqual([...positions].sort((a, b) => a - b));
		expect(archiveMetadata.alternates?.canonical).toBe(
			absoluteUrl("/archive/"),
		);
	});

	it("generates published taxonomy params and decodes route terms", async () => {
		const posts = await getPublishedPosts();
		const taxonomy = getTaxonomy(posts);
		const tag = taxonomy.tags[0];
		const category = taxonomy.categories[0];

		expect(await generateTagStaticParams()).toEqual(
			taxonomy.tags.map((term) => ({ tag: term.slug })),
		);
		expect(await generateCategoryStaticParams()).toEqual(
			taxonomy.categories.map((term) => ({ category: term.slug })),
		);

		const tagRoute = {
			params: Promise.resolve({ tag: encodeURIComponent(tag.slug) }),
		};
		const categoryRoute = {
			params: Promise.resolve({
				category: encodeURIComponent(category.slug),
			}),
		};
		const tagHtml = renderToStaticMarkup(await tagPage(tagRoute));
		const categoryHtml = renderToStaticMarkup(
			await categoryPage(categoryRoute),
		);

		expect(tagHtml).toContain(tag.name);
		expect(categoryHtml).toContain(category.name);
		expect(
			(await generateTagMetadata(tagRoute)).alternates?.canonical,
		).toBe(absoluteUrl(`/tags/${encodeURIComponent(tag.slug)}/`));
		expect(
			(await generateCategoryMetadata(categoryRoute)).alternates
				?.canonical,
		).toBe(
			absoluteUrl(`/categories/${encodeURIComponent(category.slug)}/`),
		);
	});

	it("links category and tags from article cards", async () => {
		const post = (await getPublishedPosts()).find(
			(candidate) => candidate.category && candidate.tags.length > 0,
		);
		expect(post).toBeDefined();
		const html = renderToStaticMarkup(<PostCard post={post!} />);

		expect(html).toContain(
			`/categories/${encodeURIComponent(getTaxonomySlug(post!.category!))}/`,
		);
		expect(html).toContain(
			`/tags/${encodeURIComponent(getTaxonomySlug(post!.tags[0]))}/`,
		);
	});

	it("renders an accessible search page with canonical metadata", () => {
		const html = renderToStaticMarkup(searchPage());

		expect(html).toContain('type="search"');
		expect(html).toContain('aria-live="polite"');
		expect(searchMetadata.alternates?.canonical).toBe(
			absoluteUrl("/search/"),
		);
	});
});
