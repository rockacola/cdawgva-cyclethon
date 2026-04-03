# cdawgva-cyclethon

Donation tracker for the [CDawgVA Cyclethon 5](https://tiltify.com/@cdawgva/cyclethon-5) charity event on Tiltify.

## Structure

```
├── scripts/
│   ├── tiltify-api/        # Polls the Tiltify V5 API and saves donation snapshots
│   └── tiltify-page-scrap/ # Scrapes the Tiltify campaign page via Playwright
└── webapp/                 # Next.js web app, deployed to Vercel
```

## How it works

1. **Data collection** — `scripts/tiltify-api` runs on a cron every 5 minutes, fetching the latest donations from the Tiltify API and saving them as timestamped JSON snapshots locally.

2. **Data build** — Before a release, `npm run build-donations` (in `scripts/tiltify-api`) merges and deduplicates all snapshots into a single `webapp/src/data/donations.json` file.

3. **Deploy** — Committing the updated `donations.json` and pushing to `main` triggers a Vercel build, producing a fully static Next.js site with no runtime data fetching.

## Deployment

Vercel is configured via `vercel.json` at the repo root. Every push to `main` triggers a new deployment automatically.

**Release workflow:**

```bash
# 1. Merge latest snapshots into webapp data
cd scripts/tiltify-api
npm run build-donations

# 2. Commit and push
cd ../..
git add webapp/src/data/donations.json
git commit -m "Update donation data"
git push origin main
```

## Sub-project READMEs

- [`scripts/tiltify-api`](scripts/tiltify-api/README.md)
- [`scripts/tiltify-page-scrap`](scripts/tiltify-page-scrap/README.md)
- [`webapp`](webapp/README.md)
