import { describe, expect, it } from "vitest";

import { getReadingStats } from "../../src/lib/content/reading";

describe("reading stats", () => {
	it("counts CJK characters and whitespace-delimited words separately", () => {
		expect(getReadingStats("中文正文 English words")).toEqual({
			characters: 4,
			minutes: 1,
			words: 2,
		});
	});

	it("returns zero minutes for empty content", () => {
		expect(getReadingStats(" \n\t ")).toEqual({
			characters: 0,
			minutes: 0,
			words: 0,
		});
	});
});
