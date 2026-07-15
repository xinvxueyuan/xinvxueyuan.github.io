"use client";

import { useEffect } from "react";
import type PhotoSwipe from "photoswipe";
import type PhotoSwipeLightbox from "photoswipe/lightbox";

type PhotoSwipeImporters = {
	lightbox: () => Promise<{ default: typeof PhotoSwipeLightbox }>;
	photoswipe: () => Promise<{ default: typeof PhotoSwipe }>;
};

type LoadedPhotoSwipe = {
	Lightbox: typeof PhotoSwipeLightbox;
	PhotoSwipe: typeof PhotoSwipe;
};

const defaultImporters: PhotoSwipeImporters = {
	lightbox: () => import("photoswipe/lightbox"),
	photoswipe: () => import("photoswipe"),
};

const loadingByImporters = new WeakMap<
	PhotoSwipeImporters,
	Promise<LoadedPhotoSwipe>
>();

export function loadPhotoSwipe(
	importers: PhotoSwipeImporters = defaultImporters,
): Promise<LoadedPhotoSwipe> {
	const cached = loadingByImporters.get(importers);
	if (cached) return cached;

	const loading = Promise.all([importers.lightbox(), importers.photoswipe()])
		.then(([lightboxModule, photoswipeModule]) => ({
			Lightbox: lightboxModule.default,
			PhotoSwipe: photoswipeModule.default,
		}))
		.catch((error: unknown) => {
			if (loadingByImporters.get(importers) === loading) {
				loadingByImporters.delete(importers);
			}
			throw error;
		});

	loadingByImporters.set(importers, loading);
	return loading;
}

const isQualifyingClick = (event: MouseEvent): boolean =>
	event.button === 0 &&
	!event.altKey &&
	!event.ctrlKey &&
	!event.metaKey &&
	!event.shiftKey &&
	!event.defaultPrevented;

export function AlbumLightbox({ galleryId }: { galleryId: string }) {
	useEffect(() => {
		const gallery = document.getElementById(galleryId);
		if (!gallery) return;

		let disposed = false;
		let lightbox: PhotoSwipeLightbox | undefined;

		const handleClick = async (event: MouseEvent) => {
			if (lightbox || !isQualifyingClick(event)) return;

			const target = event.target;
			const anchor =
				target instanceof Element
					? target.closest<HTMLAnchorElement>("a")
					: null;
			if (!anchor || !gallery.contains(anchor)) return;

			event.preventDefault();
			anchor.focus();

			try {
				const { Lightbox, PhotoSwipe } = await loadPhotoSwipe();
				if (disposed) return;

				lightbox = new Lightbox({
					children: "a",
					gallery,
					pswpModule: () => Promise.resolve(PhotoSwipe),
				});
				lightbox.init();
				anchor.click();
			} catch {
				window.location.assign(anchor.href);
			}
		};

		gallery.addEventListener("click", handleClick);
		return () => {
			disposed = true;
			gallery.removeEventListener("click", handleClick);
			lightbox?.destroy();
		};
	}, [galleryId]);

	return null;
}
