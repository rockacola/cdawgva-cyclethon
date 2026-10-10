# Getting Started

## Prerequisites

- Node.js 24 (pinned in `.tool-versions`)
- A [Tiltify](https://tiltify.com) application (for API credentials)
- A [Cloudflare R2](https://developers.cloudflare.com/r2/) bucket (for storage)

## Installation

```bash
npm install
```

## Environment variables

```bash
cp .env.example .env
```

| Variable                | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| `DATA_STORE`            | `local` (writes to `data/output/`, safe default) or `r2` |
| `TILTIFY_CLIENT_ID`     | Tiltify app client ID (Account Settings > Apps)          |
| `TILTIFY_CLIENT_SECRET` | Tiltify app client secret                                |
| `R2_ACCOUNT_ID`         | Cloudflare account ID                                    |
| `R2_ACCESS_KEY_ID`      | R2 API token (Object Read & Write)                       |
| `R2_SECRET_ACCESS_KEY`  | R2 API secret                                            |
| `R2_BUCKET_NAME`        | R2 bucket name (`cdawgva`, holds every event)            |

## Running the pipeline

`DATA_STORE` defaults to `local` in `.env.example`, so a bare run never touches production. `fetch-donations`
is the live pipeline: it tracks whichever event `CURRENT_LIVE_EVENT_KEY` in `scripts/lib/campaign.ts` points
at, and no-ops cleanly if that's `null` (no event currently live):

```bash
npm run fetch-donations
```

To test against the real Cloudflare R2 bucket, opt in explicitly:

```bash
DATA_STORE=r2 npm run fetch-donations
```

CI (`.github/workflows/refresh.yml`) and the cron scripts in `bin/` always force `DATA_STORE=r2` regardless
of your local `.env` — their whole purpose is driving the real pipeline.

For a completed event, run the archive pipeline once instead, by its canonical event key (see `EVENTS` in
`scripts/lib/campaign.ts`):

```bash
DATA_STORE=r2 npm run archive-event -- cyclethon-4
```

## Available scripts

| Script                                            | Description                                               |
| ------------------------------------------------- | --------------------------------------------------------- |
| `npm run fetch-donations`                         | Live pipeline: fetch, merge, dedup, upload to R2          |
| `npm run archive-event -- <event-key>`            | Archive pipeline: one-shot backfill for a completed event |
| `npm run build-stats`                             | Rebuild the stats JSON for the live event independently   |
| `npm run get-user-by-slug -- <slug>`              | Exploration: look up a Tiltify user by slug               |
| `npm run get-user-campaigns -- <user_id>`         | Exploration: list a user's campaigns                      |
| `npm run get-campaign -- <campaign_id>`           | Exploration: fetch a campaign by ID                       |
| `npm run get-campaign-donations -- <campaign_id>` | Exploration: list a campaign's donations                  |
| `npm run lint`                                    | Report ESLint issues                                      |
| `npm run lint:fix`                                | Auto-fix ESLint issues                                    |
| `npm run format`                                  | Auto-format with Prettier                                 |
| `npm run format:check`                            | Check formatting without writing                          |
| `npm run typecheck`                               | TypeScript type check                                     |
| `npm run check`                                   | Runs format + lint:fix + typecheck (pre-commit)           |
| `npm run generate:types`                          | Regenerate types from Tiltify OpenAPI spec                |

Exploration scripts are generic — they take whatever slug/ID you pass and print the raw API response to
stdout, with progress messages on stderr so stdout stays clean JSON. They don't save anything themselves;
redirect or capture the output yourself if you want to keep it. Use the direct `node` invocation for this,
not `npm run`, since `npm run` prints its own banner to stdout and would corrupt the redirected JSON:

```bash
node --disable-warning=ExperimentalWarning scripts/get-campaign.ts <id> > data/output/campaign-<name>.json
```

## Code quality

Three tools enforce code quality:

- **Prettier** — formatting (100-char print width, single quotes, trailing commas)
- **ESLint** — bugs and style (import order, no-eval, curly braces, etc.)
- **TypeScript** — type correctness (`strict: true`, `noUnusedLocals`, `noUnusedParameters`)

Run all three at once: `npm run check`

Scripts run directly as TypeScript via Node's native type stripping (`node --disable-warning=ExperimentalWarning scripts/foo.ts`) — no build step, no `ts-node`.

## Project structure

```
.github/workflows/refresh.yml       GitHub Actions workflow, triggered externally by cron-job.org
.tool-versions                      Pinned Node.js version
bin/
  refresh.sh                        Local manual pipeline trigger (forces DATA_STORE=r2)
scripts/
  fetch-donations.ts                Live pipeline: fetch, merge, dedup, upload, for CURRENT_LIVE_EVENT_KEY
  archive-event.ts                  Archive pipeline: one-shot backfill for a completed event
  build-stats.ts                    Daily aggregation and campaign stats, takes an event key + campaign ID
  snapshot-by-date.ts               Per-day snapshots (JST timezone), shared by both pipelines
  get-user-by-slug.ts               Exploration script
  get-user-campaigns.ts             Exploration script
  get-campaign.ts                   Exploration script
  get-campaign-donations.ts         Exploration script
  lib/
    auth.ts                         OAuth token acquisition
    client.ts                       Typed HTTP client (openapi-fetch)
    campaign.ts                     Event registry (EVENTS) and CURRENT_LIVE_EVENT_KEY
    data-store.ts                   DATA_STORE switch: picks local-store.ts or r2.ts
    local-store.ts                  Local filesystem backend (data/output/)
    r2.ts                           Cloudflare R2 backend
    r2-keys.ts                      Per-event-prefixed dataset key builders
    setup.ts                        Bootstrap (env + auth)
    types.ts                        Data models
    constants.ts                    API URLs and data/ directory paths
    format-timestamp.ts             Shared timestamp formatting util
    types/api.ts                    Auto-generated Tiltify API types
data/
  output/                           Local raw snapshot backups, plus the DATA_STORE=local destination (gitignored)
  inbox/                            Scaffolded for future manual input files (gitignored, unused)
  logs/, errors/                    bin/refresh.sh output (gitignored)
.env.example                        Credential and config template
```
