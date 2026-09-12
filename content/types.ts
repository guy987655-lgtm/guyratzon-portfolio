import type { L10n, Locale } from "@/lib/i18n";

export const SLUGS = ["specv", "ibi", "tape", "piggybank", "worldcup"] as const;
export type Slug = (typeof SLUGS)[number];

export type Device = "mobile" | "desktop";

/**
 * A numbered marker over a screenshot. x/y are percentages of the image measured from the
 * top-left corner — physical coordinates, because screenshots are never mirrored in RTL.
 */
export type Callout = { n: number; x: number; y: number; text: L10n };

/** One screen in a project's gallery. The image itself comes from the screenshot index by `route`. */
export type GalleryItem = {
  /**
   * Tour route id (matches config/sources.ts allowedPaths and the screenshot index). Bilingual apps
   * have one route per interface language — give both and each visitor gets their own language.
   */
  route: string | { he: string; en: string };
  caption: L10n;
  /** Devices worth showing for this screen (default: both). */
  devices?: Device[];
  callouts?: Partial<Record<Device, Callout[]>>;
};

export type Decision = { id: string; title: L10n; why: L10n; tradeoff: L10n };

export type Project = {
  slug: Slug;
  title: L10n;
  tagline: L10n;
  depth: "full" | "compact";
  /** "Chef's recommendation" — the suggested starting point. */
  recommended?: boolean;
  /** Public demo-mode entry. Absent for IBI (manual screenshots, no live link). */
  liveUrl?: string;
  stack: string[];
  /** ISO date of the first commit (verifiable). */
  builtAt: string;
  /**
   * How it's used, stated as a fact — e.g. "a tool I built for myself and have used since …".
   * Never implies an audience a personal tool doesn't have.
   */
  usage: L10n;
  /** Which UI languages the source app itself supports (drives the "Interface in …" badge). */
  interfaceLocales: Locale[];
  /** The single fact shown on the home card. */
  cardFact: L10n;
  /** Two plain-language lines: what it is and who it's for. */
  overview: L10n;
  /** Three bullets for the quick peek. */
  peek: [L10n, L10n, L10n];
  problem: L10n;
  /** Paragraphs separated by a blank line. */
  approach: L10n;
  /** Pre-rendered Mermaid diagram id (content/diagrams). */
  diagram?: string;
  decisions: Decision[];
  whatBroke?: L10n;
  gallery: GalleryItem[];
  /** Which device the gallery opens on (phone-first apps open on mobile). Default: desktop. */
  preferDevice?: Device;
  /** Embed the demo mode in a sandboxed frame (World Cup only). */
  liveFrame?: boolean;
};
