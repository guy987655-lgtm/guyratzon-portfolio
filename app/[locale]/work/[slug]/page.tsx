import Link from "next/link";
import { notFound } from "next/navigation";
import { Decisions } from "@/components/Decisions";
import { Diagram } from "@/components/Diagram";
import { Gallery, type GallerySlide } from "@/components/Gallery";
import { JumpBar } from "@/components/JumpBar";
import { LiveFrame } from "@/components/LiveFrame";
import { ProjectOpen } from "@/components/ProjectOpen";
import { RelativeTime } from "@/components/RelativeTime";
import { ShotImage } from "@/components/ShotImage";
import { getProject, nextProject, projectHref, projects, routeFor } from "@/content/projects";
import type { Device } from "@/content/types";
import { getExhibit } from "@/lib/exhibit/load";
import { galleryShot, interfaceDiffers, shotPair } from "@/lib/exhibit/view";
import { fill } from "@/lib/format";
import { formatDate, hasLocale, localizePath, tr, type Locale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { getMessages } from "@/messages";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/work/[slug]">) {
  const { locale, slug } = await params;
  const project = getProject(slug);
  if (!hasLocale(locale) || !project) return {};
  const m = getMessages(locale);
  return buildMetadata({
    locale,
    path: `/work/${slug}`,
    title: `${tr(project.title, locale)} — ${m.meta.siteName}`,
    description: tr(project.overview, locale),
    ogImage: `/og/${slug}-${locale}.png`,
  });
}

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n\n+/).map((p, i) => (
        <p key={i} className="max-w-prose">
          {p}
        </p>
      ))}
    </>
  );
}

