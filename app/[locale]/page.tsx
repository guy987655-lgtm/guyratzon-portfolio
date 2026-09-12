import { projectHref, projectMeta } from "@/content/projects";
import { hasLocale, tr } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { getMessages } from "@/messages";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const m = getMessages(locale);
  return buildMetadata({ locale, path: "/", title: m.meta.siteName, description: m.meta.description });
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const m = getMessages(locale);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="py-16 sm:py-24">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{locale === "he" ? "גיא רצון" : "Guy Ratzon"}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">{m.meta.description}</p>
      </section>
      <section id="work" data-section="work" className="scroll-mt-20 pb-24">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projectMeta.map((p) => (
            <li key={p.slug}>
              <a href={projectHref(p.slug, locale)} className="block rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
                <span className="block text-lg font-semibold">{tr(p.title, locale)}</span>
                <span className="mt-1 block text-muted">{tr(p.tagline, locale)}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
