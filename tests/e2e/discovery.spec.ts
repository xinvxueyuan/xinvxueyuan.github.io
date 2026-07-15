import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("archive leads through taxonomy to a published post", async ({ page }) => {
	await page.goto("/archive/");
	await expect(page.getByRole("heading", { level: 1, name: "文章归档" })).toBeVisible();
	const taxonomy = page.locator('a[href^="/categories/"]').first();
	await expect(taxonomy).toBeVisible();
	await taxonomy.click();
	await expect(page.locator("[data-post-card]").first()).toBeVisible();
	await page
		.locator("[data-post-card]")
		.first()
		.getByRole("heading", { level: 3 })
		.getByRole("link")
		.click();
	await expect(page.locator("main#main-content article")).toBeVisible();
});

test("search finds a known Chinese phrase", async ({ page }) => {
	await page.goto("/search/");
	await page.getByLabel("关键词").fill("容器化");
	await expect(page.getByText(/找到 \d+ 篇文章/)).toBeVisible();
	await expect(page.getByRole("link", { name: /Docker 容器化最佳实践/ })).toBeVisible();
});

for (const endpoint of ["/rss.xml", "/atom.xml", "/llms.txt", "/llms-full.txt"]) {
	test(`${endpoint} is a readable discovery response`, async ({ request }) => {
		const response = await request.get(endpoint);
		expect(response.status()).toBe(200);
		expect((await response.text()).length).toBeGreaterThan(200);
	});
}

test("article TOC, code copy, share fallback and disabled comments remain usable", async ({
	page,
	context,
}) => {
	await context.grantPermissions(["clipboard-read", "clipboard-write"]);
	await page.addInitScript(() => {
		Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
	});
	await page.goto("/posts/markdown-tutorial/");
	const tocLink = page.getByRole("navigation", { name: "文章目录" }).getByRole("link").first();
	const target = await tocLink.getAttribute("href");
	expect(target).toMatch(/^#/u);
	await tocLink.click();
	await expect(page.locator(target ?? "#missing-toc-target")).toBeAttached();
	await page.getByRole("button", { name: "复制" }).first().click();
	await expect(page.getByRole("button", { name: "已复制" }).first()).toBeVisible();
	await page.getByRole("button", { name: "分享文章" }).click();
	await expect(page.getByText("链接已复制")).toBeVisible();
	await expect(page.getByLabel("评论")).toHaveText("本文未开放评论。");
});

test("discovery pages have no serious accessibility issues", async ({ page }) => {
	for (const path of ["/archive/", "/search/"]) {
		await page.goto(path);
		const results = await new AxeBuilder({ page })
			.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
			.analyze();
		expect(results.violations.filter(({ impact }) => impact === "critical" || impact === "serious")).toEqual([]);
	}
});
