import { localizePath, tr, type L10n, type Locale } from "@/lib/i18n";
import type { Slug } from "../types";

/**
 * Names and taglines for navigation. The full story for each project lives in
 * content/projects/<slug>.ts (added with the project pages).
 */
export const projectMeta: { slug: Slug; title: L10n; tagline: L10n }[] = [
  {
    slug: "specv",
    title: { he: "SpeCV", en: "SpeCV" },
    tagline: { he: "התאמת קורות חיים למשרה ספציפית", en: "Tailors a résumé to one specific job" },
  },
  {
    slug: "ibi",
    title: { he: "תיק ההשקעות ב-IBI", en: "IBI Portfolio Tracker" },
    tagline: { he: "מעקב וניתוח של תיק השקעות אישי", en: "Tracks and analyzes a personal investment portfolio" },
  },
  {
    slug: "tape",
    title: { he: "Tape Calculator", en: "Tape Calculator" },
    tagline: { he: "מחשבון שכל חישוב בו נרשם על סרט, עם הערה לכל שורה", en: "A calculator that keeps a running tape, with a note on every line" },
  },
  {
    slug: "piggybank",
    title: { he: "PiggyBank", en: "PiggyBank" },
    tagline: { he: "מעקב יומי אחרי הרגלי אכילה ומשקל", en: "Daily tracking of eating habits and weight" },
  },
  {
    slug: "worldcup",
    title: { he: "מונדיאל 2026", en: "World Cup 2026" },
    tagline: { he: "לוח המשחקים של המונדיאל, עם מודל תחזיות", en: "The World Cup schedule, with a prediction model" },
  },
];

export function projectHref(slug: Slug, locale: Locale): string {
  return localizePath(`/work/${slug}`, locale);
}

export function projectNavItems(locale: Locale) {
  return projectMeta.map((p) => ({ href: projectHref(p.slug, locale), label: tr(p.title, locale) }));
}
