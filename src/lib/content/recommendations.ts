import type { PostSummary } from "./posts";

export type AdjacentPosts = {
	previous: PostSummary | undefined;
	next: PostSummary | undefined;
};

function normalized(value: string): string {
	return value.trim().toLocaleLowerCase();
}

function byPublishedDate(left: PostSummary, right: PostSummary): number {
	return (
		right.published.getTime() - left.published.getTime() ||
		left.slug.localeCompare(right.slug)
	);
}

export function getAdjacentPosts(
	posts: readonly PostSummary[],
	currentSlug: string,
): AdjacentPosts {
	const publishedPosts = posts
		.filter((post) => !post.draft)
		.sort(byPublishedDate);
	const index = publishedPosts.findIndex((post) => post.slug === currentSlug);
	if (index < 0) return { next: undefined, previous: undefined };

	return {
		next: publishedPosts[index - 1],
		previous: publishedPosts[index + 1],
	};
}

export function getRelatedPosts(
	posts: readonly PostSummary[],
	currentSlug: string,
	limit = 3,
): PostSummary[] {
	const current = posts.find(
		(post) => post.slug === currentSlug && !post.draft,
	);
	if (!current || limit <= 0) return [];

	const currentTags = new Set(current.tags.map(normalized));
	const currentCategory = current.category
		? normalized(current.category)
		: undefined;

	return posts
		.filter((post) => post.slug !== currentSlug && !post.draft)
		.map((post) => {
			const matchingTags = new Set(
				post.tags.map(normalized),
			).intersection(currentTags).size;
			const categoryMatch =
				currentCategory !== undefined &&
				post.category !== undefined &&
				normalized(post.category) === currentCategory;
			return { post, score: matchingTags * 10 + (categoryMatch ? 1 : 0) };
		})
		.filter(({ score }) => score > 0)
		.sort(
			(left, right) =>
				right.score - left.score ||
				byPublishedDate(left.post, right.post),
		)
		.slice(0, limit)
		.map(({ post }) => post);
}
