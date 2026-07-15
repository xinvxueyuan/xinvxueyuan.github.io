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
	cover?: ShowcaseImage;
	links: readonly ExternalLink[];
	featured: boolean;
};

export type TimelineKind = "project" | "work" | "education" | "achievement";

export type TimelineEntry = {
	id: string;
	title: string;
	description: string;
	kind: TimelineKind;
	date: string;
	links?: readonly ExternalLink[];
};

export type Skill = {
	id: string;
	name: string;
	group: "frontend" | "backend" | "database" | "tooling";
	summary?: string;
};

export type Friend = {
	id: string;
	name: string;
	description: string;
	url: ExternalLink;
	avatar?: ShowcaseImage;
	tags: readonly string[];
};

export type Device = {
	id: string;
	name: string;
	category: "phone" | "network" | "computer" | "other";
	specs: string;
	description: string;
	image: ShowcaseImage;
	url?: ExternalLink;
};

export type DiaryEntry = {
	id: string;
	body: string;
	publishedAt: string;
	mood?: string;
	location?: string;
	images: readonly ShowcaseImage[];
	tags: readonly string[];
};

export type AlbumPhoto = ShowcaseImage & {
	title?: string;
	description?: string;
	date?: string;
	location?: string;
};

export type Album = {
	slug: string;
	title: string;
	description: string;
	date?: string;
	location?: string;
	tags: readonly string[];
	cover: ShowcaseImage;
	photos: readonly AlbumPhoto[];
};
