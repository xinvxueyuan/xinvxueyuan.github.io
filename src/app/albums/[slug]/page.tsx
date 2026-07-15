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
				{album.photos.map((photo) => (
					<a
						data-pswp-height={photo.height}
						data-pswp-width={photo.width}
						href={photo.src}
						key={photo.src}
					>
						<Image
							alt={photo.alt}
							height={photo.height}
							sizes="(max-width: 48rem) 50vw, 24rem"
							src={photo.src}
							width={photo.width}
						/>
					</a>
				))}
			</div>
			<AlbumLightbox galleryId={galleryId} />
		</main>
	);
}
