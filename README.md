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

## Two-checkout workflow

To keep the automated refresh on `main` from interfering with active development, two separate git worktrees are used:

| Worktree | Branch | Purpose |
|---|---|---|
| `cdawgva-cyclethon/` | `develop` | Active development |
| `cdawgva-cyclethon-main/` | `main` | Cron refresh + Vercel deploys |

### Initial setup

```bash
# In the primary checkout (on develop)
git worktree add ../cdawgva-cyclethon-main main

# Install dependencies in the worktree — node_modules are not shared
cd ../cdawgva-cyclethon-main/scripts/tiltify-api
npm install

# .env is not tracked in git — copy it from the dev checkout
cp ../../cdawgva-cyclethon/scripts/tiltify-api/.env .env
```

> **Note:** `webapp/node_modules` is not needed in the worktree — Vercel handles the webapp build, and `refresh.sh` only runs scripts from `scripts/tiltify-api`.

### Development workflow

```bash
# Work in the primary checkout on develop
cd ~/repos/.../cdawgva-cyclethon
git checkout develop   # should already be here
```

When ready to ship, open a PR from `develop` → `main` on GitHub and merge it there. This keeps `main` history clean and gives a review step before deploying.

> **Note:** Never switch branches inside the worktree — each worktree is locked to its branch. Merging via PR on GitHub is the safest approach.

## Automated refresh (cron)

`refresh.sh` orchestrates the full pipeline: fetch → build → commit → push. It uses a lockfile to prevent overlapping runs and stops immediately if any step fails.

Point the cron at the **worktree**, not the dev checkout:

```bash
crontab -e
```

```
# Every 5 minutes (testing / low traffic)
*/5 * * * * /Users/travis/repos/github/rockacola/cdawgva-cyclethon-main/refresh.sh

# Every minute (peak usage, e.g. during the live event)
# * * * * * /Users/travis/repos/github/rockacola/cdawgva-cyclethon-main/refresh.sh
```

Logs are written to:

- `logs/refresh_YYYYMMDD_HHmmss.log` — stdout
- `errors/refresh_YYYYMMDD_HHmmss.err` — stderr

Empty files are automatically cleaned up after each run.

## Manual release

To manually update and deploy from the worktree:

```bash
cd ~/repos/.../cdawgva-cyclethon-main/scripts/tiltify-api
npm run fetch-donations
npm run build-donations

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
