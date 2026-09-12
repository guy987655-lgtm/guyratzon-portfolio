import type { Locale } from "./i18n";

/** Fills {placeholders} in a message: fill("Updated {when}", { when: "today" }). */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
}

/** "today" / "yesterday" / "3 days ago" in the page's language, measured in Israel time. */
export function relativeDays(iso: string, locale: Locale, now: Date = new Date()): string {
  const day = (d: Date) => {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
    return Date.parse(parts);
  };
  const diff = Math.round((day(new Date(iso)) - day(now)) / 86_400_000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (Math.abs(diff) < 30) return rtf.format(diff, "day");
  if (Math.abs(diff) < 365) return rtf.format(Math.round(diff / 30), "month");
  return rtf.format(Math.round(diff / 365), "year");
}
