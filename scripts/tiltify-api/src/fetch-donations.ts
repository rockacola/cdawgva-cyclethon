import * as fs from 'fs';
import * as path from 'path';

import { buildStats } from './build-stats';
import { createApiClient } from './client';
import { CYCLETHON_5_CAMPAIGN_ID, OUTPUT_DIR } from './constants';
import { downloadJSON, uploadJSON } from './r2';
import { setup } from './setup';
import { buildDailySnapshots } from './snapshot-by-date';
import { DonationsSnapshot, SavedDonation } from './types';
import type { components } from './types/api';
import { formatTimestamp } from './utils';

type ApiDonation = components['schemas']['Donation'] & { created_at?: string };
type TiltifyClient = ReturnType<typeof createApiClient>;

const LIMIT = 100;
const OVERLAP_BUFFER_MS = 30_000; // 30s overlap to avoid missing edge cases on burst

const R2_KEY_FULL = 'donations-full.json';
const R2_KEY_LATEST_100 = 'donations-latest-100.json';
const R2_KEY_LATEST_500 = 'donations-latest-500.json';

interface FullData {
  updated_at: string;
  donations: SavedDonation[];
}

interface LatestData {
  generated_at: string;
  donations: SavedDonation[];
}

async function fetchNewDonations(client: TiltifyClient, since?: string): Promise<SavedDonation[]> {
  const all: SavedDonation[] = [];
  let cursor: string | null = null;
  let page = 1;

  do {
    console.log(`  Fetching page ${page}${since ? ` (completed_after: ${since})` : ''}...`);

    const { data, error } = await client.GET('/api/public/campaigns/{campaign_id}/donations', {
      params: {
        path: { campaign_id: CYCLETHON_5_CAMPAIGN_ID },
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

(async () => {
  console.log(`[START] ${new Date().toISOString()}`);

  try {
    const fetchedAt = new Date();
    const client = await setup();

    // Step 1: Download existing full data from R2
    console.log('Downloading existing donations from R2...');
    const existing = await downloadJSON<FullData>(R2_KEY_FULL);
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
    const newDonations = await fetchNewDonations(client, since);
    console.log(`Fetched ${newDonations.length} donation(s) from API.`);

    // Step 4: Save raw snapshot locally as backup
    const snapshot: DonationsSnapshot = {
      fetched_at: fetchedAt.toISOString(),
      donations: newDonations,
    };
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    const filename = `donations_${formatTimestamp(fetchedAt)}.json`;
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
    await uploadJSON(R2_KEY_FULL, fullData);
    console.log(`Uploaded ${R2_KEY_FULL} (${merged.length} donations).`);

    // Step 7: Upload latest slices to R2 (what the webapp fetches)
    for (const [key, limit] of [
      [R2_KEY_LATEST_100, 100],
      [R2_KEY_LATEST_500, 500],
    ] as [string, number][]) {
      const latestData: LatestData = {
        generated_at: fetchedAt.toISOString(),
        donations: merged.slice(0, limit),
      };
      await uploadJSON(key, latestData);
      console.log(`Uploaded ${key} (${latestData.donations.length} donations).`);
    }

    // Step 8: Build and upload donation stats (daily totals, cumulative, grouped by JST date)
    await buildStats();

    // Step 9: Build and upload daily donation snapshots for completed event days (JST)
    console.log('Building daily snapshots...');
    await buildDailySnapshots();
  } catch (err) {
    console.error('Error:', err);
    console.error(`[END]   ${new Date().toISOString()}`);
    process.exit(1);
  }

  console.log(`[END]   ${new Date().toISOString()}`);
})().catch((err) => {
  console.error('Unhandled error:', err);
  console.error(`[END]   ${new Date().toISOString()}`);
  process.exit(1);
});
