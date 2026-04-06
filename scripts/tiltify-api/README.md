# tiltify-api

Polls the Tiltify V5 API for the [CDawgVA Cyclethon 5](https://tiltify.com/@cdawgva/cyclethon-5) campaign and maintains an incrementally updated donation dataset in Cloudflare R2. Runs automatically via GitHub Actions every 5 minutes.

## Design

Each run fetches only donations newer than the previous run, with a small overlap window to handle burst edge cases at the boundary. Results are paginated using the API cursor until exhausted, then merged into the existing dataset by deduplication on donation ID. Three output files are published to R2 at different sizes to match the consumption needs of the web app.

## Requirements

- Node.js
- Tiltify API credentials (Client ID and Client Secret)
- Cloudflare R2 bucket with an API token

## Setup

```bash
npm install
cp .env.example .env
```

Fill in all values in `.env`. See `.env.example` for descriptions of each key.

## Usage

```bash
npm run fetch-donations
```

## R2 Output

| File                        | Contents                                                         |
| --------------------------- | ---------------------------------------------------------------- |
| `donations-full.json`       | Complete history, source of truth for the next run               |
| `donations-latest-100.json` | Latest 100 donations                                             |
| `donations-latest-500.json` | Latest 500 donations                                             |
| `donations-stats.json`      | Aggregated daily totals + live campaign snapshot (goal, raised)  |

A local snapshot of each run's raw API response is saved to `output/` as a backup. These files are gitignored.

### `donations-stats.json` shape

```json
{
  "_meta": { "generated_at": "...", "timezone": "Asia/Tokyo", "utc_offset": "+09:00" },
  "campaign": {
    "fetched_at": "2026-04-06T10:00:00Z",
    "amount_raised_cent": 15604109,
    "amount_raised_currency": "USD",
    "goal_cent": 15000000,
    "goal_currency": "USD"
  },
  "stats": {
    "daily_totals": [
      {
        "date": "2026-04-01",
        "by_currency": { "USD": { "amount_cent": 500000, "count": 42 } },
        "cumulative_by_currency": { "USD": { "amount_cent": 500000, "count": 42 } }
      }
    ]
  }
}
```

## Exploration Scripts

Used during initial development to discover campaign and user IDs:

```bash
npm run get-user-by-slug
npm run get-user-campaigns
npm run get-campaign
npm run get-campaign-donations
npm run get-campaign-stats
```
