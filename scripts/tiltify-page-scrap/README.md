# tiltify-page-scrap

Scrapes the **Live Donations** table from the [CDawgVA Cyclethon 5](https://tiltify.com/@cdawgva/cyclethon-5) Tiltify campaign page using Playwright and saves the results as timestamped JSON files.

> **Note:** This script was used for early exploration before the Tiltify API integration was established. The canonical data source is now `scripts/tiltify-api`.

Each run produces a new file under `output/` named `donations_YYYYMMDD_HHmmss.json`.

## Requirements

- Node.js (see `.tool-versions`)
- npm

## Setup

```bash
npm install
npx playwright install chromium
```

## Usage

```bash
# Run directly via ts-node
npm run dev

# Or build first, then run
npm run build
npm start
```

## Output

Each donation entry in the JSON looks like:

```json
{
  "index": 1,
  "name": "bakahashi",
  "amount": 150,
  "amount_label": "$150.00",
  "comment": "bakahashi spun the Wheel and won... shoey!",
  "incentives": "",
  "is_sticky": true,
  "scraped_at": "2026-04-02T23:29:48.172Z"
}
```

`is_sticky` marks the pinned top donation (identified by the trophy icon on the page).

## Running on a schedule (cron)

A `run.sh` script is provided that handles timestamped log output. To run every minute via crontab:

```bash
crontab -e
```

Add:

```
* * * * * /Users/travis/repos/github/rockacola/cdawgva-cyclethon/scripts/tiltify-page-scrap/run.sh
```

Logs are written to:

- `logs/run_YYYYMMDD_HHmmss.log` — stdout
- `errors/error_YYYYMMDD_HHmmss.err` — stderr

## Other scripts

```bash
npm run lint          # ESLint
npm run format        # Prettier (write)
npm run format:check  # Prettier (check only)
```
