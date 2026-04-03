# cdawgva-cyclethon

Donation tracker for the [CDawgVA Cyclethon 5](https://tiltify.com/@cdawgva/cyclethon-5) charity event on Tiltify.

## Structure

```
├── refresh.sh              # Orchestration script: fetch → build → commit → push
├── scripts/
│   ├── tiltify-api/        # Polls the Tiltify V5 API and saves donation snapshots
│   └── tiltify-page-scrap/ # Scrapes the Tiltify campaign page via Playwright
└── webapp/                 # Next.js web app, deployed to Vercel
```

## How it works

1. **Data collection** — `refresh.sh` runs on a cron, fetching the latest donations from the Tiltify API and saving timestamped snapshots locally.

2. **Data build** — As part of the same cron run, all snapshots are merged and deduplicated into `webapp/src/data/donations.json`.

3. **Deploy** — The updated `donations.json` is committed and pushed to `main`, triggering a Vercel build and producing a fully static Next.js site with no runtime data fetching.

The webapp displays a **Last checked** timestamp (sourced from `generated_at` in `donations.json`) so visitors can see how recently the data was refreshed.

## Automated refresh (cron)

`refresh.sh` at the repo root orchestrates the full pipeline: fetch → build → commit → push. It uses a lockfile to prevent overlapping runs and stops immediately if any step fails.

Add to crontab (`crontab -e`):

```
# Every 5 minutes (testing / low traffic)
*/5 * * * * /Users/travis/repos/github/rockacola/cdawgva-cyclethon/refresh.sh

# Every minute (peak usage, e.g. during the live event)
# * * * * * /Users/travis/repos/github/rockacola/cdawgva-cyclethon/refresh.sh
```

Logs are written to:

- `logs/refresh_YYYYMMDD_HHmmss.log` — stdout
- `errors/refresh_YYYYMMDD_HHmmss.err` — stderr

Empty files are automatically cleaned up after each run.

## Manual release

To manually update and deploy:

```bash
# 1. Fetch latest donations and build donations.json
cd scripts/tiltify-api
npm run fetch-donations
npm run build-donations

# 2. Commit and push
cd ../..
git add webapp/src/data/donations.json
git commit -m "chore: refresh donation data"
git push origin main
```

## Deployment

Vercel is configured to deploy on every push to `main`. The Root Directory is set to `webapp` in the Vercel project settings.

## Sub-project READMEs

- [`scripts/tiltify-api`](scripts/tiltify-api/README.md)
- [`scripts/tiltify-page-scrap`](scripts/tiltify-page-scrap/README.md)
- [`webapp`](webapp/README.md)
