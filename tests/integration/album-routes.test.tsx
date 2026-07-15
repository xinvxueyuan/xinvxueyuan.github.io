import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("photoswipe/style.css", () => ({}));

import AlbumsPage, {
	metadata as albumsMetadata,
} from "../../src/app/albums/page";
import AlbumPage, {
	generateMetadata,
	generateStaticParams,
} from "../../src/app/albums/[slug]/page";
import { albums } from "../../src/lib/showcase/content";
import { absoluteUrl } from "../../src/lib/site";

describe("album routes", () => {
	it("renders a static album index with ordinary detail links", () => {
		const html = renderToStaticMarkup(<AlbumsPage />);

		expect(albumsMetadata.alternates?.canonical).toBe(
			absoluteUrl("/albums/"),
		);
		expect(html).toContain('href="/albums/acg-example"');
		expect(html).toContain(albums[0]?.cover.alt);
	});

	it("enumerates and renders every album as a progressive image gallery", async () => {
		expect(await generateStaticParams()).toEqual(
			albums.map(({ slug }) => ({ slug })),
		);

		const album = albums[0]!;
		const html = renderToStaticMarkup(
			await AlbumPage({ params: Promise.resolve({ slug: album.slug }) }),
		);
		const metadata = await generateMetadata({
			params: Promise.resolve({ slug: album.slug }),
		});

		expect(metadata.title).toBe(album.title);
		expect(metadata.description).toBe(album.description);
		expect(metadata.alternates?.canonical).toBe(
			absoluteUrl(`/albums/${album.slug}/`),
		);
		expect(html).toContain('data-pswp-width="');
		expect(html).toContain('data-pswp-height="');
		expect(html).toContain('href="/images/albums/');
		expect(html).toContain(`id="album-gallery-${album.slug}"`);
	});
});
