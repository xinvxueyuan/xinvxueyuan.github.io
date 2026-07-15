import type { AdjacentPosts } from "@/lib/content/recommendations";
import type { PostSummary } from "@/lib/content/posts";

export function ArticleRecommendations({
	adjacent,
	related,
}: {
	adjacent: AdjacentPosts;
	related: PostSummary[];
}) {
	return (
		<section aria-label="继续阅读" className="article-recommendations">
			<div className="article-adjacent">
				{adjacent.previous ? (
					<a href={`/posts/${adjacent.previous.slug}/`}>
						<small>上一篇</small>
						{adjacent.previous.title}
					</a>
				) : (
					<span />
				)}
				{adjacent.next ? (
					<a href={`/posts/${adjacent.next.slug}/`}>
						<small>下一篇</small>
						{adjacent.next.title}
					</a>
				) : null}
			</div>
			{related.length > 0 ? (
				<div>
					<h2>相关文章</h2>
					<ul>
						{related.map((post) => (
							<li key={post.slug}>
								<a href={`/posts/${post.slug}/`}>
									{post.title}
								</a>
							</li>
						))}
					</ul>
				</div>
			) : null}
		</section>
	);
}
