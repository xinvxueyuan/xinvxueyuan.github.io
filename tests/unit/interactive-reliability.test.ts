import { describe, expect, it, vi } from "vitest";

import { createRetryableLoader } from "../../src/components/interactive/search";
import { updateVisibleHeadingIds } from "../../src/components/interactive/toc-highlight";

describe("interactive enhancement reliability", () => {
	it("retries the Pagefind import after an initial rejection", async () => {
		const engine = { search: vi.fn() };
		const importer = vi
			.fn<() => Promise<typeof engine>>()
			.mockRejectedValueOnce(new Error("offline"))
			.mockResolvedValueOnce(engine);
		const load = createRetryableLoader(importer);

		await expect(load()).rejects.toThrow("offline");
		await expect(load()).resolves.toBe(engine);
		expect(importer).toHaveBeenCalledTimes(2);
	});

	it("retains headings omitted from later observer callback batches", () => {
		const visible = new Set<string>();
		updateVisibleHeadingIds(visible, [
			{ id: "first", isIntersecting: true },
			{ id: "second", isIntersecting: true },
		]);
		updateVisibleHeadingIds(visible, [
			{ id: "first", isIntersecting: false },
		]);

		expect([...visible]).toEqual(["second"]);
	});
});
