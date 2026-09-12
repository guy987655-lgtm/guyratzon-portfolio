import { localizePath, tr, type Locale } from "@/lib/i18n";
import type { Project, Slug } from "../types";
import { ibi } from "./ibi";
import { piggybank } from "./piggybank";
import { specv } from "./specv";
import { tape } from "./tape";
import { worldcup } from "./worldcup";

/** Menu order. SpeCV first — the chef's recommendation. */
export const projects: Project[] = [specv, ibi, tape, piggybank, worldcup];

export const projectMeta = projects.map(({ slug, title, tagline }) => ({ slug, title, tagline }));

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function projectHref(slug: Slug, locale: Locale): string {
  return localizePath(`/work/${slug}`, locale);
}

export function projectNavItems(locale: Locale) {
  return projects.map((p) => ({ href: projectHref(p.slug, locale), label: tr(p.title, locale) }));
}

export function nextProject(slug: Slug): Project {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length]!;
}

/** The gallery route id for a visitor's language (bilingual apps have one route per language). */
export function routeFor(route: Project["gallery"][number]["route"], locale: Locale): string {
  return typeof route === "string" ? route : route[locale];
}
