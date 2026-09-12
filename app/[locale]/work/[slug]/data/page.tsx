import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/CopyButton";
import { Decisions } from "@/components/Decisions";
import { DeepDiveOpen } from "@/components/DeepDiveOpen";
import { Diagram } from "@/components/Diagram";
import { JumpBar } from "@/components/JumpBar";
import { dataRoomQueries } from "@/content/data-room/queries";
import results from "@/content/data-room/results.json";
import { dataRoom } from "@/content/data-room/specv";
import { fill } from "@/lib/format";
import { formatDate, formatNumber, hasLocale, localizePath, tr } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { getMessages } from "@/messages";

export const dynamicParams = false;

/** Only SpeCV has a data room. */
export function generateStaticParams() {
  return [{ slug: "specv" }];
}

export async function generateMetadata({ params }: PageProps<"/[locale]/work/[slug]/data">) {
  const { locale, slug } = await params;
  if (!hasLocale(locale) || slug !== "specv") return {};
  const m = getMessages(locale);
  return buildMetadata({
    locale,
    path: "/work/specv/data",
    title: `${tr(dataRoom.title, locale)} — ${m.meta.siteName}`,
    description: tr(dataRoom.lead, locale),
    ogImage: `/og/specv-${locale}.png`,
  });
}

function Paragraphs({ text }: { text: string }) {
  return (
    <div className="space-y-4">
      {text.split(/\n\n+/).map((p, i) => (
        <p key={i} className="max-w-prose">
          {p}
        </p>
      ))}
    </div>
  );
}

type Result = { columns: string[]; rows: (string | number | null)[][] };

