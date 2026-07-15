import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("home exposes the night-navigation shell and keyboard landmarks", async ({
	page,
}) => {
	await page.goto("/");

	await expect(page.locator("header.site-header")).toBeVisible();
	await expect(page.locator("nav")).toHaveAccessibleName("主导航");
	await expect(page.locator("main#main-content")).toBeVisible();
	await expect(page.locator("footer.site-footer")).toBeVisible();
	await expect(
		page.getByRole("heading", { level: 1, name: "夜航问讯站" }),
	).toBeVisible();
	await expect(
		page.getByRole("img", { name: "琥珀星轨连接夜空中的知识节点" }),
	).toBeVisible();

	await page.keyboard.press("Tab");
	const skipLink = page.getByRole("link", { name: "跳到主要内容" });
	await expect(skipLink).toBeFocused();
	await skipLink.press("Enter");
	await expect(page.locator("main#main-content")).toBeFocused();
});

test("theme choice persists without changing the content flow", async ({
	page,
}) => {
	await page.goto("/");
	const toggle = page.getByRole("button", { name: "切换到深色主题" });
	await expect(toggle).toBeVisible();
	await toggle.click();
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
	await expect(
		page.getByRole("button", { name: "切换到浅色主题" }),
	).toBeVisible();
	await expect
		.poll(() => page.evaluate(() => localStorage.getItem("xinvstar-theme")))
		.toBe("dark");

	await page.reload();
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("theme stays operable when browser storage is unavailable", async ({
	page,
}) => {
	await page.addInitScript(() => {
		Storage.prototype.getItem = () => {
			throw new Error("storage disabled");
		};
		Storage.prototype.setItem = () => {
			throw new Error("storage disabled");
		};
	});
	await page.goto("/");
	const toggle = page.getByRole("button", { name: "切换到深色主题" });
	await expect(toggle).toBeVisible();
	await toggle.click();
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
	await expect(
		page.getByRole("button", { name: "切换到浅色主题" }),
	).toBeVisible();
});

test("dark theme also switches highlighted code colors", async ({ page }) => {
	await page.goto("/posts/markdown-tutorial/");
	const codeBlock = page.locator(".shiki").first();
	await expect(codeBlock).toBeVisible();
	await page.getByRole("button", { name: "切换到深色主题" }).click();

	const colors = await codeBlock.evaluate((element) => {
		const styles = getComputedStyle(element);
		return {
			actual: styles.backgroundColor,
			dark: styles.getPropertyValue("--shiki-dark-bg"),
		};
	});
	expect(colors.dark).not.toBe("");
	expect(colors.actual).not.toBe("rgb(255, 255, 255)");
});

test("article math styles are available at the global layout boundary", async ({
	page,
}) => {
	await page.goto("/posts/markdown-tutorial/");
	const hasKatexStyles = await page.evaluate(() =>
		[...document.styleSheets].some((sheet) => {
			try {
				return [...sheet.cssRules].some((rule) =>
					rule.cssText.includes(".katex"),
				);
			} catch {
				return false;
			}
		}),
	);
	expect(hasKatexStyles).toBe(true);
});

for (const viewport of [
	{ height: 800, label: "mobile", width: 360 },
	{ height: 1024, label: "tablet", width: 768 },
	{ height: 900, label: "desktop", width: 1440 },
]) {
	test(`${viewport.label} layout has no horizontal overflow`, async ({
		page,
	}) => {
		await page.setViewportSize({
			height: viewport.height,
			width: viewport.width,
		});
		await page.goto("/");
		await expect
			.poll(() =>
				page.evaluate(() => ({
					client: document.documentElement.clientWidth,
					scroll: document.documentElement.scrollWidth,
				})),
			)
			.toEqual({ client: viewport.width, scroll: viewport.width });

		if (viewport.width === 360) {
			const taxonomyLinkRights = await page
				.locator(".post-card__taxonomy a")
				.evaluateAll((links) =>
					links.map((link) => link.getBoundingClientRect().right),
				);
			expect(
				taxonomyLinkRights.every((right) => right <= viewport.width),
			).toBe(true);
		}

		const toggleBox = await page
			.getByRole("button", { name: /切换到/ })
			.boundingBox();
		expect(toggleBox?.height).toBeGreaterThanOrEqual(44);
		expect(toggleBox?.width).toBeGreaterThanOrEqual(44);
	});
}

test("an article preserves a focused reading measure", async ({ page }) => {
	await page.goto("/");
	const firstPost = page.locator("[data-post-card] a").first();
	await expect(firstPost).toBeVisible();
	await firstPost.click();

	await expect(page.locator("main#main-content article")).toBeVisible();
	await expect(page.locator(".post-content")).toBeVisible();
	await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
	const articleMeasure = await page
		.locator(".post-content")
		.evaluate((element) => {
			const probe = document.createElement("span");
			probe.style.cssText = "position:absolute;width:1ch";
			element.append(probe);
			const oneCharacter = probe.getBoundingClientRect().width;
			probe.remove();
			return (
				Number.parseFloat(getComputedStyle(element).maxWidth) /
				oneCharacter
			);
		});
	expect(articleMeasure).toBeGreaterThanOrEqual(65);
	expect(articleMeasure).toBeLessThanOrEqual(75);
});

for (const viewport of [
	{ height: 800, width: 360 },
	{ height: 1024, width: 768 },
	{ height: 900, width: 1440 },
]) {
	test(`article reading tools fit at ${viewport.width}px`, async ({
		page,
	}) => {
		await page.setViewportSize(viewport);
		await page.goto("/posts/markdown-tutorial/", {
			waitUntil: "domcontentloaded",
		});
		await expect(
			page.getByRole("navigation", { name: "文章目录" }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "分享文章" }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "复制" }).first(),
		).toBeVisible();
		await expect(page.locator(".comments iframe")).toHaveCount(0);
		await expect
			.poll(() =>
				page.evaluate(() => document.documentElement.scrollWidth),
			)
			.toBe(viewport.width);
		await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
	});
}

