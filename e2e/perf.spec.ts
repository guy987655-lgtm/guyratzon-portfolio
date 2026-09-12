import { expect, test } from "@playwright/test";

/**
 * The PRD's LCP budget, measured in a real browser: slow-4G network (1.6 Mbps, 150 ms RTT) and a
 * 4× slower CPU, via Chrome DevTools Protocol. Lighthouse's simulated estimate is stricter and
 * runs separately in CI as a score check.
 */
test.describe("LCP under slow 4G", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "CDP throttling is Chromium-only");

  for (const path of ["/he", "/en", "/he/work/specv", "/en/work/specv/data"]) {
    test(`${path} LCP < 2s`, async ({ page, context }) => {
      const cdp = await context.newCDPSession(page);
      await cdp.send("Network.enable");
      await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      await page.addInitScript(() => {
        (window as unknown as { __lcp: number }).__lcp = 0;
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) (window as unknown as { __lcp: number }).__lcp = e.startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });
      });
      await page.goto(path, { waitUntil: "load" });
      await page.waitForTimeout(1500);
      const lcp = await page.evaluate(() => (window as unknown as { __lcp: number }).__lcp);
      expect(lcp).toBeGreaterThan(0);
      expect(lcp).toBeLessThan(2000);
    });
  }
});
