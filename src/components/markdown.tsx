type MarkdownProps = {
	html: string;
};

export function Markdown({ html }: MarkdownProps) {
	return (
		<div
			className="post-content"
			// `html` is produced by the project-owned server-only Unified pipeline.
			// Raw source HTML and unapproved directives are disabled there.
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}
