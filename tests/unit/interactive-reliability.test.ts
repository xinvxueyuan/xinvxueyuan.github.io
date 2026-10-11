import { describe, expect, it, vi } from "vitest";

import { createRetryableLoader } from "../../src/lib/retryable-loader";
import { updateVisibleHeadingIds } from "../../src/lib/visible-headings";

describe("Vue interactive enhancement reliability", () => {
  it("retries a rejected Pagefind import and reuses the successful result", async () => {
    const engine = { search: vi.fn() };
    const importer = vi.fn<() => Promise<typeof engine>>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(engine);
    const load = createRetryableLoader(importer);

    await expect(load()).rejects.toThrow("offline");
    await expect(load()).resolves.toBe(engine);
    await expect(load()).resolves.toBe(engine);
    expect(importer).toHaveBeenCalledTimes(2);
  });

  it("single-flights concurrent loading requests", async () => {
    let resolve!: (value: { ready: boolean }) => void;
    const pending = new Promise<{ ready: boolean }>((accept) => { resolve = accept; });
    const importer = vi.fn(() => pending);
    const load = createRetryableLoader(importer);
    const first = load();
    const second = load();
    resolve({ ready: true });

    expect(first).toBe(second);
    await expect(first).resolves.toEqual({ ready: true });
    expect(importer).toHaveBeenCalledOnce();
  });

  it("retains headings omitted from later observer callback batches", () => {
    const visible = new Set<string>();
    updateVisibleHeadingIds(visible, [
      { id: "first", isIntersecting: true },
      { id: "second", isIntersecting: true },
    ]);
    updateVisibleHeadingIds(visible, [{ id: "first", isIntersecting: false }]);

    expect([...visible]).toEqual(["second"]);
  });
});
