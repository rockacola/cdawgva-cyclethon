# CDawgVA Cyclethon Data Pipeline

A production data pipeline that continuously fetches live donation data from the [Tiltify API](https://developers.tiltify.com/), deduplicates and aggregates it, and publishes structured JSON files to Cloudflare R2. Built to power a real-time donation dashboard for the [CDawgVA Cyclethon 5](https://tiltify.com/@cdawgva/cyclethon-5) charity fundraiser.

The companion web app that consumes this data lives in a separate repo: [cdawgva-cyclethon-app](https://github.com/rockacola/cdawgva-cyclethon-app). See it live at [cdawgva-cyclethon.vercel.app](https://cdawgva-cyclethon.vercel.app/).

## Demo / Output

The pipeline produces several JSON files published to Cloudflare R2:

| File                        | Description                                                 |
| --------------------------- | ----------------------------------------------------------- |
| `donations-full.json`       | Complete donation history (source of truth)                 |
| `donations-latest-100.json` | Most recent 100 donations (optimised for fast webapp loads) |
| `donations-latest-500.json` | Most recent 500 donations                                   |
| `donations-stats.json`      | Daily totals, cumulative totals, and campaign progress      |
| `donations-YYYY-MM-DD.json` | Per-day snapshots for each completed event day (JST)        |

Example donation record:

```json
{
  "id": "abc123",
  "completed_at": 1712500000,
  "amount_cent": 5000,
  "amount_currency": "USD",
  "donor_name": "SomeUser",
  "donor_comment": "Great cause!"
}
```

## Tech Stack

- **Language**: TypeScript 5 (strict mode)
- **Runtime**: Node.js 24
- **API Client**: `openapi-fetch` with auto-generated types from Tiltify's OpenAPI spec
- **Cloud Storage**: Cloudflare R2 via AWS S3 SDK (`@aws-sdk/client-s3`)
- **CI/CD**: GitHub Actions (5-minute cron schedule)
- **Code Quality**: ESLint + Prettier + `tsc --noEmit` type checking

## Architecture

```text
                          every N min
                     ┌───────────────────┐
                     │  GitHub Actions   │
                     │  (cron trigger)   │
                     └────────┬──────────┘
                              │
                              v
┌──────────┐    fetch    ┌──────────────────────────┐    publish   ┌───────────┐
│ Tiltify  │ ─────────>  │  Pipeline                │ ──────────>  │ Cloudflare│
│ API      │  new        │                          │  JSON files  │ R2        │
└──────────┘  donations  │  1. Download existing    │              └─────┬─────┘
                         │  2. Fetch new (paginated)│                    │
                         │  3. Merge + deduplicate  │                    │ read
                         │  4. Build stats/snapshots│                    v
                         │  5. Upload all datasets  │              ┌──────────────┐
                         └──────────────────────────┘              │ Web App      │
                                                                   │ (30s poll)   │
                                                                   │ on Vercel    │
                                                                   └──────────────┘
```

**Pipeline steps** (runs in [`fetch-donations.ts`](scripts/tiltify-api/src/fetch-donations.ts)):

1. **Download** the existing full dataset from R2
2. **Determine fetch window** using the latest donation timestamp minus a 30-second overlap buffer to avoid missing edge cases during donation bursts
3. **Paginate** through the Tiltify API using cursor-based pagination (100 per page)
4. **Save** a local snapshot of the raw API response as backup
5. **Merge and deduplicate** new donations into the existing dataset by donation ID
6. **Sort** by completion time (descending) and upload full + sliced datasets to R2
7. **Build aggregated stats** with daily totals grouped by currency and cumulative running totals (JST timezone)
8. **Build daily snapshots**, one file per completed event day

## Key Features

- **Incremental fetching**: only queries donations newer than the last run, with a 30-second overlap buffer for burst protection
- **Deduplication by ID**: prevents double-counting across overlapping fetch windows
- **Multiple output sizes**: full history, latest 100, and latest 500 let the webapp choose the right trade-off between completeness and load time
- **Daily aggregations**: stats file includes per-day totals, cumulative totals, and campaign goal/raised amounts, all in JST timezone
- **Type-safe API integration**: TypeScript types auto-generated from Tiltify's OpenAPI spec via `openapi-typescript`
- **OAuth client credentials flow**: obtains short-lived bearer tokens per run; no token refresh logic needed
- **Local backup on every run**: raw API responses saved to `output/` as an audit trail

## What This Demonstrates

| Skill                       | Where it shows up                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------- |
| **Data pipeline design**    | Incremental fetch, merge, dedup, multi-format publish                              |
| **API integration**         | OAuth 2.0 client credentials, cursor-based pagination, OpenAPI type generation     |
| **Cloud storage**           | S3-compatible uploads/downloads to Cloudflare R2                                   |
| **CI/CD automation**        | GitHub Actions cron pipeline with secret management and npm caching                |
| **TypeScript**              | Strict mode, generated types, clean module boundaries                              |
| **Data modelling**          | Normalised donation records, time-series aggregation, timezone-aware date grouping |
| **Reliability engineering** | Overlap buffers, deduplication, lock files, structured error logging               |

## Getting Started

### Prerequisites

- Node.js 24+ (see `.tool-versions`)
- A [Tiltify](https://tiltify.com) application (for API credentials)
- A [Cloudflare R2](https://developers.cloudflare.com/r2/) bucket (for storage)

### Installation

```bash
cd scripts/tiltify-api
npm install
```

### Environment Variables

```bash
cp .env.example .env
```

Then fill in your credentials:

```bash
# Tiltify API: create at tiltify.com > Account Settings > Applications
TILTIFY_CLIENT_ID=your-client-id
TILTIFY_CLIENT_SECRET=your-client-secret

# Cloudflare R2: create token at R2 > Manage R2 API Tokens (Object Read & Write)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket-name
```

### Run the Pipeline

```bash
npm run fetch-donations
```

On success, you'll see output like:

```text
[START] 2026-04-16T12:30:00Z
Fetching access token...
450 existing donations loaded.
Fetched 5 donation(s) from API.
3 new donation(s) added. Total: 453.
Uploaded donations-full.json (453 donations).
Uploaded donations-latest-100.json (100 donations).
[END]   2026-04-16T12:30:45Z
```

### Other Commands

```bash
npm run build-stats       # Rebuild stats file independently
npm run lint              # Run ESLint
npm run format            # Auto-format with Prettier
npm run typecheck         # Type check without compiling
npm run generate:types    # Regenerate types from Tiltify OpenAPI spec
```

## Project Structure

```text
.github/workflows/refresh.yml      GitHub Actions pipeline (5-min cron)
scripts/tiltify-api/
  src/
    fetch-donations.ts              Core pipeline: fetch, merge, dedup, upload
    build-stats.ts                  Daily aggregation and campaign stats
    snapshot-by-date.ts             Per-day donation snapshots (JST)
    auth.ts                         OAuth token acquisition
    client.ts                       Typed HTTP client (openapi-fetch)
    r2.ts                           Cloudflare R2 upload/download
    setup.ts                        Bootstrap (env + auth)
    types.ts                        Data models
    constants.ts                    API URLs and campaign IDs
    types/api.ts                    Auto-generated Tiltify API types
  .env.example                      Credential template
scripts/tiltify-page-scrap/         Early Playwright scraper (superseded by API)
refresh.sh                          Local manual trigger
backup-r2.sh                        R2 backup utility
```

## Future Improvements

- **WebSocket or webhook integration**: replace polling with push-based updates for sub-5-minute latency
- **Automated tests**: add integration tests for the merge/dedup logic and stats aggregation
- **Historical analytics**: time-series visualisation of donation velocity and patterns
- **Multi-campaign support**: generalise the pipeline to track multiple Tiltify campaigns
- **Alerting**: notify on pipeline failures or unusual donation patterns
