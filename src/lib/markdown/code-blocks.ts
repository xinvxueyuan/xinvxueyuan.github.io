import type { Element, Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

function languageOf(code: Element): string {
	const classes = code.properties.className;
	if (!Array.isArray(classes)) return "text";
	const languageClass = classes.find(
		(value) => typeof value === "string" && value.startsWith("language-"),
	);
	return typeof languageClass === "string"
		? languageClass.slice("language-".length)
		: "text";
}

function codeSource(code: Element): string {
	return code.children
		.filter((child) => child.type === "text")
		.map((child) => child.value)
		.join("");
}

export const rehypeCodeMetadata: Plugin<[], Root> = () => (tree, file) => {
	let hasMermaid = false;
	visit(tree, "element", (node: Element) => {
		if (node.tagName !== "pre") return;
		const code = node.children.find(
			(child): child is Element =>
				child.type === "element" && child.tagName === "code",
		);
		if (!code) return;
		const language = languageOf(code);
		node.properties.dataCodeBlock = "";
		node.properties.dataCodeLanguage = language;
		if (language === "mermaid") {
			hasMermaid = true;
			node.properties.dataMermaidSource = codeSource(code);
		}
	});
	file.data.hasMermaid = hasMermaid;
};
