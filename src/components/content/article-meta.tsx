type ArticleMetaProps = {
	category?: string;
	characters: number;
	minutes: number;
	published: Date;
	tags: string[];
	updated?: Date;
	words: number;
};

const formatter = new Intl.DateTimeFormat("zh-CN", {
	dateStyle: "long",
	timeZone: "UTC",
});

export function ArticleMeta(props: ArticleMetaProps) {
	return (
		<div className="article-meta">
			<span>
				发布于{" "}
				<time dateTime={props.published.toISOString()}>
					{formatter.format(props.published)}
				</time>
			</span>
			{props.updated ? (
				<span>
					更新于{" "}
					<time dateTime={props.updated.toISOString()}>
						{formatter.format(props.updated)}
					</time>
				</span>
			) : null}
			<span>约 {props.minutes} 分钟</span>
			<span>
				{props.characters} 字符 · {props.words} 单词
			</span>
			{props.category ? (
				<a
					href={`/categories/${encodeURIComponent(getTaxonomySlug(props.category))}/`}
				>
					{props.category}
				</a>
			) : null}
			{props.tags.map((tag) => (
				<a
					href={`/tags/${encodeURIComponent(getTaxonomySlug(tag))}/`}
					key={tag}
				>
					#{tag}
				</a>
			))}
		</div>
	);
}
import { getTaxonomySlug } from "@/lib/content/taxonomy";
