# tiltify-api

Polls the **Tiltify V5 API** for the [CDawgVA Cyclethon 5](https://tiltify.com/@cdawgva/cyclethon-5) campaign, merges donations incrementally, and uploads the results to Cloudflare R2.

In production this runs automatically via GitHub Actions every 5 minutes. See `.github/workflows/refresh.yml` at the repo root.

## Requirements

- Node.js (see `.tool-versions`)
- npm
- A Tiltify API application (Client ID + Client Secret)
- A Cloudflare R2 bucket with an API token

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in all values in `.env`. See `.env.example` for descriptions of each key.

## Usage

```bash
# Fetch new donations and upload to R2
npm run fetch-donations
```

Each run:

1. Downloads `donations-full.json` from R2 (empty on first run)
2. Fetches new donations from Tiltify since the last known `completed_at` (cursor-based, all pages)
3. Saves a raw snapshot locally to `output/`
4. Merges and deduplicates by `id`
5. Uploads three files to R2:
   - `donations-full.json` — full history
   - `donations-latest-100.json` — latest 100
   - `donations-latest-500.json` — latest 500

## R2 output files

| File                        | Contents                     | Used by                    |
| --------------------------- | ---------------------------- | -------------------------- |
| `donations-full.json`       | All donations ever collected | Next run (source of truth) |
| `donations-latest-100.json` | Latest 100 donations         | Webapp (lightweight)       |
| `donations-latest-500.json` | Latest 500 donations         | Webapp (extended)          |

## Local snapshots

Raw per-run API responses are saved to `output/donations_YYYYMMDD_HHmmss.json` as a local backup. These are gitignored and stay on the machine running the script.

## Exploration scripts

These were used to discover campaign and user IDs — not needed for regular use:

```bash
npm run get-user-by-slug       # Look up CDawgVA's user ID by slug
npm run get-user-campaigns     # List all campaigns for the user
npm run get-campaign           # Get details for Cyclethon 5
npm run get-campaign-donations # List donations with raw API response
```

## Other scripts

```bash
npm run lint          # ESLint
npm run format        # Prettier (write)
npm run format:check  # Prettier (check only)
```
