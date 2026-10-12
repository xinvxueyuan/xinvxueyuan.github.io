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

test("search filters by title or content and sorts by dates", async ({ page }) => {
	await page.goto("/search/");
	const scopeGroup = page.getByRole("group", { name: "搜索范围" });
	const allScopesButton = scopeGroup.getByRole("button", { name: "全部范围" });
	const titleCheckbox = scopeGroup.getByRole("checkbox", { name: "按标题" });
	const contentCheckbox = scopeGroup.getByRole("checkbox", { name: "按内容" });
	await expect(allScopesButton).toHaveAttribute("aria-pressed", "true");
	await expect(
		scopeGroup.getByRole("checkbox", { name: "全部" }),
	).toHaveCount(0);
	await expect(titleCheckbox).not.toBeChecked();
	await expect(contentCheckbox).not.toBeChecked();
	await allScopesButton.click();
	await expect(allScopesButton).toHaveAttribute("aria-pressed", "true");

	const query = page.getByLabel("关键词");
	const kubernetesArticle = page.getByRole("link", {
		name: /Kubernetes 入门到实战/,
	});
	await query.fill("Kubernetes 入门到实战");
	await titleCheckbox.click();
	await expect(allScopesButton).toHaveAttribute("aria-pressed", "false");
	await expect(titleCheckbox).toBeChecked();
	await expect(contentCheckbox).not.toBeChecked();
	await expect(kubernetesArticle).toBeVisible();
	await contentCheckbox.click();
	await expect(titleCheckbox).toBeChecked();
	await expect(contentCheckbox).toBeChecked();
	await expect(allScopesButton).toHaveAttribute("aria-pressed", "false");
	await expect(kubernetesArticle).toBeVisible();
	await titleCheckbox.click();
	await expect(titleCheckbox).not.toBeChecked();
	await expect(contentCheckbox).toBeChecked();
	await query.fill("事实标准");
	await expect(kubernetesArticle).toBeVisible();
	await contentCheckbox.click();
	await expect(allScopesButton).toHaveAttribute("aria-pressed", "true");
	await expect(titleCheckbox).not.toBeChecked();
	await expect(contentCheckbox).not.toBeChecked();
	await expect(kubernetesArticle).toBeVisible();

	await query.fill("实战");
	const resultLinks = page.locator(
		'main#main-content section[role="search"] > ul > li > a',
	);
	await expect.poll(() => resultLinks.count()).toBeGreaterThan(1);
	const chooseOption = async (label: string, option: string): Promise<void> => {
		const select = page.getByRole("combobox", { name: label });
		await select.click();
		await page.getByRole("option", { name: option, exact: true }).click();
	};
	await chooseOption("按时间", "发布时间");
	await chooseOption("顺序", "正序（从早到晚）");
	await expect(resultLinks.first()).toHaveAttribute("href", /2025-09-28-rust-/);
	await chooseOption("顺序", "倒序（从新到旧）");
	await expect(resultLinks.first()).toHaveAttribute("href", /2026-07-07/);
	await chooseOption("按时间", "更新时间");
	await chooseOption("顺序", "正序（从早到晚）");
	await expect(resultLinks.first()).toHaveAttribute("href", /2025-09-28-rust-/);
	await chooseOption("顺序", "倒序（从新到旧）");
	await expect(resultLinks.first()).toHaveAttribute("href", /2026-07-07/);
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
	await page.goto("/posts/markdown-tutorial/", {
		waitUntil: "domcontentloaded",
	});
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
