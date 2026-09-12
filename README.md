# Guy Ratzon — portfolio

Bilingual (Hebrew RTL default, English) portfolio at **guyratzon.vercel.app**. Five projects, each shown only
through a demo mode on invented data; screenshots refresh themselves and go live only after a review.

```bash
export PATH="$HOME/.local/nodejs/bin:$PATH"   # Node 24 lives here on Guy's Mac
npm install
npm run dev          # http://localhost:3000 → redirects to /he or /en
npm run check        # translations, types, lint, unit tests
npm run build        # check-i18n runs first; TODO(guy) blocks production builds only
PW_CHANNEL=chrome npx playwright test   # e2e, accessibility, LCP under slow 4G
```

## Where things live

| Path | What |
|---|---|
| `content/projects/*.ts` | The story of each project, `{ he, en }` for every sentence |
| `content/pages/*.ts`, `content/data-room/*` | How I work, About, SpeCV's data model room |
| `messages/he.ts` / `en.ts` | UI strings — English is typed against Hebrew, so a missing key fails `tsc` |
| `config/sources.ts` | The five source sites and the **allowlist** of routes that may be captured |
| `lib/exhibit/schema.ts` | The `/api/exhibit` manifest contract every source site serves |
| `data/manifests`, `data/screenshots`, `public/exhibit` | Reviewed manifest snapshots, capture index, images (written by the pipeline) |
| `content/diagrams.ts` → `public/diagrams` | Mermaid sources, pre-rendered by `npm run render-assets` |

## Content rules

- Every prose value is `{ he, en }`. `check-i18n` fails on an empty side, a copied Hebrew string, physical CSS
  (`ml-`, `text-right`…) or a stale diagram.
- Anything only Guy can confirm is marked `TODO(guy)`. Allowed in dev and previews, **fails the production build**.
- No real data, anywhere: no amounts, holdings, weights, names of real people. Screens come only from demo modes.

## Screenshots: capture → review → publish

1. **Capture** — `npm run shots` (CI: `.github/workflows/screenshots.yml`). Visits only allowlisted demo routes;
   blocks third-party and non-GET requests; writes nothing unless the page is ready, shows its demo banner and
   stayed on the expected path. A failing site keeps its previous images.
2. **Trigger** — `.github/workflows/poll.yml` checks Vercel hourly; a new production deploy of a source site
   dispatches a capture for that site. Weekly capture as a safety net.
3. **Review** — captures arrive as a PR. Its Vercel preview (behind Vercel Authentication) shows `/_review`
   with a checklist. **Merging the PR is the approval.** `/_review` is a 404 in production.

Local capture against the demo servers: `npx tsx scripts/screenshots/capture.ts --channel chrome --base tape=http://localhost:4101 …`

IBI is **manual**: `npx tsx scripts/screenshots/ibi-harness.ts --channel chrome` feeds the dashboard's embed mode an
invented portfolio (`scripts/screenshots/ibi-fixture.ts`) and refuses to run if any invented security matches a real one.

## Data model room

`npx tsx scripts/data-room/run-queries.ts` replays SpeCV's migrations in PGlite, loads the fixed-seed synthetic
dataset, runs the ETL and the three queries, and saves `content/data-room/results.json`. No production database.

## Environment

| Variable | Where | Notes |
|---|---|---|
| `SITE_URL` | Vercel | `https://guyratzon.vercel.app` — canonicals, hreflang, QR codes |
| `INDEXING` | Vercel | `false` until launch; every response is `noindex` meanwhile |
| `VERCEL_TOKEN`, `VERCEL_TEAM_ID` | Vercel + GitHub secret | Reads last deploy dates (team-scoped token with an expiry; mark Sensitive) |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | Vercel | The portfolio's own PostHog project — see `docs/analytics.md` |

## Launch (only after Guy's explicit approval of the review pass)

1. Resolve every `TODO(guy)` (a production build won't pass until then).
2. `SITE_URL=https://guyratzon.vercel.app npx tsx scripts/generate-qr.ts` → `qr/qr-{he,en}-{light,dark}.svg` + previews.
3. Embed in the résumé with the domain printed beside it and "סרקו כדי לראות את תיק העבודות" / "Scan to see my portfolio".
   Print at ≥ 2 × 2 cm; test scans from Android and iPhone, 20 cm away, in low light, and from the PDF on screen.
4. Set `INDEXING=true`, redeploy, submit the sitemap.
