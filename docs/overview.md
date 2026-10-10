# Overview

## Purpose

A data pipeline that fetches donation data from the [Tiltify API](https://developers.tiltify.com/), deduplicates and aggregates it, and publishes structured JSON files to Cloudflare R2. Built to power a donation dashboard for the CDawgVA Cyclethon charity fundraisers, and more broadly for any CDawgVA donation event, past or future. One bucket holds every event, each under its own key prefix.

The companion web app lives at [cdawgva-cyclethon-app](https://github.com/rockacola/cdawgva-cyclethon-app).

## Architecture

Two separate pipelines write into the same bucket, for two different situations: a recurring **live** pipeline for whichever event is currently running, and a one-shot **archive** pipeline for backfilling a completed event's full history.

```
      cron-job.org (external)
              │
              v
   ┌──────────────────────────┐
   │ GitHub Actions             │
   │ (workflow_dispatch)        │
   └─────────────┬──────────────┘
                 │
                 v
┌──────────┐  fetch   ┌────────────────────────────┐
│ Tiltify  │ ───────> │ Live pipeline                │
│ API      │          │ (fetch-donations.ts)         │
└──────────┘          │ for CURRENT_LIVE_EVENT_KEY    │
                       └─────────────┬────────────────┘
                                     │
┌──────────┐  fetch   ┌──────────────┴─────────────┐
│ Tiltify  │ ───────> │ Archive pipeline              │
│ API      │          │ (archive-event.ts)            │
└──────────┘          │ one event, run on demand       │
    (manual, local)   └─────────────┬─────────────────┘
                                     │ publish JSON
                                     v
                       ┌────────────────────────────┐
                       │ Cloudflare R2                 │
                       │ bucket: cdawgva                │
                       │ <event-key>/donations-*.json   │
                       └─────────────┬─────────────────┘
                                     │ read
                                     v
                              ┌───────────────┐
                              │ Web App        │
                              │ (poll)         │
                              └───────────────┘
```

`scripts/lib/campaign.ts` holds the registry of every known event (`EVENTS`) and `CURRENT_LIVE_EVENT_KEY`, the single pointer to whichever one the live pipeline should track (`null` when no event is live).

## Output files

Every key below is prefixed with an event's canonical key, e.g. `cyclethon-5/donations-full.json`.

| File                        | Description                                               |
| --------------------------- | --------------------------------------------------------- |
| `donations-full.json`       | Complete donation history for the event (source of truth) |
| `donations-latest-100.json` | Most recent 100 donations (fast webapp loads)             |
| `donations-latest-500.json` | Most recent 500 donations                                 |
| `donations-stats.json`      | Daily totals, cumulative totals, campaign progress        |
| `donations-YYYY-MM-DD.json` | Per-day snapshot for each completed event day (JST)       |

## Pipeline steps

### Live (`fetch-donations.ts`)

Runs repeatedly for `CURRENT_LIVE_EVENT_KEY` while an event is in progress; no-ops cleanly if that pointer is `null`.

1. **Download** existing full dataset for the event from R2
2. **Determine fetch window**, latest donation timestamp minus a 30-second overlap buffer
3. **Paginate** Tiltify API with cursor-based pagination (100 per page)
4. **Save** local snapshot of raw API response as backup
5. **Merge and deduplicate** new donations into existing dataset by donation ID
6. **Sort** by completion time (descending) and upload full + sliced datasets to R2
7. **Build aggregated stats**, daily totals by currency, cumulative running totals (JST)
8. **Build daily snapshots**, one file per completed event day within the event's live window

### Archive (`archive-event.ts`)

Run manually, once, for a single completed event (`npm run archive-event -- <event-key>`); refuses to run against an event whose status isn't `archived`.

1. **Paginate** the entire donation history for the event in one pass, no incremental merge
2. **Sort** by completion time (descending) and upload full + latest-100/500 datasets to R2
3. **Build aggregated stats**, same as the live pipeline
4. **Build daily snapshots**, date range derived from the donations' own timestamps, not a hardcoded window

## Tech stack

| Layer         | Technology                                           |
| ------------- | ---------------------------------------------------- |
| Language      | TypeScript 5 (strict mode)                           |
| Runtime       | Node.js 24                                           |
| API client    | `openapi-fetch` with auto-generated types            |
| Cloud storage | Cloudflare R2 via AWS S3 SDK                         |
| CI/CD         | GitHub Actions, triggered externally by cron-job.org |
| Code quality  | ESLint + Prettier + TypeScript strict                |

## Key design decisions

- **Incremental fetching** — only queries donations newer than the last run, with 30s overlap buffer
- **Deduplication by ID** — prevents double-counting across overlapping fetch windows
- **Multiple output sizes** — full history, latest 100, and latest 500 for webapp flexibility
- **Type-safe API** — TypeScript types auto-generated from Tiltify's OpenAPI spec
- **OAuth client credentials** — short-lived bearer tokens per run, no refresh logic needed
- **JST timezone** — all daily aggregations group by Japan Standard Time (event timezone)
