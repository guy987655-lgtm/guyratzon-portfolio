import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { L10n } from "./i18n";

/** Fingerprint of a diagram's sources + the Mermaid version that renders them (build-time only). */
export function diagramHash(source: L10n, root = process.cwd()): string {
  const version = JSON.parse(readFileSync(join(root, "node_modules/mermaid/package.json"), "utf8")).version as string;
  return createHash("sha256").update(`${version}\n${source.he}\n---\n${source.en}`).digest("hex").slice(0, 16);
}
