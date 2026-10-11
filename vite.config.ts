import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import type { ViteSSGOptions } from "vite-ssg";

type GeneratedSiteIndex = { routePaths: string[] };

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const generatedIndex = path.join(projectRoot, "src/generated/site-index.json");

function generatedRoutes(): string[] {
  try {
    const data = JSON.parse(
      readFileSync(generatedIndex, "utf8"),
    ) as GeneratedSiteIndex;
    return data.routePaths;
  } catch {
    return ["/"];
  }
}

const ssgOptions: ViteSSGOptions = {
  includedRoutes: () => generatedRoutes(),
  dirStyle: "nested",
};

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.join(projectRoot, "src"),
    },
  },
  ssgOptions,
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
  },
});
