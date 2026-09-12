"use client";

import { useLayoutEffect } from "react";
import { currentTheme, QR_THEME_KEY, THEME_KEY } from "@/lib/theme";

export function ThemeToggle({ label }: { label: string }) {
  // React's dev-mode remount strips attributes the head script set on <html>; put the stored choice back.
  // A no-op in production.
  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY) ?? sessionStorage.getItem(QR_THEME_KEY);
      if (stored === "light" || stored === "dark") document.documentElement.setAttribute("data-theme", stored);
    } catch {}
  }, []);

  function toggle() {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
    window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="inline-flex size-10 items-center justify-center rounded-full text-ink transition-colors duration-150 hover:bg-sunken"
    >
      {/* Both icons are rendered; CSS shows the one that matches the active theme (no hydration mismatch). */}
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 dark:hidden" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="hidden size-5 dark:block" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
