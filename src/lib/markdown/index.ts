import rehypeShiki, { type RehypeShikiOptions } from "@shikijs/rehype";
import type { Root } from "hast";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { type Plugin, unified } from "unified";
import { visit } from "unist-util-visit";

import { rehypeSanitizeMarkdownUrls } from "../markdown-urls";
import { rehypeCodeMetadata } from "./code-blocks";
import { remarkDirectiveWhitelist } from "./directives";
import { rehypeCollectHeadings } from "./headings";
import type { RenderedMarkdown } from "./types";

export type { Heading, RenderedMarkdown } from "./types";

const shikiOptions: RehypeShikiOptions = {
	fallbackLanguage: "text",
	langs: [
		"bash",
		"css",
		"dockerfile",
		"go",
		"html",
		"javascript",
		"json",
		"jsx",
		"markdown",
		"python",
		"rust",
		"shell",
		"sql",
		"tsx",
		"typescript",
		"yaml",
	],
	lazy: true,
	parseMetaString(metaString) {
		const match = /(?:^|\s)title=(?:"([^"]+)"|'([^']+)'|([^\s]+))/u.exec(
			metaString,
		);
		const title = match?.[1] ?? match?.[2] ?? match?.[3];
		return title && title.length <= 160 && !/[\u0000-\u001f]/u.test(title)
			? { title }
			: {};
	},
	themes: { dark: "github-dark", light: "github-light" },
	transformers: [
		{
			name: "blog-code-metadata",
			pre(node) {
				const language = String(this.options.lang || "text");
				const title = (this.options.meta as { title?: unknown } | undefined)
					?.title;
				node.properties.dataCodeBlock = "";
				node.properties.dataCodeLanguage = language;
				if (typeof title === "string") node.properties.dataCodeTitle = title;
				if (language === "mermaid") {
					node.properties.dataMermaidSource = this.source;
				}
			},
		},
	],
};

const rehypeReservePageTitle: Plugin<[], Root> = () => (tree) => {
	visit(tree, "element", (node) => {
		if (node.tagName === "h1") node.tagName = "h2";
	});
};

const processor = unified()
	.use(remarkParse)
	.use(remarkGfm)
	.use(remarkMath)
	.use(remarkDirective)
	.use(remarkDirectiveWhitelist)
	// Raw HTML stays disabled because allowDangerousHtml is never enabled.
	.use(remarkRehype)
	.use(rehypeReservePageTitle)
	.use(rehypeSlug)
	.use(rehypeCollectHeadings)
	// rehype-katex v7 owns the fail-open retry and intentionally omits
	// `throwOnError` from its public options type.
	.use(rehypeKatex)
	.use(rehypeCodeMetadata)
	.use(rehypeShiki, shikiOptions)
	.use(rehypeSanitizeMarkdownUrls)
	.use(rehypeStringify);

export async function renderMarkdown(body: string): Promise<RenderedMarkdown> {
	const file = await processor.process(body);
	return {
		hasMermaid: file.data.hasMermaid === true,
		headings: (file.data.headings ?? []) as RenderedMarkdown["headings"],
		html: String(file),
	};
}
