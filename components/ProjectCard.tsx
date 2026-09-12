import { projectHref } from "@/content/projects";
import type { Exhibit } from "@/lib/exhibit/load";
import { galleryShot } from "@/lib/exhibit/view";
import { tr, type Locale } from "@/lib/i18n";
import { getMessages } from "@/messages";
import { RelativeTime } from "./RelativeTime";
import { ShotImage } from "./ShotImage";

/**
 * A menu card. The whole card is a link to the full story (stretched title link, so it works
 * without JS); "Quick look" is also a real link that JS upgrades into the peek dialog.
 */
export function ProjectCard({ exhibit, locale, featured = false }: { exhibit: Exhibit; locale: Locale; featured?: boolean }) {
  const { project, screenshots, updatedAt, source } = exhibit;
  const m = getMessages(locale);
  const href = projectHref(project.slug, locale);
  const title = tr(project.title, locale);
  const first = project.gallery[0] ? galleryShot(screenshots, project.gallery[0], locale, "desktop") : null;
  const second = project.gallery[1] ? galleryShot(screenshots, project.gallery[1], locale, "desktop") : null;
  const imageSizes = featured ? "(min-width: 1024px) 680px, 100vw" : "(min-width: 1280px) 290px, (min-width: 640px) 50vw, 100vw";

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] focus-within:-translate-y-0.5 focus-within:shadow-[var(--shadow-lift)] motion-reduce:transform-none ${
        featured ? "ring-1 ring-chef/30 lg:flex-row" : ""
      }`}
    >
      <div
        className={`relative aspect-[16/10] overflow-hidden border-b border-line bg-sunken ${
          featured ? "lg:aspect-auto lg:min-h-[22rem] lg:w-[58%] lg:shrink-0 lg:border-b-0 lg:border-e" : ""
        }`}
      >
        {first && (
          <ShotImage
            light={first.light}
            dark={first.dark}
            alt=""
            sizes={imageSizes}
            priority={featured}
            className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-200 ${second ? "group-hover:opacity-0 group-focus-within:opacity-0" : ""}`}
          />
        )}
        {second && (
          // The second screen only matters where hover exists; on touch it's never fetched.
          <div className="hidden [@media(hover:hover)]:block">
            <ShotImage
              light={second.light}
              dark={second.dark}
              alt=""
              sizes={imageSizes}
              className="absolute inset-0 h-full w-full object-cover object-top opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
            />
          </div>
        )}
        <span className="absolute start-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-medium text-paper backdrop-blur">
          {m.card.demoData}
        </span>
        {project.recommended && (
          <span className="absolute end-3 top-3 rounded-full bg-chef-soft px-3 py-1 text-xs font-semibold text-chef shadow-sm">
            ★ {m.card.recommended}
          </span>
        )}
      </div>

      <div className={`flex flex-1 flex-col gap-3 p-5 ${featured ? "lg:p-7" : ""}`}>
        <div>
          <h3 className={`font-bold tracking-tight ${featured ? "text-2xl" : "text-xl"}`}>
            <a href={href} className="outline-none after:absolute after:inset-0 after:rounded-[var(--radius-card)] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-focus" data-entry="card">
              {title}
            </a>
          </h3>
          <p className="mt-1 text-muted">{tr(project.tagline, locale)}</p>
          {featured && <p className="mt-3 hidden max-w-prose lg:block">{tr(project.overview, locale)}</p>}
        </div>
        <p className="flex items-start gap-2 text-sm">
          <svg aria-hidden="true" viewBox="0 0 20 20" className="mt-0.5 size-4 shrink-0 text-accent" fill="currentColor">
            <path d="M10 1.5l2.2 5.1 5.3.4-4 3.6 1.2 5.3L10 13.1l-4.7 2.8 1.2-5.3-4-3.6 5.3-.4z" />
          </svg>
          <span>{tr(project.cardFact, locale)}</span>
        </p>
        <ul aria-label={m.card.stack} className="flex flex-wrap gap-1.5">
          {project.stack.slice(0, featured ? 6 : 4).map((s) => (
            <li key={s} dir="ltr" className="rounded-md bg-sunken px-2 py-0.5 text-xs font-medium text-muted">
              {s}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
          <span className="text-xs text-muted">
            {source.capture === "manual" || !updatedAt ? m.card.fromDemo : <RelativeTime iso={updatedAt} locale={locale} template={m.card.updated} />}
          </span>
          <div className="relative z-10 flex gap-2">
            <a
              href={href}
              data-peek-trigger={project.slug}
              className="rounded-full border border-line px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 hover:border-ink/40 hover:bg-sunken"
            >
              {m.card.quickLook}
            </a>
            <a
              href={href}
              data-entry="card"
              className="rounded-full bg-accent px-3.5 py-1.5 text-sm font-medium text-accent-ink transition-opacity duration-150 hover:opacity-90"
            >
              {m.card.fullStory}
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
