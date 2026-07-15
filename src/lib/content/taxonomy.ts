import { slug as githubSlug } from "github-slugger";

import type { PostSummary } from "./posts";

export type TaxonomyTerm = { count: number; name: string; slug: string };
export type TaxonomyYear = { count: number; year: number };
export type Taxonomy = {
	tags: TaxonomyTerm[];
	categories: TaxonomyTerm[];
	years: TaxonomyYear[];
};

export function getTaxonomySlug(name: string): string {
	return githubSlug(name.trim().replaceAll(".", " ")) || name.trim();
}

function taxonomyKey(name: string): string {
	return name.trim().toLowerCase();
}

function stableSlugSuffix(value: string): string {
	let hash = 0x811c9dc5;
	for (const character of value) {
		hash ^= character.codePointAt(0) ?? 0;
		hash = Math.imul(hash, 0x01000193);
	}
	return (hash >>> 0).toString(36);
}

export function getTaxonomyTermSlug(
	name: string,
	terms: readonly TaxonomyTerm[],
): string {
	const key = taxonomyKey(name);
	return (
		terms.find((term) => taxonomyKey(term.name) === key)?.slug ??
		getTaxonomySlug(name)
	);
}

function collectTerms(values: string[][]): TaxonomyTerm[] {
	const terms = new Map<string, { count: number; name: string }>();
	for (const labels of values) {
		const seen = new Set<string>();
		for (const rawLabel of labels) {
			const name = rawLabel.trim();
			const key = name.toLowerCase();
			if (!name || seen.has(key)) continue;
			seen.add(key);
			const current = terms.get(key);
			if (current) current.count += 1;
			else terms.set(key, { count: 1, name });
		}
	}

	const collected = [...terms.values()];
	const slugGroups = new Map<string, typeof collected>();
	for (const { name } of collected) {
		const slug = getTaxonomySlug(name);
		const group = slugGroups.get(slug) ?? [];
		group.push(terms.get(taxonomyKey(name))!);
		slugGroups.set(slug, group);
	}
	const assigned = new Map<string, string>();
	const used = new Set(
		[...slugGroups]
			.filter(([, group]) => group.length === 1)
			.map(([slug]) => slug),
	);
	for (const [baseSlug, group] of slugGroups) {
		if (group.length === 1) {
			assigned.set(taxonomyKey(group[0].name), baseSlug);
			continue;
		}
		for (const term of group.toSorted((left, right) =>
			taxonomyKey(left.name).localeCompare(taxonomyKey(right.name)),
		)) {
			const stem = `${baseSlug}-${stableSlugSuffix(taxonomyKey(term.name))}`;
			let slug = stem;
			let disambiguator = 2;
			while (used.has(slug)) slug = `${stem}-${disambiguator++}`;
			used.add(slug);
			assigned.set(taxonomyKey(term.name), slug);
		}
	}

	return collected
		.map(({ count, name }) => ({
			count,
			name,
			slug: assigned.get(taxonomyKey(name))!,
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
