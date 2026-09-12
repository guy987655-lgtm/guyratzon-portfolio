/**
 * Build gate for the bilingual guarantee. Fails (exit 1) on:
 *  - a UI message key present in one language only, or an empty message
 *  - any {he, en} content value with an empty side
 *  - English identical to a Hebrew string that contains Hebrew letters (forgotten translation)
 *  - physical-direction Tailwind classes (ml-, pr-, left-, text-right, …) outside data-physical lines
 *  - TODO(guy) markers — only in strict mode (--strict, or a Vercel production build); a warning otherwise
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const strict = process.argv.includes("--strict") || process.env.VERCEL_ENV === "production";
const errors: string[] = [];
const warnings: string[] = [];
const HEBREW = /[֐-׿]/;
const TODO = /TODO\(guy\)/;

function walkFiles(dir: string, exts: string[]): string[] {
  let out: string[] = [];
  let entries: string[] = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out = out.concat(walkFiles(full, exts));
    else if (exts.some((e) => name.endsWith(e))) out.push(full);
  }
  return out;
}

function isL10n(value: unknown): value is { he: unknown; en: unknown } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value).sort();
  return keys.length === 2 && keys[0] === "en" && keys[1] === "he";
}

function checkText(text: string, where: string) {
  if (TODO.test(text)) (strict ? errors : warnings).push(`${where}: unresolved TODO(guy)`);
}

const seenObjects = new WeakSet<object>();

function walkContent(value: unknown, where: string, seen = seenObjects) {
  if (value === null || typeof value !== "object") return;
  if (seen.has(value)) return;
  seen.add(value);
  if (isL10n(value)) {
    const { he, en } = value;
    if (typeof he !== "string" || !he.trim()) errors.push(`${where}.he is empty`);
    if (typeof en !== "string" || !en.trim()) errors.push(`${where}.en is empty`);
    if (typeof he === "string" && typeof en === "string") {
      if (HEBREW.test(he) && he.trim() === en.trim()) errors.push(`${where}: English is a copy of the Hebrew`);
      if (HEBREW.test(en)) warnings.push(`${where}.en contains Hebrew letters`);
      checkText(he, `${where}.he`);
      checkText(en, `${where}.en`);
    }
    return;
  }
  if (Array.isArray(value)) value.forEach((v, i) => walkContent(v, `${where}[${i}]`, seen));
  else for (const [k, v] of Object.entries(value)) walkContent(v, `${where}.${k}`, seen);
}

function compareMessages(a: unknown, b: unknown, path: string) {
  if (typeof a === "string" || typeof b === "string") {
    if (typeof a !== "string" || typeof b !== "string") errors.push(`messages${path}: type differs between he and en`);
    else {
      if (!a.trim()) errors.push(`messages${path} (he) is empty`);
      if (!b.trim()) errors.push(`messages${path} (en) is empty`);
      if (HEBREW.test(a) && a.trim() === b.trim()) errors.push(`messages${path}: English is a copy of the Hebrew`);
      checkText(a, `messages${path} (he)`);
      checkText(b, `messages${path} (en)`);
    }
    return;
  }
  const ao = (a ?? {}) as Record<string, unknown>;
  const bo = (b ?? {}) as Record<string, unknown>;
  for (const key of new Set([...Object.keys(ao), ...Object.keys(bo)])) {
    if (!(key in ao)) errors.push(`messages${path}.${key} missing in he`);
    else if (!(key in bo)) errors.push(`messages${path}.${key} missing in en`);
    else compareMessages(ao[key], bo[key], `${path}.${key}`);
  }
}

// Tailwind classes that pin a side. Logical equivalents: ms-/me-/ps-/pe-/start-/end-/text-start/text-end.
const PHYSICAL =
  /(?<![\w-])(?:[a-z-]+:)*-?(?:(?:scroll-)?[mp][lr]-[\w.[\]/-]+|(?:left|right)-[\w.[\]/-]+|text-(?:left|right)\b|rounded-[lr](?:[-\s"'`]|$)|rounded-[tb][lr](?:[-\s"'`]|$)|border-[lr](?:[-\s"'`]|$)|float-(?:left|right)\b)/g;

function checkPhysicalCss() {
  const files = [...walkFiles(join(ROOT, "app"), [".tsx", ".ts"]), ...walkFiles(join(ROOT, "components"), [".tsx", ".ts"])];
  for (const file of files) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      if (!/className|class=|cn\(/.test(line)) return;
      if (line.includes("data-physical") || (lines[i - 1] ?? "").includes("data-physical")) return;
      const strings = line.match(/(["'`])(?:(?!\1).)*\1/g) ?? [];
      for (const s of strings) {
        const hits = s.match(PHYSICAL);
        if (hits) errors.push(`${relative(ROOT, file)}:${i + 1}: physical CSS ${hits.join(", ")} — use logical (ms/me/ps/pe/start/end)`);
      }
    });
  }
}

/** Every diagram must be rendered from its current source (and every referenced one must exist). */
async function checkDiagrams() {
  const { diagrams } = await import(pathToFileURL(join(ROOT, "content/diagrams.ts")).href);
  const { projects } = await import(pathToFileURL(join(ROOT, "content/projects/index.ts")).href);
  const { diagramHash } = await import(pathToFileURL(join(ROOT, "lib/diagram-hash.ts")).href);
  let manifest: { diagrams?: Record<string, string> } = {};
  try {
    manifest = JSON.parse(readFileSync(join(ROOT, "public/diagrams/manifest.json"), "utf8"));
  } catch {}
  for (const project of projects as { slug: string; diagram?: string }[]) {
    if (project.diagram && !diagrams[project.diagram]) errors.push(`${project.slug}: diagram "${project.diagram}" has no source in content/diagrams.ts`);
  }
  for (const [id, source] of Object.entries(diagrams)) {
    if (manifest.diagrams?.[id] !== diagramHash(source, ROOT)) errors.push(`diagram "${id}" is missing or stale — run npm run render-assets`);
  }
}

async function main() {
  const { he } = await import(pathToFileURL(join(ROOT, "messages/he.ts")).href);
  const { en } = await import(pathToFileURL(join(ROOT, "messages/en.ts")).href);
  compareMessages(he, en, "");

  for (const file of walkFiles(join(ROOT, "content"), [".ts"])) {
    const mod = await import(pathToFileURL(file).href);
    for (const [name, value] of Object.entries(mod)) {
      if (typeof value === "function") continue;
      walkContent(value, `${relative(ROOT, file)}#${name}`);
    }
  }

  for (const file of walkFiles(join(ROOT, "data/manifests"), [".json"])) {
    walkContent(JSON.parse(readFileSync(file, "utf8")), relative(ROOT, file));
  }

  checkPhysicalCss();
  await checkDiagrams();

  for (const w of warnings) console.warn(`warn  ${w}`);
  if (errors.length) {
    for (const e of errors) console.error(`error ${e}`);
    console.error(`\ncheck-i18n: ${errors.length} error(s)${strict ? " (strict)" : ""}`);
    process.exit(1);
  }
  console.log(`check-i18n: ok${warnings.length ? ` (${warnings.length} warning(s))` : ""}${strict ? " [strict]" : ""}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
