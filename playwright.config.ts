import { defineConfig, devices } from "@playwright/test";

const port = 3100;
const previewCommand = `pnpm preview --host 127.0.0.1 --port ${port}`;
const webServerCommand = process.env.PLAYWRIGHT_SKIP_BUILD === "1"
  ? previewCommand
  : `pnpm build && ${previewCommand}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: webServerCommand,
    reuseExistingServer: false,
    timeout: 180_000,
    url: `http://127.0.0.1:${port}`,
  },
});
