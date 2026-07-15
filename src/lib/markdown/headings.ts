import type { Element, Root, RootContent } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

import type { Heading } from "./types";

function textContent(node: RootContent): string {
	if (node.type === "text") return node.value;
	if ("children" in node) return node.children.map(textContent).join("");
	return "";
}

export const rehypeCollectHeadings: Plugin<[], Root> = () => (tree, file) => {
	const headings: Heading[] = [];
	visit(tree, "element", (node: Element) => {
		if (!/^h[234]$/u.test(node.tagName)) return;
		const id = node.properties.id;
		if (typeof id !== "string") return;
		headings.push({
			depth: Number(node.tagName.slice(1)) as Heading["depth"],
			id,
			text: node.children.map(textContent).join("").trim(),
		});
	});
	file.data.headings = headings;
};
