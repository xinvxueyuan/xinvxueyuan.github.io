import { renderMarkdown } from "@/lib/markdown";
import { absoluteUrl, siteConfig } from "@/lib/site";

import type { Post } from "./posts";

function publishedInDateOrder(posts: Post[]): Post[] {
	return posts
		.filter((post) => !post.draft)
		.toSorted(
			(left, right) =>
				right.published.getTime() - left.published.getTime() ||
				left.slug.localeCompare(right.slug),
		);
}

function escapeXml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");
}

function cdata(value: string): string {
	return `<![CDATA[${value.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}

function stripFeedEnhancementAttributes(html: string): string {
	return html
		.replace(/\sdata-[\w-]+=(?:"[^"]*"|'[^']*')/gu, "")
		.replace(/\stabindex=(?:"[^"]*"|'[^']*')/gu, "");
}

async function renderedItems(posts: Post[]) {
	return Promise.all(
		publishedInDateOrder(posts).map(async (post) => ({
			html: stripFeedEnhancementAttributes(
				(await renderMarkdown(post.body)).html,
			),
			post,
			url: absoluteUrl(`/posts/${post.slug}/`),
		})),
	);
}

function mostRecentItemDate(
	items: Awaited<ReturnType<typeof renderedItems>>,
): Date | undefined {
	return items.reduce<Date | undefined>((latest, { post }) => {
		const candidate = post.updated ?? post.published;
		return !latest || candidate > latest ? candidate : latest;
	}, undefined);
}

export async function serializeRss(posts: Post[]): Promise<string> {
	const items = await renderedItems(posts);
	const lastBuildDate = mostRecentItemDate(items)?.toUTCString();
	const itemXml = items
		.map(
			({ html, post, url }) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${post.published.toUTCString()}</pubDate>
      <description>${escapeXml(post.description ?? siteConfig.description)}</description>
      <content:encoded>${cdata(html)}</content:encoded>
    </item>`,
		)
		.join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(siteConfig.title)}</title>
    <link>${escapeXml(siteConfig.url)}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>zh-CN</language>${lastBuildDate ? `\n    <lastBuildDate>${lastBuildDate}</lastBuildDate>` : ""}${itemXml ? `\n${itemXml}` : ""}
  </channel>
</rss>
`;
}

export async function serializeAtom(posts: Post[]): Promise<string> {
	const items = await renderedItems(posts);
	const updated = (mostRecentItemDate(items) ?? new Date(0)).toISOString();
	const entryXml = items
		.map(
			({ html, post, url }) => `  <entry>
    <title>${escapeXml(post.title)}</title>
    <link href="${escapeXml(url)}"/>
    <id>${escapeXml(url)}</id>
    <published>${post.published.toISOString()}</published>
    <updated>${(post.updated ?? post.published).toISOString()}</updated>
    <summary>${escapeXml(post.description ?? siteConfig.description)}</summary>
    <content type="html">${escapeXml(html)}</content>
  </entry>`,
		)
		.join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(siteConfig.title)}</title>
  <subtitle>${escapeXml(siteConfig.description)}</subtitle>
  <link href="${escapeXml(siteConfig.url)}"/>
  <link href="${escapeXml(absoluteUrl("/atom.xml"))}" rel="self"/>
  <id>${escapeXml(siteConfig.url)}</id>
  <updated>${updated}</updated>${entryXml ? `\n${entryXml}` : ""}
</feed>
`;
}
