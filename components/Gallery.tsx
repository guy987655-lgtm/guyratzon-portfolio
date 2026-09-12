"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Device } from "@/content/types";
import { track } from "@/lib/analytics";
import type { Shot } from "@/lib/screenshots";

export type GallerySlide = {
  caption: string;
  shots: Partial<Record<Device, { light: Shot | null; dark: Shot | null }>>;
  callouts?: Partial<Record<Device, { n: number; x: number; y: number; text: string }[]>>;
};

type Labels = { mobile: string; desktop: string; deviceToggle: string; previous: string; next: string; screen: string; demoData: string; calloutsTitle: string };

function Frame({ pair, device, alt, priority }: { pair: { light: Shot | null; dark: Shot | null }; device: Device; alt: string; priority: boolean }) {
  const shots = [pair.light, pair.dark].filter((s, i, arr): s is Shot => !!s && arr.findIndex((o) => o?.file === s.file) === i);
  return (
    <>
      {shots.map((shot, i) => (
        <Image
          key={shot.file}
          src={shot.file}
          alt={alt}
          width={shot.width}
          height={shot.height}
          priority={priority}
          sizes={device === "desktop" ? "(min-width: 1152px) 1100px, 100vw" : "320px"}
          className={`block h-auto w-full ${shots.length > 1 ? (i === 0 ? "dark:hidden" : "hidden dark:block") : ""}`}
        />
      ))}
    </>
  );
}

/**
 * Screens with a device switch, numbered callouts and captions. Scroll-snap does the sliding, so
 * the slides still swipe without JS; JS adds the switch, arrows and keyboard. Callouts sit in an
 * LTR overlay with physical coordinates because screenshots never mirror, even on RTL pages.
 */
export function Gallery({
  slug,
  slides,
  labels,
  rtl,
  badges,
}: {
  slug: string;
  slides: GallerySlide[];
  labels: Labels;
  rtl: boolean;
  badges: string[];
}) {
  const hasDesktop = slides.some((s) => s.shots.desktop);
  const hasMobile = slides.some((s) => s.shots.mobile);
  const [device, setDevice] = useState<Device>(hasDesktop ? "desktop" : "mobile");
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const visible = slides.filter((s) => s.shots[device]);
  const total = visible.length;

  const scrollTo = (i: number) => {
    const el = trackRef.current;
    const slide = el?.children[i] as HTMLElement | undefined;
    if (!el || !slide) return;
    el.scrollTo({ left: slide.offsetLeft - el.offsetLeft, behavior: "smooth" });
  };
  const go = (delta: number) => {
    const next = Math.min(total - 1, Math.max(0, index + delta));
    if (next === index) return;
    scrollTo(next);
    track("gallery_interact", { slug, device });
  };
  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(Math.abs(el.scrollLeft) / el.clientWidth);
    if (i !== index) setIndex(i);
  };
  const switchDevice = (d: Device) => {
    if (d === device) return;
    setDevice(d);
    setIndex(0);
    trackRef.current?.scrollTo({ left: 0 });
    track("gallery_interact", { slug, device: d });
  };

  const counter = labels.screen.replace("{n}", String(Math.min(index + 1, total))).replace("{total}", String(total));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {badges.map((b) => (
            <span key={b} className="rounded-full bg-sunken px-3 py-1 text-xs font-medium text-muted">
              {b}
            </span>
          ))}
        </div>
        {hasDesktop && hasMobile && (
          <div role="group" aria-label={labels.deviceToggle} className="inline-flex rounded-full border border-line bg-surface p-1 text-sm">
            {(["desktop", "mobile"] as Device[]).map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={device === d}
                onClick={() => switchDevice(d)}
                className={`rounded-full px-3.5 py-1 font-medium transition-colors duration-150 ${device === d ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}
              >
                {labels[d]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        ref={trackRef}
        onScroll={onScroll}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={counter}
        onKeyDown={(e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          e.preventDefault();
          const forward = e.key === "ArrowRight" ? !rtl : rtl;
          go(forward ? 1 : -1);
        }}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [scrollbar-width:none] focus-visible:outline-offset-4"
      >
        {visible.map((slide, i) => {
          const pair = slide.shots[device]!;
          const callouts = slide.callouts?.[device] ?? [];
          return (
            <figure key={`${device}-${i}`} className="w-full shrink-0 snap-center">
              <div
                className={`relative mx-auto overflow-hidden border border-line bg-sunken shadow-[var(--shadow-card)] ${
                  device === "mobile" ? "max-w-[20rem] rounded-[2rem]" : "rounded-2xl"
                }`}
              >
                <Frame pair={pair} device={device} alt={slide.caption} priority={i === 0} />
                <span className="absolute start-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-medium text-paper">{labels.demoData}</span>
                {callouts.length > 0 && (
                  // Physical coordinates on purpose: the image is never mirrored, even on RTL pages.
                  <div dir="ltr" data-physical className="pointer-events-none absolute inset-0">
                    {callouts.map((c) => (
                      <span
                        key={c.n}
                        aria-hidden="true"
                        style={{ left: `${c.x}%`, top: `${c.y}%` }}
                        className="absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-ink shadow-lg ring-2 ring-paper"
                      >
                        {c.n}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <figcaption className="mx-auto mt-3 max-w-3xl text-center text-muted">{slide.caption}</figcaption>
              {callouts.length > 0 && (
                <div className="mx-auto mt-4 max-w-3xl">
                  <p className="text-sm font-semibold">{labels.calloutsTitle}</p>
                  <ol className="mt-2 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                    {callouts.map((c) => (
                      <li key={c.n} className="flex gap-2">
                        <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-ink">
                          {c.n}
                        </span>
                        <span>{c.text}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </figure>
          );
        })}
      </div>

      {total > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button type="button" onClick={() => go(-1)} disabled={index === 0} aria-label={labels.previous} className="inline-flex size-10 items-center justify-center rounded-full border border-line bg-surface disabled:opacity-40">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 rtl:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span className="min-w-24 text-center text-sm tabular-nums text-muted" aria-live="polite">
            {counter}
          </span>
          <button type="button" onClick={() => go(1)} disabled={index >= total - 1} aria-label={labels.next} className="inline-flex size-10 items-center justify-center rounded-full border border-line bg-surface disabled:opacity-40">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 rtl:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
