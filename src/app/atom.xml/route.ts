import { serializeAtom } from "@/lib/content/feed";
import { getPublishedPosts } from "@/lib/content/posts";

export const dynamic = "force-static";

export async function GET(): Promise<Response> {
	return new Response(await serializeAtom(await getPublishedPosts()), {
		headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
	});
}
