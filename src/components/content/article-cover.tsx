import type { Cover } from "@/lib/content/posts";

export function ArticleCover({ cover }: { cover?: Cover }) {
	if (!cover) return null;

	return (
		<figure className="article-cover">
			{/* Authored covers have validated dimensions and may be local or remote. */}
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				alt={cover.alt}
				height={cover.height}
				src={cover.src}
				width={cover.width}
			/>
		</figure>
	);
}
