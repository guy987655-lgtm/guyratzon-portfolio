import type { Messages } from "./he";

/** English UI strings. Typed against the Hebrew object, so a missing or extra key fails tsc. */
export const en: Messages = {
  meta: {
    siteName: "Guy Ratzon — Portfolio",
    description:
      "Guy Ratzon's portfolio: five products I built, how I built them, and the calls I made along the way. Every screen shows demo data.",
  },
  a11y: {
    skipToContent: "Skip to content",
    mainNav: "Main navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    toggleTheme: "Toggle color theme",
    languageSwitch: "Choose language",
    close: "Close",
    previous: "Previous",
    next: "Next",
  },
  nav: {
    work: "Work",
    howIWork: "How I work",
    about: "About",
    home: "Home",
    projects: "Projects",
  },
  footer: {
    linkedin: "LinkedIn",
    email: "Email",
    note: "Built and maintained by Guy Ratzon. Every screen on this site shows demo data only.",
  },
  notFound: {
    title: "Page not found",
    body: "This address doesn't exist, or the page has moved.",
    back: "Back to the work menu",
  },
};
