import { serializeLlmsIndex } from "@/lib/content/llms";
import { getPublishedPosts } from "@/lib/content/posts";

export async function GET(): Promise<Response> {
	return new Response(serializeLlmsIndex(await getPublishedPosts()), {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
}
