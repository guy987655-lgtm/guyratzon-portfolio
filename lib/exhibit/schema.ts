import { z } from "zod";

/**
 * The exhibit contract. Every source site serves this JSON at GET /api/exhibit (public, no auth,
 * no personal data, Cache-Control: public, max-age=300). A change here ships to all sites together.
 * All prose is bilingual and required — a manifest with a missing language is rejected.
 */
const text = z.string().trim().min(1);
export const L10nSchema = z.object({ he: text, en: text }).strict();

export const TourRouteSchema = z
  .object({
    /** Stable id; the portfolio's gallery and allowlist refer to routes by id. */
    id: z.string().regex(/^[a-z0-9-]+$/),
    /** Same-origin path including the demo flag, e.g. "/?demo=1&view=trends". */
    path: z.string().startsWith("/"),
    caption: L10nSchema,
    /** Interface language this route renders in (for sites that support more than one). */
    locale: z.enum(["he", "en"]).optional(),
  })
  .strict();

export const ExhibitManifestSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    title: L10nSchema,
    headline: L10nSchema,
    status: z.enum(["live", "in-progress", "paused"]),
    depth: z.enum(["full", "compact"]),
    version: z.string().min(1),
    updatedAt: z.iso.datetime({ offset: true }),
    stack: z.array(text).min(1),
    /** Neutral facts only — never money, health values, holdings, or inflated user counts. */
    facts: z.array(z.object({ label: L10nSchema, value: L10nSchema }).strict()).optional(),
    highlights: z.array(z.object({ title: L10nSchema, body: L10nSchema }).strict()),
    demoMode: z
      .object({
        supported: z.boolean(),
        entryUrl: z.string().startsWith("/").optional(),
        note: L10nSchema.optional(),
      })
      .strict(),
    locales: z.array(z.enum(["he", "en"])).min(1).optional(),
    tourRoutes: z.array(TourRouteSchema).optional(),
  })
  .strict();

export type ExhibitManifest = z.infer<typeof ExhibitManifestSchema>;
export type TourRoute = z.infer<typeof TourRouteSchema>;
