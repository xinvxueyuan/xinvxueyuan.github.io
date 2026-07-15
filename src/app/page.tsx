import type { Metadata } from "next";
import Image from "next/image";

import { PostCard } from "@/components/post-card";
import { getTaxonomy } from "@/lib/content/taxonomy";
import { getPublishedPosts } from "@/lib/posts";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
	alternates: { canonical: siteConfig.url },
	description: siteConfig.description,
	openGraph: {
		description: siteConfig.description,
		images: [absoluteUrl(siteConfig.defaultOgImage)],
		title: siteConfig.title,
		type: "website",
		url: siteConfig.url,
	},
};

export default async function Home() {
	const posts = await getPublishedPosts();
	const taxonomy = getTaxonomy(posts);

	return (
		<main className="page-shell" id="main-content" tabIndex={-1}>
			<section aria-labelledby="hero-title" className="hero">
				<div className="hero__copy">
					<h1 id="hero-title">夜航问讯站</h1>
					<p>{siteConfig.description}。</p>
					<a href="#latest-posts">从最新文章开始</a>
				</div>
				<figure className="hero__visual">
					<Image
						alt="琥珀星轨连接夜空中的知识节点"
						height={1024}
						priority
						sizes="(max-width: 720px) 100vw, 60vw"
						src="/assets/brand/xinvstar-night-orbit.webp"
						width={1536}
					/>
				</figure>
			</section>
			<section aria-labelledby="latest-posts" className="post-index">
				<div className="section-heading">
					<h2 id="latest-posts">最新文章</h2>
					<p>新近写下的技术笔记与学习记录。</p>
				</div>
				<div className="post-list">
					{posts.map((post) => (
						<PostCard
							key={post.slug}
							post={post}
							taxonomy={taxonomy}
						/>
					))}
				</div>
			</section>
		</main>
	);
}
