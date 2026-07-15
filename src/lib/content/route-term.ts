import type { TaxonomyTerm } from "./taxonomy";

/**
 * Next.js supplies decoded dynamic params, while direct unit calls and some
 * adapters may still provide their encoded form. Prefer an exact match so a
 * legitimate literal percent sign is not mistaken for broken URI encoding.
 */
export function findRouteTaxonomyTerm(
	value: string,
	terms: readonly TaxonomyTerm[],
): TaxonomyTerm | undefined {
	const exact = terms.find((candidate) => candidate.slug === value);
	if (exact) return exact;

	try {
		const decoded = decodeURIComponent(value);
		return terms.find((candidate) => candidate.slug === decoded);
	} catch {
		return undefined;
	}
}
