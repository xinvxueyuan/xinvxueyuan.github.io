import siteIndexJson from "@/generated/site-index.json";
import type { PostSummary } from "@/lib/content/types";
import type { Taxonomy } from "@/lib/content/taxonomy";
import type { Heading } from "@/lib/markdown/types";

export type GeneratedPostSummary = Omit<PostSummary, "published" | "updated"> & {
  published: string;
  updated?: string;
  dataFile: string;
};

export type GeneratedPost = Omit<GeneratedPostSummary, "dataFile"> & {
  body: string;
  html: string;
  headings: Heading[];
  hasMermaid: boolean;
};

export type GeneratedSiteIndex = {
  generatedAt: string;
  sourceFileCount: number;
  publishedCount: number;
  draftCount: number;
  posts: GeneratedPostSummary[];
  taxonomy: Taxonomy;
  routePaths: string[];
};

export const siteIndex = siteIndexJson as GeneratedSiteIndex;
export const posts = siteIndex.posts;
export const taxonomy = siteIndex.taxonomy;

const postModules = import.meta.glob<GeneratedPost>(
  "/src/generated/post-pages/*.json",
  { import: "default" },
);

export async function loadGeneratedPost(
  slug: string,
): Promise<GeneratedPost | undefined> {
  const summary = posts.find((post) => post.slug === slug);
  if (!summary) return undefined;
  const modulePath = `/src/generated/post-pages/${summary.dataFile}`;
  const load = postModules[modulePath];
  return load ? (await load()) as GeneratedPost : undefined;
}

export function postDates<T extends GeneratedPostSummary>(post: T): T & {
  publishedDate: Date;
  updatedDate?: Date;
} {
  return {
    ...post,
    publishedDate: new Date(post.published),
    updatedDate: post.updated ? new Date(post.updated) : undefined,
  };
}
