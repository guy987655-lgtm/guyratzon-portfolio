import { getMessages } from "@/messages";
import type { Locale } from "@/lib/i18n";
import { CONTACT } from "@/lib/site";
import { LocaleSwitch } from "./LocaleSwitch";
import { ThemeToggle } from "./ThemeToggle";

export function Footer({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
            <li>
              <a href={CONTACT.linkedin} rel="noopener" target="_blank" data-contact="linkedin" className="underline decoration-line underline-offset-4 hover:decoration-ink">
                {m.footer.linkedin}
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT.email}`} data-contact="email" className="underline decoration-line underline-offset-4 hover:decoration-ink">
                <span dir="ltr">{CONTACT.email}</span>
              </a>
            </li>
          </ul>
          <p className="max-w-prose text-sm text-muted">{m.footer.note}</p>
        </div>
        <div className="flex items-center gap-2">
          <LocaleSwitch locale={locale} label={m.a11y.languageSwitch} />
          <ThemeToggle label={m.a11y.toggleTheme} />
        </div>
      </div>
    </footer>
  );
}
