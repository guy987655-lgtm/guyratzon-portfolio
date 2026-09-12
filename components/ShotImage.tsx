import Image from "next/image";
import type { Shot } from "@/lib/screenshots";

/**
 * A captured screen that follows the site's theme. Single-look apps have one "any" shot; apps
 * with both looks get a light and a dark image, swapped by CSS so there's no hydration mismatch.
 */
export function ShotImage({
  light,
  dark,
  alt,
  sizes,
  priority = false,
  eager = false,
  className = "",
}: {
  light: Shot | null;
  dark: Shot | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  /** Load without lazy-loading (above-the-fold images that shouldn't compete as a preload). */
  eager?: boolean;
  className?: string;
}) {
  const same = !light || !dark || light.file === dark.file;
  const base = light ?? dark;
  if (!base) return null;
  const img = (shot: Shot, extra: string) => (
    <Image
      key={shot.file}
      src={shot.file}
      alt={alt}
      width={shot.width}
      height={shot.height}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : eager ? "eager" : undefined}
      quality={75}
      className={`${className} ${extra}`}
    />
  );
  if (same) return img(base, "");
  return (
    <>
      {img(light!, "dark:hidden")}
      {img(dark!, "hidden dark:block")}
    </>
  );
}
