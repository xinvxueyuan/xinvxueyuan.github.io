import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { PageIntro } from "@/components/showcase/page-intro";
import { albums } from "@/lib/showcase/content";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
	alternates: { canonical: absoluteUrl("/albums/") },
	description: "浏览 xinvStar 明确整理并公开的图片相册。",
	title: "相册",
};

export default function AlbumsPage() {
	return (
		<main className="page-shell" id="main-content" tabIndex={-1}>
			<PageIntro
				description="每个相册都使用明确的图片清单，不依赖运行时目录扫描。"
				title="相册"
			/>
			<ul>
				{albums.map((album) => (
					<li key={album.slug}>
						<article>
							<Link href={`/albums/${album.slug}/`}>
								<Image
									alt={album.cover.alt}
									height={album.cover.height}
									sizes="(max-width: 48rem) 100vw, 48rem"
									src={album.cover.src}
									width={album.cover.width}
								/>
								<h2>{album.title}</h2>
							</Link>
							<p>{album.description}</p>
						</article>
					</li>
				))}
			</ul>
		</main>
	);
}
