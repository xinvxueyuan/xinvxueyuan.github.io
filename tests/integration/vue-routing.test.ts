import { createMemoryHistory, createRouter } from "vue-router";
import { describe, expect, it } from "vitest";

import { routes } from "../../src/router";

const knownRouteNames = [
  "home",
  "about",
  "albums",
  "album-detail",
  "archive",
  "category",
  "devices",
  "diary",
  "friends",
  "post",
  "projects",
  "search",
  "skills",
  "tag",
  "timeline",
] as const;

describe("Vue Router public URL contract", () => {
  it("keeps all 15 public route templates and a client-side not-found route", () => {
    expect(routes.filter((route) => route.name !== "not-found").map((route) => route.name)).toEqual(knownRouteNames);
    expect(routes.find((route) => route.name === "not-found")?.path).toBe("/:pathMatch(.*)*");
    for (const route of routes.filter((item) => item.name !== "not-found")) {
      if (route.path !== "/") expect(route.path.endsWith("/")).toBe(true);
    }
  });

  it("resolves existing and dynamic public paths without changing URL semantics", () => {
    const router = createRouter({ history: createMemoryHistory(), routes });
    const cases = [
      ["/", "home"],
      ["/about/", "about"],
      ["/albums/", "albums"],
      ["/albums/acg-example/", "album-detail"],
      ["/archive/", "archive"],
      ["/categories/frontend/", "category"],
      ["/posts/markdown-tutorial/", "post"],
      ["/search/", "search"],
      ["/tags/css/", "tag"],
      ["/timeline/", "timeline"],
      ["/this-page-does-not-exist/", "not-found"],
    ] as const;

    for (const [url, name] of cases) {
      expect(router.resolve(url).name, url).toBe(name);
    }
    expect(router.resolve("/categories/%E5%B7%A5%E7%A8%8B/").params.category).toBe("工程");
  });
});
