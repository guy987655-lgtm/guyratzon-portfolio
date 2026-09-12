import type { ProseSection } from "@/content/pages/how-i-work";
import { tr, type L10n, type Locale } from "@/lib/i18n";

/** Long-form text page (How I work, About): a header and titled sections, every word in the HTML. */
export function ProsePage({ locale, title, lead, sections, children }: { locale: Locale; title: L10n; lead: L10n; sections: ProseSection[]; children?: React.ReactNode }) {
  return (
    <article>
      <header className="border-b border-line bg-[radial-gradient(ellipse_at_top,var(--color-accent-soft),transparent_65%)]">
        <div className="mx-auto max-w-3xl px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{tr(title, locale)}</h1>
          <p className="mt-4 text-xl text-muted">{tr(lead, locale)}</p>
        </div>
      </header>
      <div className="mx-auto max-w-3xl space-y-14 px-4 py-14 sm:px-6 sm:py-20">
        {sections.map((s, i) => (
          <section key={s.id} id={s.id} data-section={s.id} className="scroll-mt-24">
            <h2 className="flex gap-3 text-2xl font-bold tracking-tight">
              <span aria-hidden="true" className="text-accent/60 tabular-nums">
                {i + 1}
              </span>
              <span>{tr(s.title, locale)}</span>
            </h2>
            <div className="mt-4 space-y-4 text-lg">
              {tr(s.body, locale)
                .split(/\n\n+/)
                .map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
            </div>
          </section>
        ))}
        {children}
      </div>
    </article>
  );
}
