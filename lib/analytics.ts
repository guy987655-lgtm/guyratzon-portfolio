/**
 * Client-side analytics facade. Components call track(); events queue until PostHog loads
 * (lazily, after idle — see components/Analytics.tsx), so tracking never blocks rendering.
 */
export type EventName =
  | "home_view"
  | "locale_switch"
  | "quick_peek_open"
  | "project_open"
  | "decision_expand"
  | "gallery_interact"
  | "deep_dive_open"
  | "live_site_click"
  | "live_frame_open"
  | "contact_click";

type Pending = { name: EventName; props?: Record<string, unknown> };

declare global {
  interface Window {
    __pendingEvents?: Pending[];
    __track?: (name: EventName, props?: Record<string, unknown>) => void;
  }
}

export function track(name: EventName, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (window.__track) window.__track(name, props);
  else (window.__pendingEvents ??= []).push({ name, props });
}

const NAV_KEY = "navEntry";

/** Remembers how the visitor is about to reach a project page (card / peek / nav / next). */
export function rememberEntry(entry: "card" | "peek" | "nav" | "next") {
  try {
    sessionStorage.setItem(NAV_KEY, entry);
  } catch {}
}

export function takeEntry(): string {
  try {
    const v = sessionStorage.getItem(NAV_KEY);
    sessionStorage.removeItem(NAV_KEY);
    return v ?? "direct";
  } catch {
    return "direct";
  }
}
