"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";

/**
 * The source site's demo mode, embedded on demand. Nothing loads until the visitor asks; the
 * frame is sandboxed and only ever points at the demo URL. The demo posts "exhibit-ready" when it
 * has rendered — if that doesn't arrive from the expected origin within 3 seconds (blocked
 * framing, slow network), the frame quietly gives way to the screenshot.
 */
export function LiveFrame({
  slug,
  src,
  title,
  labels,
  fallback,
}: {
  slug: string;
  src: string;
  title: string;
  labels: { load: string; note: string; fallback: string };
  fallback: React.ReactNode;
}) {
  const [state, setState] = useState<"idle" | "loading" | "ready" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const origin = new URL(src).origin;

  useEffect(() => {
    if (state !== "loading") return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin === origin && e.data?.type === "exhibit-ready") setState("ready");
    };
    window.addEventListener("message", onMessage);
    timer.current = setTimeout(() => setState((s) => (s === "loading" ? "failed" : s)), 3000);
    return () => {
      window.removeEventListener("message", onMessage);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [state, origin]);

  if (state === "idle") {
    return (
      <div className="relative">
        <div className="pointer-events-none opacity-60 blur-[1px]">{fallback}</div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <button
            type="button"
            onClick={() => {
              setState("loading");
              track("live_frame_open", { slug });
            }}
            className="rounded-full bg-accent px-6 py-3 font-semibold text-accent-ink shadow-lg hover:opacity-90"
          >
            ▶ {labels.load}
          </button>
          <p className="rounded-full bg-surface/90 px-3 py-1 text-sm text-muted">{labels.note}</p>
        </div>
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div>
        <p className="mb-3 text-sm text-muted">{labels.fallback}</p>
        {fallback}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-sunken shadow-[var(--shadow-card)]">
      <iframe
        src={src}
        title={title}
        sandbox="allow-scripts allow-same-origin"
        referrerPolicy="no-referrer"
        loading="lazy"
        className={`block h-[36rem] w-full transition-opacity duration-200 ${state === "ready" ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
