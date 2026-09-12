export const locales = ["he", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "he";
export const LOCALE_COOKIE = "locale";

/** Bilingual string. Every piece of prose on the site is one of these. */
export type L10n = { he: string; en: string };

export function hasLocale(value: string | undefined | null): value is Locale {
  return value === "he" || value === "en";
}

export function dirOf(locale: Locale): "rtl" | "ltr" {
  return locale === "he" ? "rtl" : "ltr";
}

export function otherLocale(locale: Locale): Locale {
  return locale === "he" ? "en" : "he";
}

/** Language names are always written in their own language. */
export const localeNames: Record<Locale, string> = { he: "עברית", en: "EN" };

/**
 * Picks the visitor's language from an Accept-Language header.
 * Only the primary subtag matters (he-IL → he); `iw` is the legacy code for Hebrew.
 */
export function negotiate(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return defaultLocale;
  const ranked = acceptLanguage
    .split(",")
    .map((part, index) => {
      const [tag = "", ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const quality = q ? Number.parseFloat(q.slice(2)) : 1;
      return { tag: tag.toLowerCase(), quality: Number.isNaN(quality) ? 0 : quality, index };
    })
    .filter((entry) => entry.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  for (const { tag } of ranked) {
    const primary = tag.split("-")[0];
    if (primary === "he" || primary === "iw") return "he";
    if (primary === "en") return "en";
  }
  return defaultLocale;
}

/** Splits `/he/work/specv` into `{ locale: "he", rest: "/work/specv" }`. */
export function splitLocale(pathname: string): { locale: Locale | null; rest: string } {
  const match = /^\/(he|en)(?=\/|$)(.*)$/.exec(pathname);
  if (!match) return { locale: null, rest: pathname || "/" };
  return { locale: match[1] as Locale, rest: match[2] || "/" };
}

/** Prefixes a locale-less path: `("/work/specv", "en")` → `/en/work/specv`, `("/", "he")` → `/he`. */
export function localizePath(path: string, locale: Locale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** The same page in the other language. */
export function alternatePath(pathname: string, target: Locale): string {
  const { rest } = splitLocale(pathname);
  return localizePath(rest, target);
}

/**
 * Reads a bilingual value. Hebrew is the safety net: an empty English string renders Hebrew
 * instead of nothing (the build's check-i18n makes sure that never ships).
 */
export function tr(value: L10n, locale: Locale): string {
  const text = value[locale];
  return text && text.trim() ? text : value.he;
}

/** True when `tr` had to fall back to Hebrew inside an English page (the caller wraps it in lang="he"). */
export function isFallback(value: L10n, locale: Locale): boolean {
  return locale !== "he" && !(value[locale] && value[locale].trim());
}

export function formatDate(iso: string, locale: Locale, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-GB", {
    timeZone: "Asia/Jerusalem",
    numberingSystem: "latn",
    ...(options ?? { day: "numeric", month: "long", year: "numeric" }),
  }).format(new Date(iso));
}

export function formatNumber(value: number, locale: Locale, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-US", { numberingSystem: "latn", ...options }).format(value);
}
