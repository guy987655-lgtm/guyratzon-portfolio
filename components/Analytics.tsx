"use client";

import { useEffect } from "react";
import type { EventName } from "@/lib/analytics";
import type { Locale } from "@/lib/i18n";
import { currentTheme, SOURCE_KEY } from "@/lib/theme";

const INTERNAL_KEY = "ph_internal";
/** Events fired right before the page is left for another site — sent with sendBeacon so they survive. */
const BEACON: Set<EventName> = new Set(["contact_click", "live_site_click"]);

function source(): string {
  try {
    const fromQr = sessionStorage.getItem(SOURCE_KEY);
    if (fromQr) return fromQr;
    const ref = document.referrer ? new URL(document.referrer) : null;
    const value = ref && ref.host !== location.host ? "referral" : "direct";
    sessionStorage.setItem(SOURCE_KEY, value);
    return value;
  } catch {
    return "direct";
  }
}

/**
 * Loads PostHog only after the page is idle (never on the critical path), through the /ingest
 * rewrite so blockers of third-party hosts don't drop it. Privacy choices: no autocapture, no
 * session recording, no person profiles, sessionStorage persistence (nothing outlives the tab).
 * Guy opts his own browser out once with ?internal=1.
 */
export function Analytics({ locale }: { locale: Locale }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    try {
      const params = new URLSearchParams(location.search);
      if (params.get("internal") === "1") localStorage.setItem(INTERNAL_KEY, "1");
      if (params.get("internal") === "0") localStorage.removeItem(INTERNAL_KEY);
      if (localStorage.getItem(INTERNAL_KEY) === "1") return;
    } catch {}
    if (!key) return;

    let cancelled = false;
    const start = async () => {
      const { default: posthog } = await import("posthog-js");
      if (cancelled) return;
      posthog.init(key, {
        api_host: "/ingest",
        ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST?.includes("eu.") ? "https://eu.posthog.com" : "https://us.posthog.com",
        persistence: "sessionStorage",
        person_profiles: "identified_only",
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: true,
        disable_session_recording: true,
        disable_surveys: true,
        advanced_disable_flags: true,
      });
      posthog.register({ locale, theme: currentTheme(), source: source() });
      window.__track = (name, props) => posthog.capture(name, props, BEACON.has(name) ? { transport: "sendBeacon" } : undefined);
      for (const e of window.__pendingEvents?.splice(0) ?? []) window.__track(e.name, e.props);
    };

    const onTheme = () => window.__track && import("posthog-js").then(({ default: ph }) => ph.register({ theme: currentTheme() }));
    const onPending = () => {
      if (window.__track) for (const e of window.__pendingEvents?.splice(0) ?? []) window.__track(e.name, e.props);
    };
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[data-contact]");
      const channel = link?.dataset.contact;
      if (!channel) return;
      if (window.__track) window.__track("contact_click", { channel });
      else (window.__pendingEvents ??= []).push({ name: "contact_click", props: { channel } });
    };
    window.addEventListener("themechange", onTheme);
    window.addEventListener("analytics:pending", onPending);
    document.addEventListener("click", onClick);
    const hasIdle = typeof window.requestIdleCallback === "function";
    const handle = hasIdle ? window.requestIdleCallback(() => void start(), { timeout: 3000 }) : setTimeout(() => void start(), 1500);
    return () => {
      cancelled = true;
      window.removeEventListener("themechange", onTheme);
      window.removeEventListener("analytics:pending", onPending);
      document.removeEventListener("click", onClick);
      if (hasIdle) window.cancelIdleCallback(handle as number);
      else clearTimeout(handle as ReturnType<typeof setTimeout>);
    };
  }, [locale]);

  return null;
}

/** home_view, with where the visitor came from (qr / direct / referral). */
export function HomeView() {
  useEffect(() => {
    import("@/lib/analytics").then(({ track }) => track("home_view", { source: source() }));
  }, []);
  return null;
}
