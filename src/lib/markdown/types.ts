export type Heading = {
	depth: 2 | 3 | 4;
	id: string;
	text: string;
};

export type RenderedMarkdown = {
	hasMermaid: boolean;
	headings: Heading[];
	html: string;
};
