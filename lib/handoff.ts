/**
 * Cross-page handoff through sessionStorage. Used when a click triggers a full navigation
 * (language switch crosses root layouts) and the destination must restore state or report
 * an analytics event that would otherwise be lost with the unloading page.
 */
const KEY = "handoff";
const MAX_AGE_MS = 30_000;

export type Handoff = {
  /** Path the destination must match for the handoff to apply. */
  to: string;
  at: number;
  /** Nearest section id at click time and how far into it the viewport top was (0..1). */
  section?: string;
  sectionRatio?: number;
  /** ids of open <details> elements. */
  openDetails?: string[];
  /** Slug of an open quick-peek dialog. */
  peek?: string;
  /** Analytics event to fire on arrival. */
  event?: { name: string; props?: Record<string, string> };
};

/** Remembers an explicit language choice for a year (read by proxy.ts when a path has no prefix). */
export function rememberLocale(locale: string) {
  document.cookie = `locale=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export function writeHandoff(data: Omit<Handoff, "at">) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...data, at: Date.now() }));
  } catch {}
}

/** Reads and deletes the handoff; returns it only if it targets this path and is fresh. */
export function consumeHandoff(pathname: string): Handoff | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    const data = JSON.parse(raw) as Handoff;
    if (data.to !== pathname || Date.now() - data.at > MAX_AGE_MS) return null;
    return data;
  } catch {
    return null;
  }
}

/** Finds the section the reader is in: the last [data-section] whose top is above the header line. */
export function captureScrollPosition(headerOffset = 80): { section?: string; sectionRatio?: number } {
  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
  let current: HTMLElement | undefined;
  for (const el of sections) {
    if (el.getBoundingClientRect().top - headerOffset <= 0) current = el;
  }
  if (!current) return {};
  const rect = current.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (headerOffset - rect.top) / Math.max(rect.height, 1)));
  return { section: current.dataset.section, sectionRatio: Number(ratio.toFixed(3)) };
}

export function restoreScrollPosition(section: string, ratio: number, headerOffset = 80) {
  const el = document.querySelector<HTMLElement>(`[data-section="${CSS.escape(section)}"]`);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset + ratio * el.offsetHeight;
  window.scrollTo({ top: Math.max(0, top), behavior: "instant" as ScrollBehavior });
}
