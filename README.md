# cdawgva-cyclethon

Live donation data pipeline for the [CDawgVA Cyclethon 5](https://tiltify.com/@cdawgva/cyclethon-5) charity fundraiser. Fetches donation data from the Tiltify API on a continuous schedule and publishes it to Cloudflare R2 for consumption by a companion web app.

The web app lives in a separate repo: [cdawgva-cyclethon-app](https://github.com/rockacola/cdawgva-cyclethon-app).

## Architecture

```
.github/workflows/refresh.yml   automated pipeline, triggers every 5 minutes
refresh.sh                      manual trigger for local use
scripts/tiltify-api/            production pipeline: Tiltify API to Cloudflare R2
scripts/tiltify-page-scrap/     early exploration scraper via Playwright (superseded)
```

## How it works

GitHub Actions triggers the fetch pipeline every 5 minutes. Each run pulls donations newer than the previous run, merges them into the running dataset, and publishes the result to Cloudflare R2. The web app reads directly from R2 and refreshes every 30 seconds.

## Scripts

- [tiltify-api](scripts/tiltify-api/README.md)
- [tiltify-page-scrap](scripts/tiltify-page-scrap/README.md)
