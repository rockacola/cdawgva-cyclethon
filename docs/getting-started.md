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
| `R2_BUCKET_NAME`        | R2 bucket name                                           |

## Running the pipeline

`DATA_STORE` defaults to `local` in `.env.example`, so a bare run never touches production:

```bash
npm run fetch-donations
```

To test against the real Cloudflare R2 bucket, opt in explicitly:

```bash
DATA_STORE=r2 npm run fetch-donations
```

CI (`.github/workflows/refresh.yml`) and the cron scripts in `bin/` always force `DATA_STORE=r2` regardless
of your local `.env` — their whole purpose is driving the real pipeline.

## Available scripts

| Script                           | Description                                      |
| -------------------------------- | ------------------------------------------------ |
| `npm run fetch-donations`        | Core pipeline: fetch, merge, dedup, upload to R2 |
| `npm run build-stats`            | Rebuild the stats JSON independently             |
| `npm run get-user-by-slug`       | Exploration: look up a Tiltify user by slug      |
| `npm run get-user-campaigns`     | Exploration: list a user's campaigns             |
| `npm run get-campaign`           | Exploration: fetch a campaign by ID              |
| `npm run get-campaign-stats`     | Exploration: fetch a campaign's live stats       |
| `npm run get-campaign-donations` | Exploration: list a campaign's donations         |
| `npm run lint`                   | Report ESLint issues                             |
| `npm run lint:fix`               | Auto-fix ESLint issues                           |
| `npm run format`                 | Auto-format with Prettier                        |
| `npm run format:check`           | Check formatting without writing                 |
| `npm run typecheck`              | TypeScript type check                            |
| `npm run check`                  | Runs format + lint:fix + typecheck (pre-commit)  |
| `npm run generate:types`         | Regenerate types from Tiltify OpenAPI spec       |

## Code quality

Three tools enforce code quality:

- **Prettier** — formatting (100-char print width, single quotes, trailing commas)
- **ESLint** — bugs and style (import order, no-eval, curly braces, etc.)
- **TypeScript** — type correctness (`strict: true`, `noUnusedLocals`, `noUnusedParameters`)

Run all three at once: `npm run check`

Scripts run directly as TypeScript via Node's native type stripping (`node --disable-warning=ExperimentalWarning scripts/foo.ts`) — no build step, no `ts-node`.

## Project structure

```
.github/workflows/refresh.yml       GitHub Actions cron pipeline (every 5 min)
.tool-versions                      Pinned Node.js version
bin/
  refresh.sh                        Local manual pipeline trigger
  backup-r2.sh                      R2 backup utility (cron)
  run-fetch-donations.sh            Cron entry point for fetch-donations
scripts/
  fetch-donations.ts                Core: fetch, merge, dedup, upload
  build-stats.ts                    Daily aggregation and campaign stats
  snapshot-by-date.ts               Per-day snapshots (JST timezone)
  get-user-by-slug.ts               Exploration script
  get-user-campaigns.ts             Exploration script
  get-campaign.ts                   Exploration script
  get-campaign-stats.ts             Exploration script
  get-campaign-donations.ts         Exploration script
  lib/
    auth.ts                         OAuth token acquisition
    client.ts                       Typed HTTP client (openapi-fetch)
    campaign.ts                     Campaign/event identifiers (user ID, campaign ID, event dates)
    data-store.ts                   DATA_STORE switch: picks local-store.ts or r2.ts
    local-store.ts                  Local filesystem backend (data/output/)
    r2.ts                           Cloudflare R2 backend
    setup.ts                        Bootstrap (env + auth)
    types.ts                        Data models
    constants.ts                    API URLs and data/ directory paths
    format-timestamp.ts             Shared timestamp formatting util
    types/api.ts                    Auto-generated Tiltify API types
data/
  output/                           Local raw snapshot backups, plus the DATA_STORE=local destination (gitignored)
  inbox/                            Scaffolded for future manual input files (gitignored, unused)
.env.example                        Credential and config template
```
