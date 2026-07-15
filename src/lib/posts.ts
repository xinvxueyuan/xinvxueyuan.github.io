import {
	getAllPosts as contentGetAllPosts,
	getPost as contentGetPost,
	getPublishedPosts as contentGetPublishedPosts,
} from "./content/posts";
import type { GetAllPostsOptions, Post as ContentPost } from "./content/posts";

export type { Cover, GetAllPostsOptions, PostSummary } from "./content/posts";

/**
 * Temporary type surface for consumers that have not migrated to structured
 * covers. The canonical parser does not read or emit the legacy `image` key.
 */
export type Post = ContentPost & { image?: string };

export const getAllPosts: (options?: GetAllPostsOptions) => Promise<Post[]> =
	contentGetAllPosts;

export const getPublishedPosts: () => Promise<Post[]> =
	contentGetPublishedPosts;

export const getPost: (
	slug: string,
	options?: Pick<GetAllPostsOptions, "directory">,
) => Promise<Post | undefined> = contentGetPost;
