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

type AlbumAnchor = {
	href: string;
	click: () => void;
	focus: () => void;
};

type AlbumLightboxControllerOptions = {
	gallery: HTMLElement;
	load?: () => Promise<LoadedPhotoSwipe>;
	navigate: (href: string) => void;
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

export function createAlbumLightboxController({
	gallery,
	load = loadPhotoSwipe,
	navigate,
}: AlbumLightboxControllerOptions) {
	let disposed = false;
	let initializing: Promise<void> | undefined;
	let lightbox: PhotoSwipeLightbox | undefined;

	const open = (anchor: AlbumAnchor): Promise<void> => {
		if (disposed || lightbox) return Promise.resolve();
		if (initializing) return initializing;

		anchor.focus();
		initializing = load()
			.then(({ Lightbox, PhotoSwipe }) => {
				if (disposed) return;

				lightbox = new Lightbox({
					children: "a",
					gallery,
					pswpModule: () => Promise.resolve(PhotoSwipe),
				});
				lightbox.init();
				anchor.click();
			})
			.catch(() => {
				if (!disposed) navigate(anchor.href);
			})
			.finally(() => {
				initializing = undefined;
			});

		return initializing;
	};

	return {
		destroy() {
			disposed = true;
			lightbox?.destroy();
			lightbox = undefined;
		},
		isInitialized: () => lightbox !== undefined,
		open,
	};
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

		const controller = createAlbumLightboxController({
			gallery,
			navigate: (href) => window.location.assign(href),
		});

		const handleClick = (event: MouseEvent) => {
			if (controller.isInitialized() || !isQualifyingClick(event)) return;

			const target = event.target;
			const anchor =
				target instanceof Element
					? target.closest<HTMLAnchorElement>("a")
					: null;
			if (!anchor || !gallery.contains(anchor)) return;

			event.preventDefault();
			void controller.open(anchor);
		};

		gallery.addEventListener("click", handleClick);
		return () => {
			gallery.removeEventListener("click", handleClick);
			controller.destroy();
		};
	}, [galleryId]);

	return null;
}
