import rehypeShiki, { type RehypeShikiOptions } from "@shikijs/rehype";
import type { Root } from "hast";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { type Plugin, unified } from "unified";
import { visit } from "unist-util-visit";

import { rehypeSanitizeMarkdownUrls } from "./markdown-urls";

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
	themes: {
		dark: "github-dark",
		light: "github-light",
	},
};

const rehypeReservePageTitle: Plugin<[], Root> = () => (tree) => {
	visit(tree, "element", (node) => {
		if (node.tagName === "h1") node.tagName = "h2";
	});
};

const processor = unified()
	.use(remarkParse)
	.use(remarkGfm)
	// Raw HTML stays disabled: remark-rehype drops HTML nodes unless
	// `allowDangerousHtml` is explicitly enabled.
	.use(remarkRehype)
	.use(rehypeReservePageTitle)
	.use(rehypeSlug)
	.use(rehypeShiki, shikiOptions)
	.use(rehypeSanitizeMarkdownUrls)
	.use(rehypeStringify);

export async function renderMarkdown(body: string): Promise<string> {
	return String(await processor.process(body));
}
