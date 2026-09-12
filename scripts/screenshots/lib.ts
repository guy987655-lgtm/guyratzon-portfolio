/**
 * Screenshot capture, shared by the CI pipeline (capture.ts) and the local IBI harness.
 *
 * Safety rules, enforced here rather than trusted to the source sites:
 *  - only routes on the portfolio's allowlist (config/sources.ts), exact id + path
 *  - same-origin URLs only; the demo flag is part of the allowlisted path
 *  - every non-GET request and every third-party request is aborted (fonts excepted)
 *  - a shot is written only if the page reached `data-exhibit-ready`, shows a visible demo
 *    banner, and is still on the expected path (no redirect to a login page)
 *  - all-or-nothing per site: one failed shot keeps every previous image for that site
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import pixelmatch from "pixelmatch";
import sharp from "sharp";
import type { Browser, BrowserContext, Page, Route } from "@playwright/test";
import type { AllowedRoute } from "../../config/sources";
import type { Device } from "../../content/types";
import type { TourRoute } from "../../lib/exhibit/schema";
import type { ScreenshotIndex, Shot, ShotTheme } from "../../lib/screenshots";

export const ROOT = process.cwd();
export const DEMO_NOW = new Date("2026-06-27T10:00:00+03:00");
const FONT_HOSTS = new Set(["fonts.googleapis.com", "fonts.gstatic.com"]);
/** Share of differing pixels below which two captures count as the same image. */
const SAME_IMAGE_RATIO = 0.002;

export const DEVICES: Record<Device, { viewport: { width: number; height: number }; scale: number; mobile: boolean }> = {
  mobile: { viewport: { width: 390, height: 844 }, scale: 2, mobile: true },
  desktop: { viewport: { width: 1440, height: 900 }, scale: 1.5, mobile: false },
};

export class CaptureError extends Error {}

/** Throws unless every manifest route matches the allowlist exactly. */
export function enforceAllowlist(routes: TourRoute[], allowed: AllowedRoute[]): TourRoute[] {
  for (const route of routes) {
    const ok = allowed.some((a) => a.id === route.id && a.path === route.path);
    if (!ok) throw new CaptureError(`route "${route.id}" (${route.path}) is not on the portfolio allowlist`);
  }
  return routes;
}

export function routeUrl(base: string, path: string): URL {
  const origin = new URL(base).origin;
  const url = new URL(path, origin);
  if (url.origin !== origin) throw new CaptureError(`route ${path} leaves ${origin}`);
  return url;
}

type RawShot = { route: TourRoute; locale: "he" | "en"; device: Device; theme: "light" | "dark"; png: Buffer };

async function guardRequests(context: BrowserContext, origin: string, extra?: (route: Route) => Promise<boolean>) {
  await context.route("**/*", async (route) => {
    const request = route.request();
    if (extra && (await extra(route))) return; // handled (fulfilled) by the caller
    const url = new URL(request.url());
    const sameOrigin = url.origin === origin;
    const font = FONT_HOSTS.has(url.hostname);
    if (request.method() !== "GET" || !(sameOrigin || font)) return route.abort("blockedbyclient");
    return route.continue();
  });
}

async function settle(page: Page, expected: URL) {
  await page.waitForSelector("html[data-exhibit-ready]", { timeout: 25_000 });
  const now = new URL(page.url());
  if (now.pathname !== expected.pathname) throw new CaptureError(`ended on ${now.pathname}, expected ${expected.pathname}`);
  // Query-flag demos (?demo=1) may drop the flag from the URL once it's sticky in sessionStorage.
  if (expected.searchParams.get("demo") === "1" && now.searchParams.get("demo") !== "1") {
    const sticky = await page.evaluate(() => sessionStorage.getItem("demo"));
    if (sticky !== "1") throw new CaptureError("demo flag was dropped");
  }
  const banner = page.locator("[data-demo-banner]").first();
  if (!(await banner.isVisible())) throw new CaptureError("no visible demo banner");
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  if (expected.hash) {
    await page.evaluate((id) => document.getElementById(id)?.scrollIntoView({ block: "start" }), expected.hash.slice(1));
  }
  await page.waitForTimeout(400);
}

export async function captureRoutes(opts: {
  browser: Browser;
  base: string;
  routes: TourRoute[];
  locales: ("he" | "en")[];
  interceptor?: (route: Route) => Promise<boolean>;
  log?: (line: string) => void;
}): Promise<RawShot[]> {
  const { browser, base, routes, log = console.log } = opts;
  const origin = new URL(base).origin;
  const shots: RawShot[] = [];
  for (const route of routes) {
    const locale = route.locale ?? opts.locales[0] ?? "en";
    const url = routeUrl(base, route.path);
    for (const device of ["mobile", "desktop"] as Device[]) {
      for (const theme of ["light", "dark"] as const) {
        const spec = DEVICES[device];
        const context = await browser.newContext({
          viewport: spec.viewport,
          deviceScaleFactor: spec.scale,
          isMobile: spec.mobile,
          hasTouch: spec.mobile,
          colorScheme: theme,
          locale: locale === "he" ? "he-IL" : "en-US",
          timezoneId: "Asia/Jerusalem",
          reducedMotion: "reduce",
          serviceWorkers: "block",
        });
        await guardRequests(context, origin, opts.interceptor);
        const page = await context.newPage();
        await page.clock.setFixedTime(DEMO_NOW);
        try {
          await page.goto(url.toString(), { waitUntil: "domcontentloaded", timeout: 30_000 });
          await settle(page, url);
          const png = await page.screenshot({ animations: "disabled", caret: "hide", type: "png" });
          shots.push({ route, locale, device, theme, png });
          log(`  ✓ ${route.id} ${locale} ${device} ${theme}`);
        } finally {
          await context.close();
        }
      }
    }
  }
  return shots;
}

