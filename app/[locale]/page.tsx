import Link from "next/link";
import { notFound } from "next/navigation";
import { HomeView } from "@/components/Analytics";
import { ProjectCard } from "@/components/ProjectCard";
import { QuickPeek, type PeekItem } from "@/components/QuickPeek";
import { projectHref, projects } from "@/content/projects";
import { getExhibits } from "@/lib/exhibit/load";
import { galleryShot } from "@/lib/exhibit/view";
import { fill } from "@/lib/format";
import { formatDate, hasLocale, localizePath, tr } from "@/lib/i18n";
import { latestCapture } from "@/lib/screenshots";
import { buildMetadata } from "@/lib/seo";
import { getMessages } from "@/messages";

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const m = getMessages(locale);
  return buildMetadata({ locale, path: "/", title: m.meta.siteName, description: m.meta.description, ogImage: `/og/home-${locale}.png` });
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const m = getMessages(locale);
  const exhibits = await getExhibits(projects.map((p) => p.slug));
  const [featured, ...rest] = exhibits;
  const lastCapture = latestCapture(exhibits.map((e) => e.screenshots));

  const peekItems: Record<string, PeekItem> = Object.fromEntries(
    exhibits.map(({ project, screenshots, source }) => [
      project.slug,
      {
        slug: project.slug,
        title: tr(project.title, locale),
        tagline: tr(project.tagline, locale),
        points: project.peek.map((p) => tr(p, locale)),
        href: projectHref(project.slug, locale),
        liveUrl: source.liveDemoUrl,
        screens: project.gallery.slice(0, 4).flatMap((item) => {
          const shot = galleryShot(screenshots, item, locale, "desktop");
          return shot ? [{ light: shot.light, dark: shot.dark, caption: tr(item.caption, locale) }] : [];
        }),
      },
    ]),
  );

  return (
    <>
      <HomeView />
      <section className="border-b border-line bg-[radial-gradient(ellipse_at_top,var(--color-accent-soft),transparent_60%)]">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
          <p className="text-sm font-semibold tracking-wide text-accent">{m.home.role}</p>
          <h1 className="mt-3 text-5xl font-bold tracking-tight sm:text-6xl">{m.home.name}</h1>
          <p className="mt-6 max-w-2xl text-lg sm:text-xl">{m.home.lead}</p>
          <p className="mt-3 max-w-2xl text-lg text-muted sm:text-xl">{m.home.leadSecond}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#work" className="rounded-full bg-accent px-6 py-3 font-semibold text-accent-ink shadow-sm transition-opacity duration-150 hover:opacity-90">
              {m.home.cta} ↓
            </a>
            <Link href={localizePath("/how-i-work", locale)} className="rounded-full border border-line bg-surface px-6 py-3 font-semibold transition-colors duration-150 hover:bg-sunken">
              {m.home.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      <section id="work" data-section="work" aria-labelledby="menu-title" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-2">
          <h2 id="menu-title" className="text-3xl font-bold tracking-tight">
            {m.home.menuTitle}
          </h2>
          <p className="text-muted">{m.home.menuLead}</p>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {featured && (
            <li className="sm:col-span-2 xl:col-span-4">
              <ProjectCard exhibit={featured} locale={locale} featured />
            </li>
          )}
          {rest.map((exhibit) => (
            <li key={exhibit.project.slug}>
              <ProjectCard exhibit={exhibit} locale={locale} />
            </li>
          ))}
        </ul>
      </section>

      <section data-section="how" aria-labelledby="how-title" className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-[1fr_2fr]">
          <div>
            <h2 id="how-title" className="text-2xl font-bold tracking-tight">
              {m.home.howTitle}
            </h2>
            <Link href={localizePath("/how-i-work", locale)} className="mt-3 inline-block font-medium text-accent underline-offset-4 hover:underline">
              {m.home.howLink} <span aria-hidden="true" className="inline-block rtl:rotate-180">→</span>
            </Link>
          </div>
          <ol className="grid gap-5 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
            {m.home.howPoints.map((point, i) => (
              <li key={i} className="flex gap-3">
                <span aria-hidden="true" className="text-2xl font-bold text-accent/70 tabular-nums">
                  {i + 1}
                </span>
                <p>{point}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {lastCapture && (
        <p className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-muted sm:px-6">
          {fill(m.home.freshness, { date: formatDate(lastCapture, locale) })}
        </p>
      )}

      <QuickPeek
        items={peekItems}
        rtl={locale === "he"}
        labels={{
          close: m.a11y.close,
          readStory: m.peek.readStory,
          openLive: m.peek.openLive,
          points: m.peek.points,
          screen: m.peek.screen,
          previous: m.a11y.previous,
          next: m.a11y.next,
          demoData: m.card.demoData,
        }}
      />
    </>
  );
}
