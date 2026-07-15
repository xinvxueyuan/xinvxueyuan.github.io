export { albums } from "../../content/albums";
export { devices } from "../../content/devices";
export { diary } from "../../content/diary";
export { friends } from "../../content/friends";
export { profile } from "../../content/profile";
export { projects } from "../../content/projects";
export { skills } from "../../content/skills";
export { timeline } from "../../content/timeline";

import { albums } from "../../content/albums";
import type { Album } from "./types";

export const getAlbum = (slug: string): Album | undefined =>
	albums.find((album) => album.slug === slug);

export type {
	Album,
	AlbumPhoto,
	Device,
	DiaryEntry,
	ExternalLink,
	Friend,
	Profile,
	Project,
	ShowcaseImage,
	Skill,
	TimelineEntry,
} from "./types";
