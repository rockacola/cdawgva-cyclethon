# tiltify-page-scrap

Browser automation script that scrapes the live donations table from the [CDawgVA Cyclethon 5](https://tiltify.com/@cdawgva/cyclethon-5) Tiltify page using Playwright. Built as an early exploration approach before the Tiltify API integration was available. The production pipeline now lives in `scripts/tiltify-api`.

## Setup

```bash
npm install
npx playwright install chromium
```

## Usage

```bash
npm run dev
```

Each run writes a timestamped JSON file to `output/`.

## Scheduling

A `run.sh` script handles log rotation for cron use. To run every minute, add the following to your crontab:

```
* * * * * /path/to/scripts/tiltify-page-scrap/run.sh
```

Logs are written to `logs/` and errors to `errors/`.
