import { routeFor } from "@/content/projects";
import type { Device, GalleryItem } from "@/content/types";
import type { Locale } from "../i18n";
import { pickShot, type ScreenshotIndex, type Shot } from "../screenshots";

export type ShotPair = { light: Shot | null; dark: Shot | null };

export function shotPair(index: ScreenshotIndex | null, route: string, locale: Locale, device: Device): ShotPair {
  return { light: pickShot(index, route, locale, device, "light"), dark: pickShot(index, route, locale, device, "dark") };
}

/** Best available pair for a gallery item: the preferred device, falling back to the other one. */
export function galleryShot(
  index: ScreenshotIndex | null,
  item: GalleryItem,
  locale: Locale,
  prefer: Device = "desktop",
): (ShotPair & { device: Device }) | null {
  const route = routeFor(item.route, locale);
  const order: Device[] = prefer === "desktop" ? ["desktop", "mobile"] : ["mobile", "desktop"];
  for (const device of order) {
    if (item.devices && !item.devices.includes(device)) continue;
    const pair = shotPair(index, route, locale, device);
    if (pair.light || pair.dark) return { ...pair, device };
  }
  return null;
}

/** True when the app's own interface doesn't speak the visitor's language (drives the badge + callouts). */
export function interfaceDiffers(interfaceLocales: Locale[], locale: Locale): boolean {
  return !interfaceLocales.includes(locale);
}
