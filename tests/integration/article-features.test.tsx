import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ArticleMeta } from "@/components/content/article-meta";
import { ArticleRecommendations } from "@/components/content/article-recommendations";
import { ArticleToc } from "@/components/content/article-toc";
import { Comments } from "@/components/interactive/comments";
import { ShareActions } from "@/components/interactive/share-actions";

const summary = (slug: string, title: string) => ({
	category: "工程",
	comment: true,
	draft: false,
	published: new Date("2026-07-14T00:00:00.000Z"),
	slug,
	sourcePath: `${slug}.md`,
	tags: ["Next.js"],
	title,
});

describe("article reading furniture", () => {
	it("renders a semantic no-JS table of contents", () => {
		const html = renderToStaticMarkup(
			<ArticleToc
				headings={[
					{ depth: 2, id: "start", text: "开始" },
					{ depth: 3, id: "details", text: "细节" },
				]}
			/>,
		);

		expect(html).toContain('<nav aria-label="文章目录"');
		expect(html).toContain("<ol");
		expect(html).toContain('href="#start"');
		expect(html).toContain('aria-current="location"');
	});

	it("renders dates, taxonomy and reading statistics as ordinary links/text", () => {
		const html = renderToStaticMarkup(
			<ArticleMeta
				category="工程"
				characters={1234}
				minutes={5}
				published={new Date("2026-07-14T00:00:00.000Z")}
				tags={["Next.js", "React"]}
				updated={new Date("2026-07-15T00:00:00.000Z")}
				words={12}
			/>,
		);

		expect(html).toContain("发布于");
		expect(html).toContain("更新于");
		expect(html).toContain("约 5 分钟");
		expect(html).toContain("1234 字符 · 12 单词");
		expect(html).toContain('href="/categories/%E5%B7%A5%E7%A8%8B/"');
		expect(html).toContain('href="/tags/Next.js/"');
	});

	it("keeps related and adjacent navigation readable without JavaScript", () => {
		const html = renderToStaticMarkup(
			<ArticleRecommendations
				adjacent={{
					next: summary("newer", "下一篇"),
					previous: summary("older", "上一篇"),
				}}
				related={[summary("related", "相关文章")]}
			/>,
		);

		expect(html).toContain('href="/posts/older/"');
		expect(html).toContain('href="/posts/newer/"');
		expect(html).toContain('href="/posts/related/"');
	});

	it("renders share fallback markup and omits Giscus when unconfigured", () => {
		const share = renderToStaticMarkup(
			<ShareActions
				canonicalUrl="https://example.com/posts/example/"
				title="文章"
			/>,
		);
		const comments = renderToStaticMarkup(
			<Comments enabled={true} pathname="/posts/example/" />,
		);

		expect(share).toContain('value="https://example.com/posts/example/"');
		expect(share).toContain("分享文章");
		expect(comments).toContain("评论尚未配置");
		expect(comments).not.toContain("iframe");
	});

	it("renders an explicit disabled-comments state", () => {
		const html = renderToStaticMarkup(
			<Comments enabled={false} pathname="/posts/example/" />,
		);
		expect(html).toContain("本文未开放评论");
	});
});
