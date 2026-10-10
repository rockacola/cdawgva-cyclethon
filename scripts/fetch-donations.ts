import * as fs from 'fs';
import * as path from 'path';

import { buildStats } from './build-stats.ts';
import { CURRENT_LIVE_EVENT_KEY, getEvent } from './lib/campaign.ts';
import type { createApiClient } from './lib/client.ts';
import { OUTPUT_DIR } from './lib/constants.ts';
import { downloadJSON, uploadJSON } from './lib/data-store.ts';
import { formatTimestamp } from './lib/format-timestamp.ts';
import { r2KeyFull, r2KeyLatest100, r2KeyLatest500 } from './lib/r2-keys.ts';
import { setup } from './lib/setup.ts';
import type { components } from './lib/types/api.ts';
import type { DonationsSnapshot, SavedDonation } from './lib/types.ts';
import { buildDailySnapshots, getCompletedDates } from './snapshot-by-date.ts';

type ApiDonation = components['schemas']['Donation'] & { created_at?: string };
type TiltifyClient = ReturnType<typeof createApiClient>;

const LIMIT = 100;
const OVERLAP_BUFFER_MS = 30_000; // 30s overlap to avoid missing edge cases on burst

interface FullData {
  updated_at: string;
  donations: SavedDonation[];
}

interface LatestData {
  generated_at: string;
  donations: SavedDonation[];
}

async function fetchNewDonations(
  client: TiltifyClient,
  campaignId: string,
  since?: string,
): Promise<SavedDonation[]> {
  const all: SavedDonation[] = [];
  let cursor: string | null = null;
  let page = 1;

  do {
    console.log(`  Fetching page ${page}${since ? ` (completed_after: ${since})` : ''}...`);

    const { data, error } = await client.GET('/api/public/campaigns/{campaign_id}/donations', {
      params: {
        path: { campaign_id: campaignId },
        query: {
          limit: LIMIT,
          ...(since ? { completed_after: since } : {}),
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

console.log(`[START] ${new Date().toISOString()}`);

if (!CURRENT_LIVE_EVENT_KEY) {
  console.log('No live event configured (CURRENT_LIVE_EVENT_KEY is null) — nothing to fetch.');
  console.log(`[END]   ${new Date().toISOString()}`);
  process.exit(0);
}

const event = getEvent(CURRENT_LIVE_EVENT_KEY);

try {
  const fetchedAt = new Date();
  const client = await setup();

  // Step 1: Download existing full data from R2
  console.log('Downloading existing donations...');
  const existing = await downloadJSON<FullData>(r2KeyFull(event.key));
  const existingDonations: SavedDonation[] = existing?.donations ?? [];
  console.log(`${existingDonations.length} existing donations loaded.`);

  // Step 2: Determine since timestamp with overlap buffer
  let since: string | undefined;
  if (existingDonations.length > 0) {
    const latestCompletedAt = existingDonations[0].completed_at; // sorted DESC, unix seconds
    since = new Date(latestCompletedAt * 1000 - OVERLAP_BUFFER_MS).toISOString();
    console.log(`Fetching donations since ${since}...`);
  } else {
    console.log('No existing data — fetching full history...');
  }

  // Step 3: Fetch new donations from Tiltify (cursor-based, all pages)
  const newDonations = await fetchNewDonations(client, event.campaignId, since);
  console.log(`Fetched ${newDonations.length} donation(s) from API.`);

  // Step 4: Save raw snapshot locally as backup
  const snapshot: DonationsSnapshot = {
    fetched_at: fetchedAt.toISOString(),
    donations: newDonations,
  };
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const filename = `donations_${event.key}_${formatTimestamp(fetchedAt)}.json`;
  const outputPath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2), 'utf-8');
  console.log(`Local snapshot saved to ${outputPath}`);

  // Step 5: Merge and dedup
  const seen = new Set<string>(existingDonations.map((d) => d.id));
  const merged = [...existingDonations];
  let addedCount = 0;

  for (const donation of newDonations) {
    if (!seen.has(donation.id)) {
      seen.add(donation.id);
      merged.push(donation);
      addedCount++;
    }
  }

  merged.sort((a, b) => b.completed_at - a.completed_at);
  console.log(`${addedCount} new donation(s) added. Total: ${merged.length}.`);

  // Step 6: Upload full dataset to R2
  const fullData: FullData = {
    updated_at: fetchedAt.toISOString(),
    donations: merged,
  };
  const fullKey = r2KeyFull(event.key);
  await uploadJSON(fullKey, fullData);
  console.log(`Uploaded ${fullKey} (${merged.length} donations).`);

  // Step 7: Upload latest slices to R2 (what the webapp fetches)
  for (const [key, limit] of [
    [r2KeyLatest100(event.key), 100],
    [r2KeyLatest500(event.key), 500],
  ] as [string, number][]) {
    const latestData: LatestData = {
      generated_at: fetchedAt.toISOString(),
      donations: merged.slice(0, limit),
    };
    await uploadJSON(key, latestData);
    console.log(`Uploaded ${key} (${latestData.donations.length} donations).`);
  }

  // Step 8: Build and upload donation stats (daily totals, cumulative, grouped by JST date)
  await buildStats(event.key, event.campaignId);

  // Step 9: Build and upload daily donation snapshots for completed event days (JST)
  console.log('Building daily snapshots...');
  if (event.liveWindow) {
    const completedDates = getCompletedDates(event.liveWindow.start, event.liveWindow.end);
    await buildDailySnapshots(event.key, completedDates);
  } else {
    console.log(`No liveWindow configured for "${event.key}" — skipping daily snapshots.`);
  }

  console.log(`[END]   ${new Date().toISOString()}`);
} catch (err) {
  console.error('Error:', err);
  console.error(`[END]   ${new Date().toISOString()}`);
  process.exit(1);
}
