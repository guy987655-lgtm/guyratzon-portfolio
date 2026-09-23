import Link from "next/link";
import { notFound } from "next/navigation";
import { ProsePage } from "@/components/ProsePage";
import { about } from "@/content/pages/about";
import { hasLocale, localizePath, tr } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { CONTACT } from "@/lib/site";
import { getMessages } from "@/messages";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const m = getMessages(locale);
  return buildMetadata({ locale, path: "/about", title: `${tr(about.title, locale)} - ${m.meta.siteName}`, description: tr(about.lead, locale), ogImage: `/og/home-${locale}.png` });
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const m = getMessages(locale);
  return (
    <ProsePage locale={locale} title={about.title} lead={about.lead} sections={about.sections}>
      <section aria-label={m.footer.linkedin} className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
        <div className="flex flex-wrap gap-3">
          <a href={CONTACT.linkedin} target="_blank" rel="noopener" data-contact="linkedin" className="rounded-full bg-accent px-6 py-3 font-semibold text-accent-ink hover:opacity-90">
            {m.footer.linkedin} <span aria-hidden="true">↗</span>
          </a>
          <a href={`mailto:${CONTACT.email}`} data-contact="email" className="rounded-full border border-line px-6 py-3 font-semibold hover:bg-sunken">
            <span dir="ltr">{CONTACT.email}</span>
          </a>
        </div>
        <Link href={`${localizePath("/", locale)}#work`} className="mt-6 inline-block font-medium text-accent hover:underline">
          {m.home.cta} <span aria-hidden="true" className="inline-block rtl:rotate-180">→</span>
        </Link>
      </section>
    </ProsePage>
  );
}