export default async function ProjectPage({ params }: PageProps<"/[locale]/work/[slug]">) {
  const { locale, slug } = await params;
  const project = getProject(slug);
  if (!hasLocale(locale) || !project) notFound();
  const m = getMessages(locale);
  const exhibit = await getExhibit(project.slug);
  const { screenshots, updatedAt, source, manifest } = exhibit;
  const full = project.depth === "full";
  const next = nextProject(project.slug);
  const foreignUi = interfaceDiffers(project.interfaceLocales, locale);
  const uiLang = (l: Locale) => (l === "he" ? m.project.langHe : m.project.langEn);
  const badges = [m.card.demoData, ...(foreignUi ? [fill(m.project.interface, { lang: uiLang(project.interfaceLocales[0] ?? "en") })] : [])];

  const slides: GallerySlide[] = project.gallery.map((item) => {
    const route = routeFor(item.route, locale);
    const devices: Device[] = item.devices ?? ["desktop", "mobile"];
    const shots: GallerySlide["shots"] = {};
    for (const d of devices) {
      const pair = shotPair(screenshots, route, locale, d);
      if (pair.light || pair.dark) shots[d] = pair;
    }
    const callouts: GallerySlide["callouts"] = {};
    for (const d of devices) {
      const list = item.callouts?.[d];
      if (list) callouts[d] = list.map((c) => ({ n: c.n, x: c.x, y: c.y, text: tr(c.text, locale) }));
    }
    return { caption: tr(item.caption, locale), shots, callouts };
  });

  const sections = [
    { id: "overview", label: m.project.overview },
    { id: "gallery", label: m.project.gallery },
    { id: "build", label: m.project.howBuilt },
    { id: "decisions", label: m.project.underTheHood },
    ...(full && project.whatBroke ? [{ id: "broke", label: m.project.whatBroke }] : []),
    ...(project.liveFrame && project.liveUrl ? [{ id: "live", label: m.project.liveScreen }] : []),
  ];
  const decisions = (full ? project.decisions : project.decisions.slice(0, 2)).map((d) => ({
    id: d.id,
    title: tr(d.title, locale),
    why: tr(d.why, locale),
    tradeoff: tr(d.tradeoff, locale),
  }));
  const status = manifest?.status ?? "live";
  const liveFallback = project.gallery[0] ? galleryShot(screenshots, project.gallery[0], locale, "desktop") : null;

  return (
    <article>
      <ProjectOpen slug={project.slug} />
      <header className="border-b border-line bg-[radial-gradient(ellipse_at_top,var(--color-accent-soft),transparent_65%)]">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-12">
          <Link href={`${localizePath("/", locale)}#work`} className="text-sm font-medium text-muted hover:text-ink">
            <span aria-hidden="true" className="inline-block rtl:rotate-180">←</span> {m.project.backToMenu}
          </Link>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{tr(project.title, locale)}</h1>
          <p className="mt-3 text-xl text-muted">{tr(project.tagline, locale)}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 font-medium shadow-sm">
              <span aria-hidden="true" className={`size-2 rounded-full ${status === "live" ? "bg-accent" : "bg-muted"}`} />
              {m.project.status[status]}
            </span>
            <span className="text-muted">{fill(m.project.builtAt, { date: formatDate(project.builtAt, locale, { month: "long", year: "numeric" }) })}</span>
            <span className="text-muted">
              {source.capture === "manual" || !updatedAt ? m.card.fromDemo : <RelativeTime iso={updatedAt} locale={locale} template={m.card.updated} />}
            </span>
          </div>
          <p className="mt-4 max-w-prose">{tr(project.usage, locale)}</p>
          <ul aria-label={m.card.stack} className="mt-5 flex flex-wrap gap-1.5">
            {project.stack.map((s) => (
              <li key={s} dir="ltr" className="rounded-md border border-line bg-surface px-2 py-0.5 text-xs font-medium text-muted">
                {s}
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            {source.liveDemoUrl ? (
              <a
                href={source.liveDemoUrl}
                target="_blank"
                rel="noopener"
                data-live-link={project.slug}
                className="rounded-full bg-accent px-6 py-3 font-semibold text-accent-ink shadow-sm hover:opacity-90"
              >
                {m.project.openLive} <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <p className="rounded-full border border-dashed border-line px-4 py-2 text-sm text-muted">{m.project.noLive}</p>
            )}
            {project.slug === "specv" && (
              <Link href={localizePath("/work/specv/data", locale)} className="rounded-full border border-line bg-surface px-6 py-3 font-semibold hover:bg-sunken">
                {m.project.dataRoom}
              </Link>
            )}
          </div>
        </div>
      </header>

      <JumpBar items={sections} label={m.project.jump} />

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-14 sm:px-6 sm:py-20">
        <section id="overview" data-section="overview" aria-labelledby="h-overview" className="scroll-mt-32">
          <h2 id="h-overview" className="sr-only">
            {m.project.overview}
          </h2>
          <p className="max-w-3xl text-2xl leading-snug font-medium sm:text-3xl">{tr(project.overview, locale)}</p>
        </section>

        <section id="gallery" data-section="gallery" aria-labelledby="h-gallery" className="scroll-mt-32">
          <h2 id="h-gallery" className="mb-6 text-2xl font-bold tracking-tight">
            {m.project.gallery}
          </h2>
          <Gallery
            slug={project.slug}
            slides={slides}
            rtl={locale === "he"}
            badges={badges}
            labels={{
              mobile: m.project.mobile,
              desktop: m.project.desktop,
              deviceToggle: m.project.deviceToggle,
              previous: m.a11y.previous,
              next: m.a11y.next,
              screen: m.peek.screen,
              demoData: m.card.demoData,
              calloutsTitle: m.project.calloutsTitle,
            }}
          />
        </section>

        <section id="build" data-section="build" aria-labelledby="h-build" className="scroll-mt-32">
          <h2 id="h-build" className="mb-6 text-2xl font-bold tracking-tight">
            {m.project.howBuilt}
          </h2>
          <div className={`grid gap-10 ${full ? "lg:grid-cols-2" : ""}`}>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold tracking-wide text-accent">{m.project.problem}</h3>
              <Paragraphs text={tr(project.problem, locale)} />
            </div>
            {full && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold tracking-wide text-accent">{m.project.approach}</h3>
                <div className="space-y-4">
                  <Paragraphs text={tr(project.approach, locale)} />
                </div>
              </div>
            )}
          </div>
          {full && project.diagram && (
            <div className="mt-10">
              <Diagram id={project.diagram} locale={locale} caption={m.project.diagramCaption} />
            </div>
          )}
        </section>

        <section id="decisions" data-section="decisions" aria-labelledby="h-decisions" className="scroll-mt-32">
          <h2 id="h-decisions" className="mb-6 text-2xl font-bold tracking-tight">
            {m.project.underTheHood}
          </h2>
          <Decisions slug={project.slug} items={decisions} labels={{ why: m.project.why, tradeoff: m.project.tradeoff }} />
        </section>

        {full && project.whatBroke && (
          <section id="broke" data-section="broke" aria-labelledby="h-broke" className="scroll-mt-32">
            <h2 id="h-broke" className="mb-6 text-2xl font-bold tracking-tight">
              {m.project.whatBroke}
            </h2>
            <div className="rounded-2xl border border-chef/25 bg-chef-soft p-6 sm:p-8">
              <p className="max-w-prose text-lg">{tr(project.whatBroke, locale)}</p>
            </div>
          </section>
        )}

        {project.liveFrame && project.liveUrl && (
          <section id="live" data-section="live" aria-labelledby="h-live" className="scroll-mt-32">
            <h2 id="h-live" className="mb-6 text-2xl font-bold tracking-tight">
              {m.project.liveScreen}
            </h2>
            <LiveFrame
              slug={project.slug}
              src={`${project.liveUrl}${project.liveUrl.includes("lang=") ? "" : `&lang=${locale}`}`}
              title={tr(project.title, locale)}
              labels={{ load: m.project.liveFrameLoad, note: m.project.liveFrameNote, fallback: m.project.liveFrameFallback }}
              fallback={
                liveFallback ? (
                  <div className="overflow-hidden rounded-2xl border border-line">
                    <ShotImage light={liveFallback.light} dark={liveFallback.dark} alt={tr(project.gallery[0]!.caption, locale)} sizes="(min-width: 1152px) 1100px, 100vw" className="block h-auto w-full" />
                  </div>
                ) : null
              }
            />
          </section>
        )}

        <nav aria-label={m.project.next} className="grid gap-4 border-t border-line pt-10 sm:grid-cols-2">
          <a href={projectHref(next.slug, locale)} data-entry="next" className="group rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
            <span className="text-sm font-medium text-muted">{m.project.next}</span>
            <span className="mt-1 block text-xl font-bold">
              {tr(next.title, locale)} <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">→</span>
            </span>
            <span className="mt-1 block text-muted">{tr(next.tagline, locale)}</span>
          </a>
          <Link href={`${localizePath("/", locale)}#work`} className="flex items-center justify-center rounded-2xl border border-dashed border-line p-6 font-semibold text-muted hover:bg-sunken hover:text-ink">
            {m.project.backToMenu}
          </Link>
        </nav>
      </div>
    </article>
  );
}
