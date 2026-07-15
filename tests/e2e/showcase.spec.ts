import { expect, test } from "@playwright/test";

test("album remains useful without JavaScript", async ({ browser }) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();

	await page.goto("/albums/acg-example/");
	const firstPhoto = page.locator("[data-album-gallery] a").first();
	const href = await firstPhoto.getAttribute("href");
	expect(href).toMatch(/^\/images\/albums\//u);
	const response = await context.request.get(href!);
	expect(response.ok()).toBe(true);
	await firstPhoto.click();
	await expect(page).toHaveURL(
		new RegExp(`${href!.replaceAll("/", "\\/")}$`, "u"),
	);

	await context.close();
});

test("album loads PhotoSwipe only on first interaction and restores focus", async ({
	page,
}) => {
	await page.goto("/albums/acg-example/");
	await page.waitForLoadState("networkidle");
	const initialChunks = await getJavaScriptChunks(page);
	const initialSources = await readResources(page, initialChunks);
	expect(initialSources.some((source) => source.includes("pswp__"))).toBe(
		false,
	);

	const firstPhoto = page.locator("[data-album-gallery] a").first();
	await firstPhoto.click();
	const dialog = page.locator('.pswp[role="dialog"]');
	await expect(dialog).toBeVisible();
	await expect(dialog).toBeFocused();
	const chunksAfterClick = await getJavaScriptChunks(page);
	const deferredChunks = chunksAfterClick.filter(
		(url) => !initialChunks.includes(url),
	);
	expect(deferredChunks.length).toBeGreaterThan(0);
	const deferredSources = await readResources(page, deferredChunks);
	expect(deferredSources.some((source) => source.includes("pswp__"))).toBe(
		true,
	);

	await page.keyboard.press("Escape");
	await expect(dialog).toBeHidden();
	await expect(firstPhoto).toBeFocused();
});

test("non-album pages never request PhotoSwipe", async ({ page }) => {
	await page.goto("/projects/");
	await page.waitForLoadState("networkidle");
	const sources = await readResources(page, await getJavaScriptChunks(page));
	expect(sources.some((source) => source.includes("pswp__"))).toBe(false);
});

async function getJavaScriptChunks(page: import("@playwright/test").Page) {
	return page.evaluate(() =>
		Array.from(
			new Set(
				performance
					.getEntriesByType("resource")
					.map((entry) => entry.name)
					.filter(
						(url) =>
							url.includes("/_next/static/chunks/") &&
							/\.js(?:\?|$)/u.test(url),
					),
			),
		),
	);
}

async function readResources(
	page: import("@playwright/test").Page,
	urls: string[],
) {
	return page.evaluate(
		async (resourceUrls) =>
			Promise.all(
				resourceUrls.map(async (url) => (await fetch(url)).text()),
			),
		urls,
	);
}