async function rgba(input: Buffer | string) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

async function sameImage(a: Buffer | string, b: Buffer | string): Promise<boolean> {
  const [x, y] = await Promise.all([rgba(a), rgba(b)]);
  if (x.width !== y.width || x.height !== y.height) return false;
  const diff = pixelmatch(x.data, y.data, undefined, x.width, x.height, { threshold: 0.1 });
  return diff / (x.width * x.height) < SAME_IMAGE_RATIO;
}

/**
 * Turns raw captures into content-hashed WebP files + an index, comparing against the previous
 * index so unchanged screens keep their old file (no churn in git or the image cache).
 * Writes only after every shot is processed.
 */
export async function writeSite(opts: {
  slug: string;
  mode: "auto" | "manual";
  base: string;
  manifestVersion: string;
  raw: RawShot[];
  outSubdir?: string;
}): Promise<ScreenshotIndex> {
  const { slug, raw } = opts;
  const publicDir = join(ROOT, "public", "exhibit", slug, ...(opts.outSubdir ? [opts.outSubdir] : []));
  const urlPrefix = `/exhibit/${slug}${opts.outSubdir ? `/${opts.outSubdir}` : ""}`;
  const indexFile = join(ROOT, "data", "screenshots", `${slug}.json`);
  const previous: ScreenshotIndex | null = existsSync(indexFile) ? JSON.parse(readFileSync(indexFile, "utf8")) : null;
  const capturedAt = new Date().toISOString();

  // Collapse light/dark pairs that render identically (single-theme apps) into one "any" shot.
  const groups = new Map<string, RawShot[]>();
  for (const shot of raw) {
    const key = `${shot.route.id}|${shot.locale}|${shot.device}`;
    groups.set(key, [...(groups.get(key) ?? []), shot]);
  }
  const pending: { shot: Omit<Shot, "status" | "file" | "hash" | "capturedAt">; webp: Buffer; name: string }[] = [];
  for (const group of groups.values()) {
    const light = group.find((s) => s.theme === "light");
    const dark = group.find((s) => s.theme === "dark");
    const variants: { theme: ShotTheme; png: Buffer }[] =
      light && dark && (await sameImage(light.png, dark.png))
        ? [{ theme: "any", png: light.png }]
        : group.map((s) => ({ theme: s.theme, png: s.png }));
    for (const v of variants) {
      const base = group[0]!;
      const webp = await sharp(v.png).webp({ quality: 82, effort: 5 }).toBuffer();
      const meta = await sharp(webp).metadata();
      pending.push({
        shot: { route: base.route.id, locale: base.locale, device: base.device, theme: v.theme, width: meta.width ?? 0, height: meta.height ?? 0 },
        webp,
        name: `${base.route.id}-${base.locale}-${base.device}-${v.theme}`,
      });
    }
  }

  mkdirSync(publicDir, { recursive: true });
  const shots: Shot[] = [];
  for (const { shot, webp, name } of pending) {
    const prev = previous?.shots.find((s) => s.route === shot.route && s.locale === shot.locale && s.device === shot.device && s.theme === shot.theme);
    const prevPath = prev ? join(ROOT, "public", prev.file) : null;
    if (prev && prevPath && existsSync(prevPath) && (await sameImage(webp, prevPath))) {
      shots.push({ ...prev, status: "unchanged" });
      continue;
    }
    const hash = createHash("sha256").update(webp).digest("hex").slice(0, 10);
    const file = `${name}.${hash}.webp`;
    writeFileSync(join(publicDir, file), webp);
    shots.push({ ...shot, file: `${urlPrefix}/${file}`, hash, capturedAt, status: prev ? "changed" : "new" });
  }

  // Drop image files no longer referenced by the new index.
  const keep = new Set(shots.map((s) => s.file.split("/").pop()));
  for (const f of readdirSync(publicDir)) {
    if (f.endsWith(".webp") && !keep.has(f)) rmSync(join(publicDir, f));
  }

  const index: ScreenshotIndex = {
    slug: slug as ScreenshotIndex["slug"],
    mode: opts.mode,
    capturedAt,
    source: new URL(opts.base).origin,
    manifestVersion: opts.manifestVersion,
    shots,
  };
  mkdirSync(join(ROOT, "data", "screenshots"), { recursive: true });
  writeFileSync(indexFile, JSON.stringify(index, null, 2) + "\n");
  return index;
}
