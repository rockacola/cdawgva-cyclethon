# tiltify-api

Queries the **Tiltify V5 API** for the [CDawgVA Cyclethon 5](https://tiltify.com/@cdawgva/cyclethon-5) campaign and saves donation snapshots as timestamped JSON files.

Each run of `fetch-donations` produces a new file under `output/` named `donations_YYYYMMDD_HHmmss.json`.

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
# Fetch and save the latest donations
npm run fetch-donations
```

### Exploration scripts

These were used to discover campaign and user IDs — not needed for regular polling:

```bash
npm run get-user-by-slug       # Look up CDawgVA's user ID by slug
npm run get-user-campaigns     # List all campaigns for the user
npm run get-campaign           # Get details for Cyclethon 5
npm run get-campaign-donations # List donations with raw API response
```

## Output

Each snapshot file contains a `fetched_at` timestamp and an array of donations:

```json
{
  "fetched_at": "2026-04-03T12:00:00.000Z",
  "donations": [
    {
      "id": "abc123",
      "completed_at": "2026-04-03T11:59:00.000Z",
      "amount": {
        "value": "150.00",
        "currency": "USD"
      },
      "donor_name": "bakahashi",
      "donor_comment": "Let's go!",
      "is_match": false
    }
  ]
}
```

Each run fetches the latest 100 donations. As long as fewer than 100 donations come in between runs, no donations will be missed across snapshots.

## Running on a schedule (cron)

A `run.sh` script is provided that handles timestamped log output. To run every 5 minutes via crontab:

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
