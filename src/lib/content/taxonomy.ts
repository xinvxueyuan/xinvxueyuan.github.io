import { slug as githubSlug } from "github-slugger";

import type { PostSummary } from "./posts";

export type TaxonomyTerm = { count: number; name: string; slug: string };
export type TaxonomyYear = { count: number; year: number };
export type Taxonomy = {
	tags: TaxonomyTerm[];
	categories: TaxonomyTerm[];
	years: TaxonomyYear[];
};

function collectTerms(values: string[][]): TaxonomyTerm[] {
	const terms = new Map<string, { count: number; name: string }>();
	for (const labels of values) {
		const seen = new Set<string>();
		for (const rawLabel of labels) {
			const name = rawLabel.trim();
			const key = name.toLocaleLowerCase();
			if (!name || seen.has(key)) continue;
			seen.add(key);
			const current = terms.get(key);
			if (current) current.count += 1;
			else terms.set(key, { count: 1, name });
		}
	}

	return [...terms.values()]
		.map(({ count, name }) => ({
			count,
			name,
			slug: githubSlug(name) || name,
		}))
		.sort(
			(left, right) =>
				right.count - left.count || left.name.localeCompare(right.name),
		);
}

export function getTaxonomy(posts: readonly PostSummary[]): Taxonomy {
	const publishedPosts = posts.filter((post) => !post.draft);
	const yearCounts = new Map<number, number>();
	for (const post of publishedPosts) {
		const year = post.published.getUTCFullYear();
		yearCounts.set(year, (yearCounts.get(year) ?? 0) + 1);
	}

	return {
		categories: collectTerms(
			publishedPosts.map((post) =>
				post.category ? [post.category] : [],
			),
		),
		tags: collectTerms(publishedPosts.map((post) => post.tags)),
		years: [...yearCounts]
			.map(([year, count]) => ({ count, year }))
			.sort((left, right) => right.year - left.year),
	};
}
