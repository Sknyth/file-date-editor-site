import { defineConfig, devices } from "@playwright/test";
import { resolve } from "node:path";

const port = 3100;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 3,
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `npm run dev -- --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    timeout: 60_000,
    env: {
      FDE_TEST_BUILD_DIR: ".next-playwright",
      NODE_OPTIONS: `--require="${resolve("tests/mock-github.cjs")}"`,
      GITHUB_REPOSITORY_OWNER: "fde-test",
      GITHUB_REPOSITORY_NAME: "fixture",
      GITHUB_RELEASE_FALLBACK_JSON: "",
      GITHUB_TOKEN: "",
      NEXT_PUBLIC_SITE_URL: "https://file-date-editor.example",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
});
