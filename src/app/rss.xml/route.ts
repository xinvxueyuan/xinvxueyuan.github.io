import { serializeRss } from "@/lib/content/feed";
import { getPublishedPosts } from "@/lib/content/posts";

export async function GET(): Promise<Response> {
	return new Response(await serializeRss(await getPublishedPosts()), {
		headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
	});
}
