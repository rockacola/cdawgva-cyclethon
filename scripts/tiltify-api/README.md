# tiltify-api

Polls the **Tiltify V5 API** for the [CDawgVA Cyclethon 5](https://tiltify.com/@cdawgva/cyclethon-5) campaign and saves donation snapshots as timestamped JSON files.

There are two main scripts:

- **`fetch-donations`** — run on a cron to collect snapshots into `output/`
- **`build-donations`** — run before a release to merge all snapshots into `webapp/src/data/donations.json`

## Requirements

- Node.js (see `.tool-versions`)
- npm
- A Tiltify API application (Client ID + Client Secret)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Tiltify API application

1. Go to [tiltify.com](https://tiltify.com) → your account settings → **Applications**
2. Create a new application
3. Copy the **Client ID** and **Client Secret**

### 3. Configure environment variables

Create a `.env` file in this directory:

```
TILTIFY_CLIENT_ID=your_client_id_here
TILTIFY_CLIENT_SECRET=your_client_secret_here
```

## Usage

```bash
# Fetch and save the latest donations (run on a cron)
npm run fetch-donations

# Merge all snapshots into webapp/src/data/donations.json (run before release)
npm run build-donations
```

### Exploration scripts

These were used to discover campaign and user IDs — not needed for regular use:

```bash
npm run get-user-by-slug       # Look up CDawgVA's user ID by slug
npm run get-user-campaigns     # List all campaigns for the user
npm run get-campaign           # Get details for Cyclethon 5
npm run get-campaign-donations # List donations with raw API response
```

## Snapshot output

Each file saved by `fetch-donations` under `output/` is named `donations_YYYYMMDD_HHmmss.json` and contains a `fetched_at` timestamp and the latest 100 donations:

```json
{
  "fetched_at": "2026-04-03T12:00:00.000Z",
  "donations": [
    {
      "id": "abc123",
      "created_at": "2026-04-03T11:58:00.000Z",
      "completed_at": "2026-04-03T11:59:00.000Z",
      "amount": {
        "value": "150.00",
        "currency": "USD"
      },
      "donor_name": "bakahashi",
      "donor_comment": "Let's go!"
    }
  ]
}
```

As long as fewer than 100 donations come in between runs, no donations will be missed across snapshots. `build-donations` handles deduplication across all collected snapshots.

## Running fetch-donations on a schedule (cron)

A `run.sh` script is provided that handles timestamped log output and prevents overlapping runs. To run every 5 minutes via crontab:

```bash
crontab -e
```

Add:

```
*/5 * * * * /Users/travis/repos/github/rockacola/cdawgva-cyclethon/scripts/tiltify-api/run.sh
```

Logs are written to:

- `logs/run_YYYYMMDD_HHmmss.log` — stdout
- `errors/error_YYYYMMDD_HHmmss.err` — stderr

Empty log files are automatically removed after each run.

## Other scripts

```bash
npm run lint          # ESLint
npm run format        # Prettier (write)
npm run format:check  # Prettier (check only)
```
