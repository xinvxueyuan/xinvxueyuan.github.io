import "photoswipe/style.css";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AlbumLightbox } from "@/components/interactive/album-lightbox";
import { albums, getAlbum } from "@/lib/showcase/content";
import { absoluteUrl } from "@/lib/site";

type AlbumPageProps = {
	params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
	return albums.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
	params,
}: AlbumPageProps): Promise<Metadata> {
	const { slug } = await params;
	const album = getAlbum(slug);
	if (!album) notFound();

	return {
		alternates: { canonical: absoluteUrl(`/albums/${album.slug}/`) },
		description: album.description,
		title: album.title,
	};
}

export default async function AlbumPage({ params }: AlbumPageProps) {
	const { slug } = await params;
	const album = getAlbum(slug);
	if (!album) notFound();

	const galleryId = `album-gallery-${album.slug}`;

	return (
		<main
			className="page-shell showcase-page showcase-page--album"
			id="main-content"
			tabIndex={-1}
		>
			<header className="section-heading">
				<Link href="/albums/">返回相册</Link>
				<h1>{album.title}</h1>
				<p>{album.description}</p>
			</header>
			<div data-album-gallery id={galleryId}>
				{album.photos.map(({ id, image }) => (
					<a
						data-pswp-height={image.height}
						data-pswp-width={image.width}
						href={image.src}
						key={id}
					>
						<Image
							alt={image.alt}
							height={image.height}
							sizes="(max-width: 48rem) 50vw, 24rem"
							src={image.src}
							width={image.width}
						/>
					</a>
				))}
			</div>
			<AlbumLightbox galleryId={galleryId} />
		</main>
	);
}
