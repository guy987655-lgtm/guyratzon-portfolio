import { defineConfig, devices } from "@playwright/test";

const PORT = 3330;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    ...(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}),
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], ...(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}) } },
    { name: "mobile", use: { ...devices["Pixel 7"], ...(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}) } },
  ],
  webServer: {
    command: `npx next start --port ${PORT}`,
    url: `http://localhost:${PORT}/he`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
