export type Cover = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type Post = {
  slug: string;
  sourcePath: string;
  title: string;
  description?: string;
  published: Date;
  updated?: Date;
  draft: boolean;
  tags: string[];
  category?: string;
  cover?: Cover;
  comment: boolean;
  body: string;
};

export type PostSummary = Omit<Post, "body">;

export type GetAllPostsOptions = {
  /** Test seam for exercising the repository against an isolated corpus. */
  directory?: string;
  includeDrafts?: boolean;
};
