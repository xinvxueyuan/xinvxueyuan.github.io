import { describe, expect, it, vi } from "vitest";

import { loadPhotoSwipe } from "../../src/components/interactive/album-lightbox";

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
});
