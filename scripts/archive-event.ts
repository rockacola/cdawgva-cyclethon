// Usage: npm run archive-event -- <event-key>
//
// One-shot backfill for a completed event: fetches its entire donation history in one pass
// (no incremental merge, unlike fetch-donations.ts), then writes full/latest/stats/daily-snapshot
// datasets under that event's key prefix. Not scheduled anywhere, run manually with DATA_STORE=r2.

import { buildStats } from './build-stats.ts';
import { getEvent } from './lib/campaign.ts';
import type { createApiClient } from './lib/client.ts';
import { uploadJSON } from './lib/data-store.ts';
import { r2KeyFull, r2KeyLatest100, r2KeyLatest500 } from './lib/r2-keys.ts';
import { setup } from './lib/setup.ts';
import type { components } from './lib/types/api.ts';
import type { SavedDonation } from './lib/types.ts';
import { buildDailySnapshots } from './snapshot-by-date.ts';

type ApiDonation = components['schemas']['Donation'] & { created_at?: string };
type TiltifyClient = ReturnType<typeof createApiClient>;

const LIMIT = 100;
const JST_OFFSET_MS = 9 * 60 * 60 * 1000; // UTC+9

interface FullData {
  updated_at: string;
  donations: SavedDonation[];
}

interface LatestData {
  generated_at: string;
  donations: SavedDonation[];
}

const eventKey = process.argv[2];

if (!eventKey) {
  console.error('Usage: npm run archive-event -- <event-key>');
  process.exit(1);
}

const event = getEvent(eventKey);

if (event.status !== 'archived') {
  console.error(
    `Refusing to archive "${event.key}": status is "${event.status}", not "archived". Only archive a completed event.`,
  );
  process.exit(1);
}

async function fetchAllDonations(
  client: TiltifyClient,
  campaignId: string,
): Promise<SavedDonation[]> {
  const all: SavedDonation[] = [];
  let cursor: string | null = null;
  let page = 1;

  do {
    console.log(`  Fetching page ${page}...`);

    const { data, error } = await client.GET('/api/public/campaigns/{campaign_id}/donations', {
      params: {
        path: { campaign_id: campaignId },
        query: {
          limit: LIMIT,
          ...(cursor ? { after: cursor } : {}),
        },
      },
    });

    if (error) {
      throw new Error(`API error: ${JSON.stringify(error)}`);
    }

    const donations = ((data.data ?? []) as ApiDonation[]).map((d) => ({
      id: d.id ?? '',
      completed_at: Math.floor(new Date(d.completed_at ?? 0).getTime() / 1000),
      amount_cent: Math.round(parseFloat(d.amount?.value ?? '0') * 100),
      amount_currency: d.amount?.currency ?? 'USD',
      donor_name: d.donor_name ?? '',
      donor_comment: d.donor_comment ?? null,
    }));

    all.push(...donations);

    // Cast metadata to access cursor — metadata type is affected by PaginatedResponse intersection
    const meta = data.metadata as { after?: string | null } | undefined;
    cursor = meta?.after ?? null;
    page++;
  } while (cursor);

  return all;
}

function toJstDateString(unixSeconds: number): string {
  const jstMs = unixSeconds * 1000 + JST_OFFSET_MS;
  return new Date(jstMs).toISOString().slice(0, 10);
}

console.log(`[START] ${new Date().toISOString()}`);

try {
  const client = await setup();

  // Step 1: Fetch the entire donation history in one pass
  console.log(`Fetching full donation history for "${event.key}"...`);
  const donations = await fetchAllDonations(client, event.campaignId);
  donations.sort((a, b) => b.completed_at - a.completed_at);
  console.log(`Fetched ${donations.length} donation(s) total.`);

  if (donations.length === 0) {
    console.log('No donations found — nothing to archive.');
    console.log(`[END]   ${new Date().toISOString()}`);
    process.exit(0);
  }

  const archivedAt = new Date().toISOString();

  // Step 2: Upload full dataset to R2
  const fullData: FullData = {
    updated_at: archivedAt,
    donations,
  };
  const fullKey = r2KeyFull(event.key);
  await uploadJSON(fullKey, fullData);
  console.log(`Uploaded ${fullKey} (${donations.length} donations).`);

  // Step 3: Upload latest slices, for output-shape consistency with the live pipeline
  for (const [key, limit] of [
    [r2KeyLatest100(event.key), 100],
    [r2KeyLatest500(event.key), 500],
  ] as [string, number][]) {
    const latestData: LatestData = {
      generated_at: archivedAt,
      donations: donations.slice(0, limit),
    };
    await uploadJSON(key, latestData);
    console.log(`Uploaded ${key} (${latestData.donations.length} donations).`);
  }

  // Step 4: Build and upload donation stats (daily totals, cumulative, grouped by JST date)
  await buildStats(event.key, event.campaignId);

  // Step 5: Build and upload daily donation snapshots, date range derived from the data itself
  console.log('Building daily snapshots...');
  const dates = [...new Set(donations.map((d) => toJstDateString(d.completed_at)))].sort();
  await buildDailySnapshots(event.key, dates);

  console.log(`[END]   ${new Date().toISOString()}`);
} catch (err) {
  console.error('Error:', err);
  console.error(`[END]   ${new Date().toISOString()}`);
  process.exit(1);
}
