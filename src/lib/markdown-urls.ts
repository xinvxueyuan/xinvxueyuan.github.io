import type { Element, Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

const LINK_PROTOCOLS = new Set(["http", "https", "mailto", "tel"]);
const IMAGE_PROTOCOLS = new Set(["http", "https"]);

function decodePercentEscapes(value: string): string {
	return value.replace(/%[\da-f]{2}/giu, (escape) =>
		String.fromCharCode(Number.parseInt(escape.slice(1), 16)),
	);
}

function schemeOf(value: string): string | undefined {
	const normalized = decodePercentEscapes(value)
		.replace(/[\t\n\r]/gu, "")
		.replace(/^[\u0000-\u0020]+/u, "");
	return /^([a-z][a-z\d+.-]*):/iu.exec(normalized)?.[1].toLowerCase();
}

function hasAllowedProtocol(
	value: unknown,
	allowed: ReadonlySet<string>,
): boolean {
	if (typeof value !== "string") return false;
	const scheme = schemeOf(value);
	return scheme === undefined || allowed.has(scheme);
}

function removeUnsafeUrl(
	node: Element,
	property: "href" | "src",
	allowed: ReadonlySet<string>,
): void {
	if (!hasAllowedProtocol(node.properties[property], allowed)) {
		delete node.properties[property];
	}
}

export const rehypeSanitizeMarkdownUrls: Plugin<[], Root> = () => (tree) => {
	visit(tree, "element", (node) => {
		if (node.tagName === "a") {
			removeUnsafeUrl(node, "href", LINK_PROTOCOLS);
		} else if (node.tagName === "img") {
			removeUnsafeUrl(node, "src", IMAGE_PROTOCOLS);
		}
	});
};