test("Mermaid enhancement preserves readable source when rendering cannot run", async ({
	page,
}) => {
	await page.route("**/*mermaid*", (route) => route.abort());
	await page.goto("/posts/markdown-mermaid/");
	const source = page.locator("pre[data-mermaid-source]").first();
	await expect(source).toBeVisible();
	await expect(source).toContainText("graph TD");
	const diagramOrSource = page.locator(
		".mermaid-diagram, pre[data-mermaid-source]:not([hidden])",
	);
	await expect(diagramOrSource.first()).toBeVisible();
});

test("Mermaid redraws when the site theme changes", async ({ page }) => {
	await page.goto("/posts/markdown-mermaid/");
	const diagram = page.locator(".mermaid-diagram").first();
	await expect(diagram).toHaveAttribute("data-mermaid-theme", "default");
	await page.getByRole("button", { name: "切换到深色主题" }).click();
	await expect(diagram).toHaveAttribute("data-mermaid-theme", "dark");
});

test("long code collapse controls expose stable accessible state", async ({
	page,
}) => {
	await page.goto("/posts/markdown-tutorial/");
	const collapse = page.getByRole("button", { name: "折叠" }).first();
	await expect(collapse).toHaveAttribute("aria-expanded", "true");
	const blockId = await collapse.getAttribute("aria-controls");
	expect(blockId).toMatch(/^article-content-code-/u);
	const block = page.locator(`#${blockId}`);
	const stableCollapse = page.locator(
		`button[data-code-action="collapse"][aria-controls="${blockId}"]`,
	);
	await expect(block).toBeVisible();
	await collapse.click();
	await expect(stableCollapse).toHaveAttribute("aria-expanded", "false");
	await expect(block).toHaveClass(/is-collapsed/u);
	await stableCollapse.click();
	await expect(stableCollapse).toHaveAttribute("aria-expanded", "true");
});

test("video article exposes safe provider links without iframes", async ({
	page,
}) => {
	await page.goto("/posts/video/");
	await expect(
		page.getByRole("link", { name: /在 youtube 观看视频/iu }),
	).toHaveAttribute("href", "https://www.youtube.com/watch?v=5gIf0_xpFPI");
	await expect(
		page.getByRole("link", { name: /在 bilibili 观看视频/iu }),
	).toHaveAttribute("href", "https://www.bilibili.com/video/BV1fK4y1s7Qf");
	await expect(page.locator("main#main-content iframe")).toHaveCount(0);
});

test("unknown posts return a true 404 with a recovery path", async ({
	page,
}) => {
	const response = await page.goto("/posts/this-post-does-not-exist/");
	expect(response?.status()).toBe(404);
	await expect(
		page.getByRole("heading", { level: 1, name: "这里没有这篇文章" }),
	).toBeVisible();
	await expect(page.getByRole("link", { name: "返回首页" })).toHaveAttribute(
		"href",
		"/",
	);
});

test("home and article have no serious or critical accessibility violations", async ({
	page,
}) => {
	await page.goto("/");
	const homeResults = await new AxeBuilder({ page })
		.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
		.analyze();
	expect(
		homeResults.violations.filter(
			({ impact }) => impact === "critical" || impact === "serious",
		),
	).toEqual([]);

	await page.locator("[data-post-card] a").first().click();
	const articleResults = await new AxeBuilder({ page })
		.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
		.analyze();
	expect(
		articleResults.violations.filter(
			({ impact }) => impact === "critical" || impact === "serious",
		),
	).toEqual([]);
});