export default async function DataRoomPage({ params }: PageProps<"/[locale]/work/[slug]/data">) {
  const { locale, slug } = await params;
  if (!hasLocale(locale) || slug !== "specv") notFound();
  const m = getMessages(locale);
  const data = results as { seed: number; asOf: string; results: Record<string, Result> };

  const sections = [
    { id: "why", label: tr(dataRoom.whySynthetic.title, locale) },
    { id: "model", label: tr(dataRoom.dictionaryTitle, locale) },
    { id: "decisions", label: tr(dataRoom.decisionsTitle, locale) },
    { id: "generator", label: tr(dataRoom.generator.title, locale) },
    { id: "queries", label: tr(dataRoom.queriesTitle, locale) },
    { id: "scale", label: tr(dataRoom.scale.title, locale) },
  ];

  return (
    <article>
      <DeepDiveOpen />
      <header className="border-b border-line bg-[radial-gradient(ellipse_at_top,var(--color-accent-soft),transparent_65%)]">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-12">
          <Link href={localizePath("/work/specv", locale)} className="text-sm font-medium text-muted hover:text-ink">
            <span aria-hidden="true" className="inline-block rtl:rotate-180">←</span> {m.dataRoom.back}
          </Link>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{tr(dataRoom.title, locale)}</h1>
          <p className="mt-4 max-w-3xl text-xl text-muted">{tr(dataRoom.lead, locale)}</p>
          <p className="mt-4 text-sm text-muted">{fill(m.dataRoom.seedNote, { seed: data.seed, date: formatDate(data.asOf, locale) })}</p>
        </div>
      </header>

      <JumpBar items={sections} label={m.dataRoom.onThisPage} />

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-14 sm:px-6 sm:py-20">
        <section id="why" data-section="why" className="scroll-mt-32">
          <h2 className="mb-5 text-2xl font-bold tracking-tight">{tr(dataRoom.whySynthetic.title, locale)}</h2>
          <Paragraphs text={tr(dataRoom.whySynthetic.body, locale)} />
        </section>

        <section id="model" data-section="model" className="scroll-mt-32 space-y-8">
          <Diagram id={dataRoom.erd.id} locale={locale} caption={tr(dataRoom.erd.caption, locale)} />
          <div>
            <h2 className="mb-5 text-2xl font-bold tracking-tight">{tr(dataRoom.dictionaryTitle, locale)}</h2>
            <div className="space-y-3">
              {dataRoom.tables.map((table) => (
                <details key={table.name} id={`table-${table.name.split(" ")[0]}`} className="group rounded-2xl border border-line bg-surface">
                  <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
                    <code className="text-base font-semibold">{table.name}</code>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${table.kind === "fact" ? "bg-accent-soft text-accent" : "bg-chef-soft text-chef"}`}>
                      {table.kind === "fact" ? m.dataRoom.fact : m.dataRoom.dimension}
                    </span>
                    <span className="min-w-0 flex-1 text-sm text-muted">{tr(table.grain, locale)}</span>
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </summary>
                  <div className="border-t border-line px-5 py-4">
                    <p className="text-sm">
                      <span className="font-semibold">{m.dataRoom.grain}: </span>
                      {tr(table.grain, locale)}
                    </p>
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-line text-start text-muted">
                            <th className="py-2 pe-4 text-start font-medium">{m.dataRoom.column}</th>
                            <th className="py-2 text-start font-medium">{m.dataRoom.meaning}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {table.columns.map((col) => (
                            <tr key={col.name} className="border-b border-line/60 align-top last:border-0">
                              <td className="py-2 pe-4">
                                <code className="whitespace-nowrap">{col.name}</code>
                              </td>
                              <td className="py-2">{tr(col.note, locale)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="decisions" data-section="decisions" className="scroll-mt-32">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">{tr(dataRoom.decisionsTitle, locale)}</h2>
          <Decisions
            slug="specv-data"
            items={dataRoom.decisions.map((d) => ({ id: d.id, title: tr(d.title, locale), why: tr(d.why, locale), tradeoff: tr(d.tradeoff, locale) }))}
            labels={{ why: m.project.why, tradeoff: m.project.tradeoff }}
          />
        </section>

        <section id="generator" data-section="generator" className="scroll-mt-32">
          <h2 className="mb-5 text-2xl font-bold tracking-tight">{tr(dataRoom.generator.title, locale)}</h2>
          <Paragraphs text={tr(dataRoom.generator.body, locale)} />
        </section>

        <section id="queries" data-section="queries" className="scroll-mt-32 space-y-14">
          <h2 className="text-2xl font-bold tracking-tight">{tr(dataRoom.queriesTitle, locale)}</h2>
          {dataRoom.queries.map((q, i) => {
            const sql = dataRoomQueries.find((d) => d.id === q.id)!.sql;
            const result = data.results[q.id];
            return (
              <div key={q.id} className="space-y-4">
                <h3 className="flex gap-3 text-xl font-semibold">
                  <span aria-hidden="true" className="text-accent/70 tabular-nums">
                    {i + 1}
                  </span>
                  <span>{tr(q.question, locale)}</span>
                </h3>
                <div className="overflow-hidden rounded-2xl border border-line bg-sunken">
                  <div className="flex items-center justify-between border-b border-line px-4 py-2 text-xs text-muted">
                    <span dir="ltr">SQL · PostgreSQL</span>
                    <CopyButton text={sql} label={m.dataRoom.copy} done={m.dataRoom.copied} />
                  </div>
                  <pre dir="ltr" className="overflow-x-auto p-4 text-[13px] leading-relaxed">
                    <code>{sql}</code>
                  </pre>
                </div>
                {result && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-muted">{m.dataRoom.result}</p>
                    <div dir="ltr" className="overflow-x-auto rounded-2xl border border-line bg-surface">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-line bg-sunken/60">
                            {result.columns.map((c) => (
                              <th key={c} scope="col" className="px-4 py-2 text-start font-mono text-xs font-semibold">
                                {c}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.rows.map((row, r) => (
                            <tr key={r} className="border-b border-line/60 last:border-0">
                              {row.map((cell, c) => (
                                <td key={c} className={`px-4 py-2 ${typeof cell === "number" ? "text-end tabular-nums" : "font-mono text-xs"}`}>
                                  {typeof cell === "number" ? formatNumber(cell, "en") : (cell ?? "—")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                <div className="rounded-2xl border border-accent/20 bg-accent-soft p-5">
                  <p className="text-sm font-semibold text-accent">{m.dataRoom.insight}</p>
                  <p className="mt-1 max-w-prose">{tr(q.insight, locale)}</p>
                </div>
              </div>
            );
          })}
        </section>

        <section id="scale" data-section="scale" className="scroll-mt-32">
          <h2 className="mb-5 text-2xl font-bold tracking-tight">{tr(dataRoom.scale.title, locale)}</h2>
          <Paragraphs text={tr(dataRoom.scale.body, locale)} />
        </section>

        <nav className="border-t border-line pt-10">
          <Link href={localizePath("/work/specv", locale)} className="font-semibold text-accent hover:underline">
            <span aria-hidden="true" className="inline-block rtl:rotate-180">←</span> {m.dataRoom.back}
          </Link>
        </nav>
      </div>
    </article>
  );
}
