import type { Slug } from "@/content/types";

export type AllowedRoute = { id: string; path: string };

export type Source = {
  slug: Slug;
  /** Production origin of the source site. */
  siteUrl: string;
  /** Vercel project name, for last-deploy dates. */
  vercelProject?: string;
  /**
   * auto   — the pipeline reads /api/exhibit and screenshots the demo routes.
   * manual — screenshots are produced locally (public/exhibit/<slug>/manual/) and the manifest
   *          snapshot is hand-written; the site shows "from the demo version" instead of a date.
   */
  capture: "auto" | "manual";
  /**
   * The ONLY routes the pipeline may screenshot. A manifest route must match an entry here
   * exactly (id and path) or the whole capture for that site fails. Lives in this repo on
   * purpose: a source site can't widen its own allowlist.
   */
  allowedPaths: AllowedRoute[];
  /** Public demo entry for the "open the live site" button (absent = no live link). */
  liveDemoUrl?: string;
};

export const sources: Source[] = [
  {
    slug: "specv",
    siteUrl: "https://preci-cv.vercel.app",
    vercelProject: "preci-cv",
    capture: "auto",
    liveDemoUrl: "https://preci-cv.vercel.app/demo",
    allowedPaths: [
      { id: "workspace", path: "/demo" },
      { id: "match-analysis", path: "/demo#match-analysis" },
      { id: "interview", path: "/demo#interview-simulation" },
      { id: "sample", path: "/demo/sample" },
    ],
  },
  {
    slug: "ibi",
    siteUrl: "http://127.0.0.1:4199", // local capture harness only — never a live site
    capture: "manual",
    allowedPaths: [
      { id: "overview", path: "/?demo=1&tab=overview" },
      { id: "today", path: "/?demo=1&tab=today" },
      { id: "instrument", path: "/?demo=1&tab=instrument" },
      { id: "cashflow", path: "/?demo=1&tab=cashflow" },
    ],
  },
  {
    slug: "tape",
    siteUrl: "https://tapecalc-mu.vercel.app",
    vercelProject: "tapecalc",
    capture: "auto",
    liveDemoUrl: "https://tapecalc-mu.vercel.app/?demo=1",
    allowedPaths: [{ id: "tape", path: "/?demo=1" }],
  },
  {
    slug: "piggybank",
    siteUrl: "https://pigi-cal.vercel.app",
    vercelProject: "pigi-cal",
    capture: "auto",
    liveDemoUrl: "https://pigi-cal.vercel.app/?demo=1",
    allowedPaths: [
      { id: "calendar", path: "/?demo=1" },
      { id: "trends", path: "/?demo=1&view=trends" },
    ],
  },
  {
    slug: "worldcup",
    siteUrl: "https://world-cup-2026-alpha-beryl.vercel.app",
    vercelProject: "world-cup-2026",
    capture: "auto",
    liveDemoUrl: "https://world-cup-2026-alpha-beryl.vercel.app/?demo=1",
    allowedPaths: [
      { id: "schedule-he", path: "/?demo=1&lang=he" },
      { id: "schedule-en", path: "/?demo=1&lang=en" },
      { id: "bracket-he", path: "/?demo=1&lang=he&view=bracket" },
      { id: "bracket-en", path: "/?demo=1&lang=en&view=bracket" },
    ],
  },
];

export function sourceFor(slug: Slug): Source {
  const source = sources.find((s) => s.slug === slug);
  if (!source) throw new Error(`Unknown source ${slug}`);
  return source;
}
