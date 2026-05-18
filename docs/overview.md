# Overview

## Purpose

A production data pipeline that continuously fetches live donation data from the [Tiltify API](https://developers.tiltify.com/), deduplicates and aggregates it, and publishes structured JSON files to Cloudflare R2. Built to power a real-time donation dashboard for the CDawgVA Cyclethon charity fundraiser.

The companion web app lives at [cdawgva-cyclethon-app](https://github.com/rockacola/cdawgva-cyclethon-app).

## Architecture

```
                      every 5 min
                 ┌───────────────────┐
                 │  GitHub Actions   │
                 └────────┬──────────┘
                          │
                          v
┌──────────┐  fetch   ┌──────────────────────────┐  publish  ┌────────────┐
│ Tiltify  │ ──────>  │  Pipeline                │ ───────>  │ Cloudflare │
│ API      │          │  (fetch-donations.ts)    │  JSON     │ R2         │
└──────────┘          │                          │           └─────┬──────┘
                      │  1. Download existing    │                 │ read
                      │  2. Fetch new donations  │                 v
                      │  3. Merge + deduplicate  │           ┌──────────────┐
                      │  4. Build stats/snapshots│           │ Web App      │
                      │  5. Upload all datasets  │           │ (30s poll)   │
                      └──────────────────────────┘           └──────────────┘
```

## Output files

| File                        | Description                                            |
| --------------------------- | ------------------------------------------------------ |
| `donations-full.json`       | Complete donation history (source of truth)            |
| `donations-latest-100.json` | Most recent 100 donations (fast webapp loads)          |
| `donations-latest-500.json` | Most recent 500 donations                              |
| `donations-stats.json`      | Daily totals, cumulative totals, campaign progress     |
| `donations-YYYY-MM-DD.json` | Per-day snapshots for each completed event day (JST)   |

## Pipeline steps

1. **Download** existing full dataset from R2
2. **Determine fetch window** — latest donation timestamp minus a 30-second overlap buffer
3. **Paginate** Tiltify API with cursor-based pagination (100 per page)
4. **Save** local snapshot of raw API response as backup
5. **Merge and deduplicate** new donations into existing dataset by donation ID
6. **Sort** by completion time (descending) and upload full + sliced datasets to R2
7. **Build aggregated stats** — daily totals by currency, cumulative running totals (JST)
8. **Build daily snapshots** — one file per completed event day

## Tech stack

| Layer         | Technology                                    |
| ------------- | --------------------------------------------- |
| Language      | TypeScript 5 (strict mode)                    |
| Runtime       | Node.js 24                                    |
| API client    | `openapi-fetch` with auto-generated types     |
| Cloud storage | Cloudflare R2 via AWS S3 SDK                  |
| CI/CD         | GitHub Actions (5-minute cron)                |
| Code quality  | ESLint + Prettier + TypeScript strict         |

## Key design decisions

- **Incremental fetching** — only queries donations newer than the last run, with 30s overlap buffer
- **Deduplication by ID** — prevents double-counting across overlapping fetch windows
- **Multiple output sizes** — full history, latest 100, and latest 500 for webapp flexibility
- **Type-safe API** — TypeScript types auto-generated from Tiltify's OpenAPI spec
- **OAuth client credentials** — short-lived bearer tokens per run, no refresh logic needed
- **JST timezone** — all daily aggregations group by Japan Standard Time (event timezone)
