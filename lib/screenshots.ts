import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Device, Slug } from "@/content/types";
import type { Locale } from "./i18n";

export type ShotTheme = "light" | "dark" | "any";

/** One captured screen. `theme: "any"` = the app has a single look, identical in both color schemes. */
export type Shot = {
  route: string;
  locale: Locale;
  device: Device;
  theme: ShotTheme;
  /** Public URL path, content-hashed (e.g. /exhibit/tape/tape-en-mobile-any.1a2b3c4d.webp). */
  file: string;
  width: number;
  height: number;
  hash: string;
  capturedAt: string;
  /** Relative to the previous capture — drives the /_review page. */
  status: "new" | "changed" | "unchanged";
};

export type ScreenshotIndex = {
  slug: Slug;
  mode: "auto" | "manual";
  capturedAt: string;
  /** Where the screens were captured from (origin only). */
  source: string;
  manifestVersion: string;
  shots: Shot[];
};

const INDEX_DIR = join(process.cwd(), "data", "screenshots");

export function readScreenshotIndex(slug: Slug): ScreenshotIndex | null {
  const file = join(INDEX_DIR, `${slug}.json`);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8")) as ScreenshotIndex;
}

/**
 * The screens to show a visitor: the route in the visitor's language if the app has it, otherwise
 * the app's own language (the page then shows an "Interface in …" badge and translated callouts).
 * Returns one shot per requested theme; "any" shots serve both.
 */
export function pickShot(
  index: ScreenshotIndex | null,
  route: string,
  locale: Locale,
  device: Device,
  theme: "light" | "dark",
): Shot | null {
  if (!index) return null;
  const candidates = index.shots.filter((s) => s.route === route && s.device === device);
  const inLocale = candidates.filter((s) => s.locale === locale);
  const pool = inLocale.length ? inLocale : candidates;
  return pool.find((s) => s.theme === theme) ?? pool.find((s) => s.theme === "any") ?? pool[0] ?? null;
}

export function latestCapture(indexes: (ScreenshotIndex | null)[]): string | null {
  const dates = indexes.flatMap((i) => (i && i.mode === "auto" ? [i.capturedAt] : [])).sort();
  return dates.at(-1) ?? null;
}
