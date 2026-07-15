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

	await context.close();
});

test("album loads PhotoSwipe only on first interaction and restores focus", async ({
	page,
}) => {
	const requests: string[] = [];
	page.on("request", (request) => requests.push(request.url()));

	await page.goto("/albums/acg-example/");
	await page.waitForLoadState("networkidle");
	expect(
		requests.some((url) => url.toLowerCase().includes("photoswipe")),
	).toBe(false);
	const scriptRequestsBeforeClick = requests.filter((url) =>
		url.includes("/_next/static/chunks/"),
	).length;

	const firstPhoto = page.locator("[data-album-gallery] a").first();
	await firstPhoto.click();
	const dialog = page.locator('.pswp[role="dialog"]');
	await expect(dialog).toBeVisible();
	await expect(dialog).toBeFocused();
	expect(
		requests.filter((url) => url.includes("/_next/static/chunks/")).length,
	).toBeGreaterThan(scriptRequestsBeforeClick);

	await page.keyboard.press("Escape");
	await expect(dialog).toBeHidden();
	await expect(firstPhoto).toBeFocused();
});

test("non-album pages never request PhotoSwipe", async ({ page }) => {
	const requests: string[] = [];
	page.on("request", (request) => requests.push(request.url()));

	await page.goto("/projects/");
	await page.waitForLoadState("networkidle");
	expect(
		requests.some((url) => url.toLowerCase().includes("photoswipe")),
	).toBe(false);
});
