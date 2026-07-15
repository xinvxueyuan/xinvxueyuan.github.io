import { CodeTools } from "./interactive/code-tools";
import { MermaidDiagrams } from "./interactive/mermaid-diagrams";

type MarkdownProps = {
	hasMermaid?: boolean;
	html: string;
};

export function Markdown({ hasMermaid = false, html }: MarkdownProps) {
	const rootId = "article-content";
	return (
		<>
			<div
				className="post-content"
				dangerouslySetInnerHTML={{ __html: html }}
				id={rootId}
			/>
			<CodeTools rootId={rootId} />
			<MermaidDiagrams enabled={hasMermaid} rootId={rootId} />
		</>
	);
}
