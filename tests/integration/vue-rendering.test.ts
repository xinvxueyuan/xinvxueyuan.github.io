import { createHead } from "@unhead/vue/server";
import { createSSRApp, type Component } from "vue";
import { renderToString } from "vue/server-renderer";
import { createMemoryHistory, createRouter } from "vue-router";
import { describe, expect, it } from "vitest";

import HomeView from "../../src/views/HomeView.vue";
import PostView from "../../src/views/PostView.vue";
import { posts } from "../../src/lib/generated-content";
import { routes } from "../../src/router";

async function renderView(view: Component, url: string): Promise<string> {
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push(url);
  const app = createSSRApp(view);
  app.use(router);
  app.use(createHead());
  return renderToString(app);
}

describe("Vue static page rendering", () => {
  it("renders all published posts on the home page in deterministic order", async () => {
    const html = await renderView(HomeView, "/");
    const positions = posts.map((post) => html.indexOf(post.title));

    expect(html).toMatch(/<h1 id="hero-title">\s*夜航问讯站\s*<\/h1>/u);
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
    expect(html).not.toContain("draft.md");
  });

  it("server-renders article title, body and exactly one h1", async () => {
    const post = posts[0];
    expect(post).toBeDefined();
    const html = await renderView(PostView, `/posts/${encodeURIComponent(post!.slug)}/`);

    expect(html).toContain(`<h1>${post!.title}</h1>`);
    expect(html).toContain('id="post-content"');
    expect(html).toMatch(/<h(?:2|3|4)(?:\s|>)/u);
    expect(html.match(/<h1(?:\s|>)/gu)).toHaveLength(1);
    expect(html).toContain("文章目录");
    expect(html).toContain("分享文章");
  }, 30_000);
});
