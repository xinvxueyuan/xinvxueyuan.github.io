export type ShowcaseImage = {
	src: string;
	alt: string;
	width: number;
	height: number;
};

export type ExternalLink = {
	label: string;
	href: `https://${string}`;
};

export type Profile = {
	name: string;
	headline: string;
	introduction: string;
	links: readonly ExternalLink[];
};

export type ProjectStatus = "completed" | "in-progress" | "planned";

export type Project = {
	slug: string;
	title: string;
	description: string;
	status: ProjectStatus;
	technologies: readonly string[];
	image?: ShowcaseImage;
	links: readonly ExternalLink[];
};

export type TimelineKind = "project" | "work" | "education" | "achievement";

export type TimelineEntry = {
	id: string;
	title: string;
	description: string;
	kind: TimelineKind;
	startDate: string;
	endDate?: string;
	links: readonly ExternalLink[];
};

export type Skill = {
	id: string;
	name: string;
	category: "frontend" | "backend" | "database" | "tooling";
	evidence: readonly string[];
};

export type Friend = {
	id: string;
	name: string;
	description: string;
	link: ExternalLink;
	image?: ShowcaseImage;
	tags: readonly string[];
};

export type Device = {
	id: string;
	name: string;
	category: "phone" | "network" | "computer" | "other";
	specs: string;
	description: string;
	image: ShowcaseImage;
	links: readonly ExternalLink[];
};

export type DiaryEntry = {
	id: string;
	content: string;
	publishedAt: string;
	mood?: string;
	location?: string;
	images: readonly ShowcaseImage[];
	tags: readonly string[];
};

export type AlbumPhoto = {
	id: string;
	image: ShowcaseImage;
};

export type Album = {
	slug: string;
	title: string;
	description: string;
	date: string;
	location?: string;
	tags: readonly string[];
	cover: ShowcaseImage;
	photos: readonly AlbumPhoto[];
};
