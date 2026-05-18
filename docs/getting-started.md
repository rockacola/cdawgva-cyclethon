# Getting Started

## Prerequisites

- Node.js 24 (pinned in `.tool-versions`)
- A [Tiltify](https://tiltify.com) application (for API credentials)
- A [Cloudflare R2](https://developers.cloudflare.com/r2/) bucket (for storage)

## Installation

```bash
cd scripts/tiltify-api
npm install
```

## Environment variables

```bash
cp scripts/tiltify-api/.env.example scripts/tiltify-api/.env
```

| Variable              | Description                                      |
| --------------------- | ------------------------------------------------ |
| `TILTIFY_CLIENT_ID`   | Tiltify app client ID (Account Settings > Apps)  |
| `TILTIFY_CLIENT_SECRET` | Tiltify app client secret                      |
| `R2_ACCOUNT_ID`       | Cloudflare account ID                            |
| `R2_ACCESS_KEY_ID`    | R2 API token (Object Read & Write)               |
| `R2_SECRET_ACCESS_KEY`| R2 API secret                                   |
| `R2_BUCKET_NAME`      | R2 bucket name                                   |

## Running the pipeline

```bash
cd scripts/tiltify-api
npm run fetch-donations
```

## Available scripts (`scripts/tiltify-api`)

| Script                  | Description                                          |
| ----------------------- | ---------------------------------------------------- |
| `npm run fetch-donations` | Core pipeline: fetch, merge, dedup, upload to R2  |
| `npm run build-stats`   | Rebuild the stats JSON independently                 |
| `npm run build-donations` | Rebuild the full donations JSON                    |
| `npm run lint`          | Report ESLint issues                                 |
| `npm run lint:fix`      | Auto-fix ESLint issues                               |
| `npm run format`        | Auto-format with Prettier                            |
| `npm run format:check`  | Check formatting without writing                     |
| `npm run typecheck`     | TypeScript type check without compiling              |
| `npm run check`         | Runs format + lint:fix + typecheck (pre-commit)      |
| `npm run generate:types`| Regenerate types from Tiltify OpenAPI spec           |
| `npm run build`         | Compile TypeScript to `dist/`                        |

## Code quality

Three tools enforce code quality:

- **Prettier** — formatting (100-char print width, single quotes, trailing commas)
- **ESLint** — bugs and style (import order, no-eval, curly braces, etc.)
- **TypeScript** — type correctness (`strict: true`, `noUnusedLocals`, `noUnusedParameters`)

Run all three at once: `npm run check`

## Project structure

```
.github/workflows/refresh.yml       GitHub Actions cron pipeline (every 5 min)
.tool-versions                      Pinned Node.js version
scripts/
  tiltify-api/                      Primary pipeline service
    src/
      fetch-donations.ts            Core: fetch, merge, dedup, upload
      build-stats.ts                Daily aggregation and campaign stats
      build-donations.ts            Rebuild full donations dataset
      snapshot-by-date.ts           Per-day snapshots (JST timezone)
      auth.ts                       OAuth token acquisition
      client.ts                     Typed HTTP client (openapi-fetch)
      r2.ts                         Cloudflare R2 upload/download
      setup.ts                      Bootstrap (env + auth)
      types.ts                      Data models
      constants.ts                  API URLs and campaign IDs
      types/api.ts                  Auto-generated Tiltify API types
    .env.example                    Credential template
  tiltify-page-scrap/               Early Playwright scraper (superseded by API)
backup-r2.sh                        R2 backup utility
refresh.sh                          Local manual pipeline trigger
```
