import { describe, expect, it, vi } from "vitest";

import {
	createAlbumLightboxController,
	loadPhotoSwipe,
} from "../../src/components/interactive/album-lightbox";

function deferred<T>() {
	let resolve!: (value: T) => void;
	let reject!: (reason: unknown) => void;
	const promise = new Promise<T>((resolvePromise, rejectPromise) => {
		resolve = resolvePromise;
		reject = rejectPromise;
	});
	return { promise, reject, resolve };
}

function anchor(href: string) {
	return {
		href,
		click: vi.fn(),
		focus: vi.fn(),
	};
}

describe("loadPhotoSwipe", () => {
	it("clears a rejected load, retries, and reuses a successful resolution", async () => {
		const Lightbox = class {};
		const PhotoSwipe = class {};
		const importers = {
			lightbox: vi
				.fn()
				.mockRejectedValueOnce(new Error("offline"))
				.mockResolvedValue({ default: Lightbox }),
			photoswipe: vi.fn().mockResolvedValue({ default: PhotoSwipe }),
		};

		await expect(loadPhotoSwipe(importers)).rejects.toThrow("offline");
		const loaded = await loadPhotoSwipe(importers);
		const reused = await loadPhotoSwipe(importers);

		expect(loaded).toBe(reused);
		expect(loaded).toEqual({ Lightbox, PhotoSwipe });
		expect(importers.lightbox).toHaveBeenCalledTimes(2);
		expect(importers.photoswipe).toHaveBeenCalledTimes(2);
	});

	it("single-flights rapid opens and destroys the sole initialized instance", async () => {
		const pending = deferred<Awaited<ReturnType<typeof loadPhotoSwipe>>>();
		const init = vi.fn();
		const destroy = vi.fn();
		let constructCount = 0;
		class Lightbox {
			constructor() {
				constructCount += 1;
			}
			destroy = destroy;
			init = init;
		}
		const first = anchor("https://www.xinvstar.xyz/images/first.webp");
		const second = anchor("https://www.xinvstar.xyz/images/second.webp");
		const controller = createAlbumLightboxController({
			gallery: {} as HTMLElement,
			load: () => pending.promise,
			navigate: vi.fn(),
		});

		const firstOpen = controller.open(first);
		const secondOpen = controller.open(second);
		pending.resolve({
			Lightbox: Lightbox as never,
			PhotoSwipe: class {} as never,
		});
		await Promise.all([firstOpen, secondOpen]);

		expect(constructCount).toBe(1);
		expect(init).toHaveBeenCalledTimes(1);
		expect(first.click).toHaveBeenCalledTimes(1);
		expect(second.click).not.toHaveBeenCalled();
		controller.destroy();
		expect(destroy).toHaveBeenCalledTimes(1);
	});

	it("does not create or navigate when destroyed during a pending load", async () => {
		const pending = deferred<Awaited<ReturnType<typeof loadPhotoSwipe>>>();
		const construct = vi.fn(() => ({ destroy: vi.fn(), init: vi.fn() }));
		const navigate = vi.fn();
		const clicked = anchor("https://www.xinvstar.xyz/images/pending.webp");
		const controller = createAlbumLightboxController({
			gallery: {} as HTMLElement,
			load: () => pending.promise,
			navigate,
		});

		const opening = controller.open(clicked);
		controller.destroy();
		pending.resolve({
			Lightbox: construct as never,
			PhotoSwipe: class {} as never,
		});
		await opening;

		expect(construct).not.toHaveBeenCalled();
		expect(clicked.click).not.toHaveBeenCalled();
		expect(navigate).not.toHaveBeenCalled();
	});

	it("navigates to the original image when loading fails", async () => {
		const navigate = vi.fn();
		const clicked = anchor("https://www.xinvstar.xyz/images/fallback.webp");
		const controller = createAlbumLightboxController({
			gallery: {} as HTMLElement,
			load: () => Promise.reject(new Error("offline")),
			navigate,
		});

		await controller.open(clicked);

		expect(navigate).toHaveBeenCalledOnce();
		expect(navigate).toHaveBeenCalledWith(clicked.href);
	});
});
