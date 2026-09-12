import Link from "next/link";
import { getMessages } from "@/messages";
import { localizePath, type Locale } from "@/lib/i18n";
import { LocaleSwitch } from "./LocaleSwitch";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";

export function Header({ locale, projects }: { locale: Locale; projects: { href: string; label: string }[] }) {
  const m = getMessages(locale);
  const nav = [
    { href: `${localizePath("/", locale)}#work`, label: m.nav.work },
    { href: localizePath("/how-i-work", locale), label: m.nav.howIWork },
    { href: localizePath("/about", locale), label: m.nav.about },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href={localizePath("/", locale)} className="me-auto text-base font-bold tracking-tight">
          {locale === "he" ? "גיא רצון" : "Guy Ratzon"}
        </Link>
        <nav aria-label={m.a11y.mainNav} className="hidden md:block">
          <ul className="flex items-center gap-1 text-sm font-medium">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="rounded-full px-3 py-2 text-muted transition-colors duration-150 hover:bg-sunken hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hidden items-center gap-1 md:flex">
          <LocaleSwitch locale={locale} label={m.a11y.languageSwitch} />
          <ThemeToggle label={m.a11y.toggleTheme} />
        </div>
        <MobileMenu nav={nav} projects={projects} projectsLabel={m.nav.projects} openLabel={m.a11y.openMenu} closeLabel={m.a11y.closeMenu}>
          <LocaleSwitch locale={locale} label={m.a11y.languageSwitch} />
          <ThemeToggle label={m.a11y.toggleTheme} />
        </MobileMenu>
      </div>
    </header>
  );
}
