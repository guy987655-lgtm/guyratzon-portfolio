import type { Locale } from "@/lib/i18n";
import { en } from "./en";
import { he, type Messages } from "./he";

const dictionaries: Record<Locale, Messages> = { he, en };

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale];
}

export { he, en, type Messages };
