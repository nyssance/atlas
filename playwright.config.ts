import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests",
  testMatch: "*.spec.ts",
  workers: 4,
  use: { baseURL: "http://127.0.0.1:6198", screenshot: "only-on-failure" },
  webServer: {
    command:
      "bun x --bun --no-install vite build && bun x --bun --no-install vite preview --host 127.0.0.1 --port 6198 --strictPort",
    url: "http://127.0.0.1:6198",
    reuseExistingServer: false,
  },
});
