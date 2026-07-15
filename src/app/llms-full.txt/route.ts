import { serializeLlmsFull } from "@/lib/content/llms";
import { getPublishedPosts } from "@/lib/content/posts";

export const dynamic = "force-static";

export async function GET(): Promise<Response> {
	return new Response(serializeLlmsFull(await getPublishedPosts()), {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
}
