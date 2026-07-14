type MarkdownProps = {
	html: string;
};

export function Markdown({ html }: MarkdownProps) {
	return (
		<div
			className="post-content"
			// `html` is produced by our server-only Unified pipeline. Raw source HTML
			// is disabled there, so article authors cannot inject executable markup.
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}
