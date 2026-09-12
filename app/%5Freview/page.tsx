/* eslint-disable @next/next/no-img-element -- review shows the exact committed files, unoptimized */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { notFound } from "next/navigation";
import { sources } from "@/config/sources";
import { getProject, routeFor } from "@/content/projects";
import { ExhibitManifestSchema } from "@/lib/exhibit/schema";
import { readScreenshotIndex, type Shot } from "@/lib/screenshots";

const STATUS_STYLE: Record<Shot["status"], string> = {
  new: "bg-accent text-accent-ink",
  changed: "bg-chef text-paper",
  unchanged: "bg-sunken text-muted",
};

const CHECKLIST = [
  "Only the demo persona (Dana Cohen) and invented values appear — no real name, amount, holding, weight or friend.",
  "The demo banner is visible in every shot.",
  "Nothing looks like a logged-in account, an email inbox, or a real document.",
  "Callout numbers still point at the right element.",
];

/**
 * Screenshot review gate. Exists only on Vercel preview deployments (behind Vercel Authentication)
 * and in local dev/start; production answers 404. The screenshot PR's preview is where new
 * captures get approved — merging the PR is the approval.
 */
export default function ReviewPage() {
  if (process.env.VERCEL_ENV === "production") notFound();

  const sites = sources.map((source) => {
    const index = readScreenshotIndex(source.slug);
    const manifestFile = join(process.cwd(), "data", "manifests", `${source.slug}.json`);
    const manifest = existsSync(manifestFile) ? ExhibitManifestSchema.safeParse(JSON.parse(readFileSync(manifestFile, "utf8"))) : null;
    const project = getProject(source.slug);
    const shots = [...(index?.shots ?? [])].sort((a, b) => (a.status === b.status ? 0 : a.status === "unchanged" ? 1 : -1));
    return { source, index, manifest, project, shots };
  });
  const pending = sites.flatMap((s) => s.shots).filter((s) => s.status !== "unchanged").length;

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-3xl font-bold">Screenshot review</h1>
          <p className="mt-1 text-muted">
            {pending ? `${pending} new or changed screen(s) waiting for approval.` : "Nothing new since the last approved capture."}
          </p>
        </div>
        <ol className="max-w-xl list-decimal space-y-1 ps-5 text-sm">
          {CHECKLIST.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ol>
      </header>

      {sites.map(({ source, index, manifest, project, shots }) => (
        <section key={source.slug} className="border-b border-line py-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-bold">{project?.title.en ?? source.slug}</h2>
            <p className="text-sm text-muted">
              {source.capture} · {index ? `captured ${new Date(index.capturedAt).toLocaleString("en-GB", { timeZone: "Asia/Jerusalem" })} from ${index.source} · manifest v${index.manifestVersion}` : "no captures yet"}
            </p>
          </div>

          {manifest && manifest.success ? (
            <details className="mt-4 rounded-xl border border-line bg-surface p-4">
              <summary className="cursor-pointer font-medium">Manifest text (reviewed with the screens)</summary>
              <dl className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <dt className="font-semibold">Headline</dt>
                  <dd>{manifest.data.headline.en}</dd>
                  <dd lang="he" dir="rtl">
                    {manifest.data.headline.he}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Facts</dt>
                  {(manifest.data.facts ?? []).map((f, i) => (
                    <dd key={i}>
                      {f.label.en}: {f.value.en} · <span lang="he" dir="rtl">{f.label.he}: {f.value.he}</span>
                    </dd>
                  ))}
                </div>
                <div className="md:col-span-2">
                  <dt className="font-semibold">Highlights</dt>
                  {manifest.data.highlights.map((h, i) => (
                    <dd key={i}>
                      <b>{h.title.en}</b> — {h.body.en}
                    </dd>
                  ))}
                </div>
              </dl>
            </details>
          ) : (
            <p className="mt-4 text-sm text-muted">{manifest ? "Manifest snapshot fails the schema." : "No manifest snapshot."}</p>
          )}

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {shots.map((shot) => {
              const item = project?.gallery.find((g) => routeFor(g.route, shot.locale) === shot.route);
              const callouts = item?.callouts?.[shot.device] ?? [];
              return (
                <figure key={shot.file} className="rounded-xl border border-line bg-surface p-3">
                  <div className="relative overflow-hidden rounded-lg border border-line">
                    <img src={shot.file} alt={`${shot.route} ${shot.locale} ${shot.device} ${shot.theme}`} className="block h-auto w-full" loading="lazy" />
                    <div dir="ltr" data-physical className="pointer-events-none absolute inset-0">
                      {callouts.map((c) => (
                        <span
                          key={c.n}
                          style={{ left: `${c.x}%`, top: `${c.y}%` }}
                          className="absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-ink ring-2 ring-paper"
                        >
                          {c.n}
                        </span>
                      ))}
                    </div>
                  </div>
                  <figcaption className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className={`rounded-full px-2 py-0.5 font-semibold ${STATUS_STYLE[shot.status]}`}>{shot.status}</span>
                    <span className="font-mono">
                      {shot.route} · {shot.locale} · {shot.device} · {shot.theme}
                    </span>
                    <span className="text-muted">
                      {shot.width}×{shot.height}
                    </span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}
