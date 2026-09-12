/**
 * Review sweep: screenshots portfolio pages in every language × theme × size, for eyeballing
 * layout (long English strings, RTL, dark mode) before a release.
 *   tsx scripts/snap.ts --base http://localhost:3310 --out ./tmp/snaps [--path /work/specv] [--full]
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const args = process.argv.slice(2);
const get = (flag: string) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};
const base = get("--base") ?? "http://localhost:3310";
const out = get("--out") ?? "tmp/snaps";
const full = args.includes("--full");
const paths = args.flatMap((a, i) => (a === "--path" && args[i + 1] ? [args[i + 1]!] : []));
const targets = paths.length ? paths : ["/", "/work/specv"];
const locales = (get("--locales") ?? "he,en").split(",");
const themes = (get("--themes") ?? "light,dark").split(",") as ("light" | "dark")[];
const sizes = (get("--sizes") ?? "mobile,desktop").split(",");

const SIZE: Record<string, { width: number; height: number; mobile: boolean }> = {
  mobile: { width: 390, height: 844, mobile: true },
  desktop: { width: 1440, height: 900, mobile: false },
};

mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? "chrome" });
for (const path of targets) {
  for (const locale of locales) {
    for (const theme of themes) {
      for (const size of sizes) {
        const spec = SIZE[size]!;
        const context = await browser.newContext({
          viewport: { width: spec.width, height: spec.height },
          deviceScaleFactor: 1,
          isMobile: spec.mobile,
          hasTouch: spec.mobile,
          colorScheme: theme,
          locale: locale === "he" ? "he-IL" : "en-US",
        });
        const page = await context.newPage();
        const url = `${base}/${locale}${path === "/" ? "" : path}`;
        await page.goto(url, { waitUntil: "load" });
        if (full) {
          // Walk down the page so lazy images load before a full-page capture, then return to the top.
          await page.evaluate(async () => {
            for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight * 0.8) {
              window.scrollTo(0, y);
              await new Promise((r) => setTimeout(r, 120));
            }
            window.scrollTo(0, 0);
          });
        }
        await page.waitForTimeout(800);
        await page.evaluate(() => document.fonts.ready.then(() => undefined));
        const name = `${path === "/" ? "home" : path.slice(1).replace(/\//g, "_")}-${locale}-${theme}-${size}.png`;
        await page.screenshot({ path: join(out, name), fullPage: full });
        console.log(`✓ ${name}`);
        await context.close();
      }
    }
  }
}
await browser.close();
