import Link from "next/link";
import { notFound } from "next/navigation";
import { ProsePage } from "@/components/ProsePage";
import { howIWork } from "@/content/pages/how-i-work";
import { hasLocale, localizePath, tr } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { getMessages } from "@/messages";

export async function generateMetadata({ params }: PageProps<"/[locale]/how-i-work">) {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const m = getMessages(locale);
  return buildMetadata({ locale, path: "/how-i-work", title: `${tr(howIWork.title, locale)} - ${m.meta.siteName}`, description: tr(howIWork.lead, locale), ogImage: `/og/home-${locale}.png` });
}

export default async function HowIWorkPage({ params }: PageProps<"/[locale]/how-i-work">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const m = getMessages(locale);
  return (
    <ProsePage locale={locale} title={howIWork.title} lead={howIWork.lead} sections={howIWork.sections}>
      <div className="flex flex-wrap gap-3 border-t border-line pt-10">
        <Link href={`${localizePath("/", locale)}#work`} className="rounded-full bg-accent px-6 py-3 font-semibold text-accent-ink hover:opacity-90">
          {m.home.cta}
        </Link>
        <Link href={localizePath("/about", locale)} className="rounded-full border border-line bg-surface px-6 py-3 font-semibold hover:bg-sunken">
          {m.nav.about}
        </Link>
      </div>
    </ProsePage>
  );
}
