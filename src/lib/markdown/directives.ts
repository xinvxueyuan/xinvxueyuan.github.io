import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

type DirectiveNode = {
	attributes?: Record<string, string | null | undefined>;
	children: Array<{
		data?: Record<string, unknown>;
		type: string;
	}>;
	data?: Record<string, unknown>;
	name: string;
	type: "containerDirective" | "leafDirective" | "textDirective";
};

const ADMONITIONS = new Set([
	"note",
	"tip",
	"important",
	"warning",
	"caution",
]);
const YOUTUBE_ID = /^[\w-]{11}$/u;
const BILIBILI_ID = /^BV[\dA-Za-z]{10}$/u;
const GITHUB_REPOSITORY = /^[\dA-Za-z](?:[\dA-Za-z-]{0,38})\/[\w.-]{1,100}$/u;

function markAdmonition(node: DirectiveNode): void {
	node.data = {
		hName: "aside",
		hProperties: {
			className: ["admonition", `admonition--${node.name}`],
		},
	};
	const label = node.children.find((child) => child.data?.directiveLabel);
	if (label) {
		label.data = {
			hName: "p",
			hProperties: { className: ["admonition__title"] },
		};
	}
}

function markVideo(node: DirectiveNode): boolean {
	const provider = node.attributes?.provider;
	const id = node.attributes?.id;
	let href: string | undefined;
	if (provider === "youtube" && typeof id === "string" && YOUTUBE_ID.test(id)) {
		href = `https://www.youtube.com/watch?v=${id}`;
	} else if (
		provider === "bilibili" &&
		typeof id === "string" &&
		BILIBILI_ID.test(id)
	) {
		href = `https://www.bilibili.com/video/${id}`;
	}
	if (!href) return false;

	node.data = {
		hName: "a",
		hProperties: {
			className: ["video-embed"],
			href,
		},
		hChildren: [{ type: "text", value: `在 ${provider} 观看视频` }],
	};
	return true;
}

function markGithubCard(node: DirectiveNode): boolean {
	const repository = node.attributes?.repo;
	if (typeof repository !== "string" || !GITHUB_REPOSITORY.test(repository)) {
		return false;
	}
	node.data = {
		hName: "a",
		hProperties: {
			className: ["github-card"],
			href: `https://github.com/${repository}`,
		},
		hChildren: [{ type: "text", value: repository }],
	};
	return true;
}

export const remarkDirectiveWhitelist: Plugin<[], Root> = () => (tree) => {
	visit(tree, (candidate) => {
		if (
			candidate.type !== "containerDirective" &&
			candidate.type !== "leafDirective" &&
			candidate.type !== "textDirective"
		) {
			return;
		}
		const node = candidate as DirectiveNode;
		if (node.type === "containerDirective" && ADMONITIONS.has(node.name)) {
			markAdmonition(node);
		} else if (node.type === "leafDirective" && node.name === "video") {
			markVideo(node);
		} else if (node.type === "leafDirective" && node.name === "github") {
			markGithubCard(node);
		}
	});
};
