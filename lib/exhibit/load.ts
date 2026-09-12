import "server-only";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { sourceFor, type Source } from "@/config/sources";
import { getProject } from "@/content/projects";
import type { Project, Slug } from "@/content/types";
import { readScreenshotIndex, type ScreenshotIndex } from "../screenshots";
import { lastProductionDeploy } from "../vercel";
import { ExhibitManifestSchema, type ExhibitManifest } from "./schema";

export type Exhibit = {
  project: Project;
  source: Source;
  /** The reviewed manifest snapshot committed to this repo (never fetched live at render time). */
  manifest: ExhibitManifest | null;
  screenshots: ScreenshotIndex | null;
  /**
   * When the source site last changed: Vercel's last production deploy, else the manifest's
   * updatedAt. Null for manual exhibits, which say "from the demo version" instead.
   */
  updatedAt: string | null;
};

function readManifest(slug: Slug): ExhibitManifest | null {
  const file = join(process.cwd(), "data", "manifests", `${slug}.json`);
  if (!existsSync(file)) return null;
  const parsed = ExhibitManifestSchema.safeParse(JSON.parse(readFileSync(file, "utf8")));
  return parsed.success ? parsed.data : null;
}

export async function getExhibit(slug: Slug): Promise<Exhibit> {
  const project = getProject(slug);
  if (!project) throw new Error(`Unknown project ${slug}`);
  const source = sourceFor(slug);
  const manifest = readManifest(slug);
  const screenshots = readScreenshotIndex(slug);
  const updatedAt =
    source.capture === "manual" ? null : ((await lastProductionDeploy(source.vercelProject)) ?? manifest?.updatedAt ?? null);
  return { project, source, manifest, screenshots, updatedAt };
}

export async function getExhibits(slugs: Slug[]): Promise<Exhibit[]> {
  return Promise.all(slugs.map(getExhibit));
}
