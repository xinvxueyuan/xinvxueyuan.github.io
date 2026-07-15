import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";

import { getPost, getPublishedPosts } from "@/lib/content/posts";
import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.title} article cover`;
export const contentType = "image/png";
export const size = { height: 630, width: 1200 };
export const backgroundImageAsset =
	"public/assets/brand/xinvstar-night-orbit-og.png";

type OpenGraphImageProps = {
	params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
	return (await getPublishedPosts()).map((post) => ({ slug: post.slug }));
}

export default async function OpenGraphImage({ params }: OpenGraphImageProps) {
	const { slug } = await params;
	const post = await getPost(slug);
	if (!post) notFound();
	const backgroundImageBuffer = await readFile(
		path.join(process.cwd(), backgroundImageAsset),
	);
	const backgroundImage = new Uint8Array(backgroundImageBuffer).buffer;

	return new ImageResponse(
		(
			<div
				style={{
					backgroundColor: "#080b18",
					color: "#fff8e8",
					display: "flex",
					flexDirection: "column",
					height: "100%",
					justifyContent: "space-between",
					padding: "72px 84px",
					width: "100%",
				}}
			>
				<img
					alt=""
					src={backgroundImage as unknown as string}
					style={{
						height: "100%",
						left: 0,
						objectFit: "cover",
						opacity: 0.42,
						position: "absolute",
						top: 0,
						width: "100%",
					}}
				/>
				<div
					style={{
						background:
							"linear-gradient(90deg, rgba(8, 11, 24, 0.98), rgba(8, 11, 24, 0.28))",
						display: "flex",
						inset: 0,
						position: "absolute",
					}}
				/>
				<div
					style={{
						color: "#f2bd71",
						display: "flex",
						fontSize: 30,
						letterSpacing: "0.12em",
						position: "relative",
					}}
				>
					{siteConfig.title}
				</div>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 28,
						position: "relative",
					}}
				>
					<div
						style={{
							display: "flex",
							fontSize: post.title.length > 28 ? 58 : 68,
							fontWeight: 700,
							lineHeight: 1.15,
							maxWidth: 940,
						}}
					>
						{post.title}
					</div>
					<div style={{ color: "#d4d7e4", display: "flex", fontSize: 28 }}>
						{post.published.toISOString().slice(0, 10)} · 夜航问讯站
					</div>
				</div>
			</div>
		),
		{ ...size },
	);
}
