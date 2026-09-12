# Analytics — the portfolio's own PostHog project

Separate from SpeCV's project so recruiter traffic never mixes with product traffic.

## Setup (Guy)

1. Create a new PostHog project (EU cloud recommended). In **Project settings → IP data capture**, turn on **Discard client IP data**.
2. In Vercel → project `guyratzon` → Settings → Environment Variables (Production + Preview):
   - `NEXT_PUBLIC_POSTHOG_KEY` = the project API key (`phc_…`)
   - `NEXT_PUBLIC_POSTHOG_HOST` = `https://eu.i.posthog.com` (or `https://us.i.posthog.com`)
3. Open the site once with `?internal=1` on every browser you use. That browser stops being counted (undo with `?internal=0`).

## How it's wired

- `components/Analytics.tsx` imports `posthog-js` only after the page is idle, through `/ingest` (a rewrite in `next.config.ts`).
- `persistence: "sessionStorage"`, `person_profiles: "identified_only"`, no autocapture, no session recording, no surveys, no feature flags. Nothing outlives the tab, and nobody is identified.
- Every event carries the super-properties `locale` (`he`/`en`), `theme` (`light`/`dark`), `source` (`qr`/`direct`/`referral`).
- Events that happen as the visitor leaves (`locale_switch`, `project_open`) are fired on the *destination* page from a sessionStorage hand-off, so they aren't lost to navigation. Outbound clicks use `sendBeacon`.

## Events

| Event | Extra properties | Fired |
|---|---|---|
| `home_view` | `source` | home page mount |
| `locale_switch` | `from`, `to`, `page` | on the page reached after switching |
| `quick_peek_open` | `slug` | quick look opened |
| `project_open` | `slug`, `entry` (`card`/`peek`/`nav`/`next`/`direct`) | project page mount |
| `decision_expand` | `slug`, `title` | a decision card opened |
| `gallery_interact` | `slug`, `device` | gallery arrow, swipe-step or device switch |
| `deep_dive_open` | — | data model room mount |
| `live_site_click` | `slug`, `from` (`page`/`peek`) | "open the live site" |
| `live_frame_open` | `slug` | embedded live screen loaded |
| `contact_click` | `channel` (`linkedin`/`email`) | contact link |
| `$pageleave` | (PostHog) max scroll % | automatic, gives scroll depth |

## Dashboard — "Portfolio: did it work?"

| Insight | Type | Definition |
|---|---|---|
| Scans per day | Trends | `home_view` where `source = qr`, daily, unique sessions |
| Opened ≥1 project | Funnel | `home_view (source=qr)` → `project_open`, session-level, 30 min window. Target ≥ 65% |
| Opened ≥2 projects | Funnel | `home_view (source=qr)` → `project_open` → `project_open` (second, any slug). Target ≥ 35% |
| Median time on site | Trends | session duration, median, filtered to sessions with `home_view`. Target ≥ 2 min |
| Winning card | Trends | `project_open` broken down by `slug` |
| Peek vs full story | Trends | `quick_peek_open` vs `project_open where entry = card` |
| Scroll depth per project | Trends | `$pageleave` on `/work/*`, `$prev_pageview_max_scroll_percentage`, median, by path |
| Language | Trends | `home_view` by `locale`; `locale_switch` count (many switches → the QR/default language is wrong) |
| Deep dives | Trends | `deep_dive_open` count |
| Contact | Trends | `contact_click` by `channel` |

After a few weeks: move the most-opened project up the menu, and shorten the block where scroll depth drops.
