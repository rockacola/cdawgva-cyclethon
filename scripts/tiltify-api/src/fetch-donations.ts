import * as fs from 'fs';
import * as path from 'path';

import { CYCLETHON_5_CAMPAIGN_ID, OUTPUT_DIR } from './constants';
import { setup } from './setup';
import { DonationsSnapshot, SavedDonation } from './types';
import type { components } from './types/api';
import { formatTimestamp } from './utils';

type ApiDonation = components['schemas']['Donation'] & { created_at?: string };

const LIMIT = 100;

(async () => {
  console.log(`[START] ${new Date().toISOString()}`);

  try {
    const fetchedAt = new Date();
    const client = await setup();

    console.log(`Fetching up to ${LIMIT} donations for campaign ${CYCLETHON_5_CAMPAIGN_ID}...`);

    const { data, error } = await client.GET('/api/public/campaigns/{campaign_id}/donations', {
      params: {
        path: { campaign_id: CYCLETHON_5_CAMPAIGN_ID },
        query: { limit: LIMIT },
      },
    });

    if (error) {
      throw new Error(`API error: ${JSON.stringify(error)}`);
    }

    const donations: SavedDonation[] = ((data.data ?? []) as ApiDonation[]).map((d) => ({
      id: d.id ?? '',
      created_at: d.created_at ?? '',
      completed_at: d.completed_at ?? '',
      amount: {
        value: d.amount?.value ?? '0',
        currency: d.amount?.currency ?? 'USD',
      },
      donor_name: d.donor_name ?? '',
      donor_comment: d.donor_comment ?? null,
    }));

    console.log(`Fetched ${donations.length} donations.`);

    const snapshot: DonationsSnapshot = {
      fetched_at: fetchedAt.toISOString(),
      donations,
    };

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    const filename = `donations_${formatTimestamp(fetchedAt)}.json`;
    const outputPath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2), 'utf-8');

    console.log(`Saved to ${outputPath}`);
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
