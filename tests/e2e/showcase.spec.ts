import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const showcaseRoutes = [
	"/about/",
	"/projects/",
	"/timeline/",
	"/skills/",
	"/friends/",
	"/devices/",
	"/diary/",
	"/albums/",
] as const;

for (const viewport of [
	{ height: 800, width: 360 },
	{ height: 1024, width: 768 },
	{ height: 900, width: 1440 },
]) {
	test(`all showcase entries fit at ${viewport.width}px with one H1`, async ({
		page,
	}) => {
		await page.setViewportSize(viewport);
		for (const route of showcaseRoutes) {
			await page.goto(route);
			await expect(page.getByRole("heading", { level: 1 })).toHaveCount(
				1,
			);
			await expect
				.poll(() =>
					page.evaluate(() => ({
						client: document.documentElement.clientWidth,
						scroll: document.documentElement.scrollWidth,
					})),
				)
				.toEqual({ client: viewport.width, scroll: viewport.width });
		}
	});
}

test("representative showcase pages have no serious accessibility issues", async ({
	page,
}) => {
	for (const route of ["/about/", "/devices/", "/timeline/"]) {
		await page.goto(route);
		const results = await new AxeBuilder({ page })
			.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
			.analyze();
		expect(
			results.violations.filter(
				({ impact }) => impact === "critical" || impact === "serious",
			),
		).toEqual([]);
	}
});

test("keyboard navigation discovers the approved showcase paths", async ({
	page,
}) => {
	await page.goto("/");
	const tabTo = async (locator: ReturnType<typeof page.getByRole>) => {
		await page.keyboard.press("Tab");
		await expect(locator).toBeFocused();
	};
	const header = page.getByRole("navigation", { name: "主导航" });
	await tabTo(page.getByRole("link", { name: "跳到主要内容" }));
	await tabTo(header.getByRole("link", { name: "xinvStar" }));
	await tabTo(header.getByRole("link", { name: "归档" }));
	await tabTo(header.getByRole("link", { name: "搜索" }));
	const aboutLink = header.getByRole("link", { name: "关于" });
	await tabTo(aboutLink);
	await tabTo(header.getByRole("link", { name: "项目" }));
	await page.keyboard.press("Shift+Tab");
	await expect(aboutLink).toBeFocused();
	await page.keyboard.press("Enter");
	await expect(page).toHaveURL(/\/about\/$/u);
	await page.reload();
	await tabTo(page.getByRole("link", { name: "跳到主要内容" }));
	await tabTo(header.getByRole("link", { name: "xinvStar" }));
	await tabTo(header.getByRole("link", { name: "归档" }));
	await tabTo(header.getByRole("link", { name: "搜索" }));
	await tabTo(header.getByRole("link", { name: "关于" }));
	await tabTo(header.getByRole("link", { name: "项目" }));
	await tabTo(page.getByRole("button", { name: /切换/u }));
	await tabTo(page.getByRole("link", { name: "GitHub" }));
	const showcaseNavigation = page.getByRole("navigation", {
		name: "继续认识我",
	});
	for (const name of [
		"项目",
		"时间线",
		"技能",
		"友链",
		"设备",
		"日记",
		"相册",
	]) {
		const link = showcaseNavigation.getByRole("link", { name });
		await tabTo(link);
	}
});

test("showcase styles do not change taxonomy post-card grid placement", async ({
	page,
}) => {
	for (const route of ["/categories/frontend/", "/tags/css/"]) {
		await page.goto(route);
		const card = page.locator("[data-post-card]").first();
		await expect(card).toBeVisible();
		const placement = await card.evaluate((element) => {
			const date = element.querySelector(".post-card__date");
			if (!date) return null;
			const cardStyle = getComputedStyle(element);
			const dateStyle = getComputedStyle(date);
			return {
				cardDisplay: cardStyle.display,
				dateColumnStart: dateStyle.gridColumnStart,
				dateRowStart: dateStyle.gridRowStart,
			};
		});

		expect(placement).toEqual({
			cardDisplay: "grid",
			dateColumnStart: "auto",
			dateRowStart: "1",
		});
	}
});

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
	const detailStyles = await readResources(
		page,
		await getStylesheetResources(page),
	);
	expect(detailStyles.some((source) => source.includes(".pswp__"))).toBe(
		true,
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

test("non-detail pages never request PhotoSwipe", async ({ page }) => {
	for (const route of ["/", "/about/", "/projects/", "/albums/"]) {
		await page.goto(route);
		await page.waitForLoadState("networkidle");
		const sources = await readResources(
			page,
			await getJavaScriptChunks(page),
		);
		expect(sources.some((source) => source.includes("pswp__"))).toBe(false);
		const styles = await readResources(
			page,
			await getStylesheetResources(page),
		);
		expect(
			styles.some((source) => source.includes(".pswp__")),
			`${route} must not load PhotoSwipe CSS`,
		).toBe(false);
	}
});

test("migrated showcase media is local and returns 200", async ({
	page,
	request,
}) => {
	const media = new Set<string>();
	for (const route of [
		"/projects/",
		"/devices/",
		"/albums/",
		"/albums/acg-example/",
	]) {
		await page.goto(route);
		for (const source of await page
			.locator("img")
			.evaluateAll((images) =>
				images.map((image) => (image as HTMLImageElement).currentSrc),
			)) {
			expect(new URL(source).origin).toBe("http://127.0.0.1:3100");
			media.add(source);
		}
		for (const href of await page
			.locator('[data-album-gallery] a[href^="/images/"]')
			.evaluateAll((links) =>
				links.map((link) => (link as HTMLAnchorElement).href),
			)) {
			media.add(href);
		}
	}

	expect(media.size).toBeGreaterThan(20);
	for (const source of media)
		expect((await request.get(source)).status()).toBe(200);
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

async function getStylesheetResources(page: import("@playwright/test").Page) {
	return page.evaluate(() =>
		Array.from(
			new Set(
				performance
					.getEntriesByType("resource")
					.map((entry) => entry.name)
					.filter((url) => /\.css(?:\?|$)/u.test(url)),
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
