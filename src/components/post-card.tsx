import { getTaxonomyTermSlug, type Taxonomy } from "@/lib/content/taxonomy";
import type { Post } from "@/lib/posts";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
	dateStyle: "long",
	timeZone: "UTC",
});

export function PostCard({
	post,
	taxonomy,
}: {
	post: Post;
	taxonomy: Taxonomy;
}) {
	return (
		<article className="post-card" data-post-card>
			<p className="post-card__date">
				<time dateTime={post.published.toISOString()}>
					{dateFormatter.format(post.published)}
				</time>
			</p>
			<h3>
				<a href={`/posts/${post.slug}/`}>{post.title}</a>
			</h3>
			{post.description ? <p>{post.description}</p> : null}
			{post.category || post.tags.length ? (
				<p className="post-card__taxonomy">
					{post.category ? (
						<a
							href={`/categories/${encodeURIComponent(getTaxonomyTermSlug(post.category, taxonomy.categories))}/`}
						>
							{post.category}
						</a>
					) : null}
					{post.tags.map((tag) => (
						<a
							href={`/tags/${encodeURIComponent(getTaxonomyTermSlug(tag, taxonomy.tags))}/`}
							key={tag}
						>
							#{tag}
						</a>
					))}
				</p>
			) : null}
		</article>
	);
}
