# cdawgva-cyclethon

Data collection pipeline for the [CDawgVA Cyclethon 5](https://tiltify.com/@cdawgva/cyclethon-5) charity event on Tiltify.

The web app lives in a separate repo: [cdawgva-cyclethon-app](https://github.com/rockacola/cdawgva-cyclethon-app).

## Structure

```
├── refresh.sh              # Local convenience script for manual fetch runs
├── .github/workflows/
│   └── refresh.yml         # GitHub Actions cron — runs every 5 minutes
└── scripts/
    ├── tiltify-api/        # Polls the Tiltify V5 API, uploads donations to Cloudflare R2
    └── tiltify-page-scrap/ # Early exploration scraper via Playwright (superseded)
```

## How it works

GitHub Actions runs `fetch-donations` every 5 minutes — fetching new donations from Tiltify, merging them into the full dataset, and uploading to Cloudflare R2. The web app fetches directly from R2 and polls every 30 seconds.

See [`scripts/tiltify-api`](scripts/tiltify-api/README.md) for setup and details.

## Sub-project READMEs

- [`scripts/tiltify-api`](scripts/tiltify-api/README.md)
- [`scripts/tiltify-page-scrap`](scripts/tiltify-page-scrap/README.md)
