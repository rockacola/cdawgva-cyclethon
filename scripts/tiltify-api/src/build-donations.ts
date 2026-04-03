import * as fs from 'fs';
import * as path from 'path';

import { OUTPUT_DIR } from './constants';
import { DonationsSnapshot, SavedDonation } from './types';

const WEBAPP_DATA_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'webapp',
  'src',
  'data',
  'donations.json',
);

interface ConsolidatedOutput {
  generated_at: string;
  donations: SavedDonation[];
}

(async () => {
  console.log(`[START] ${new Date().toISOString()}`);

  try {
    const files = fs
      .readdirSync(OUTPUT_DIR)
      .filter((f) => f.startsWith('donations_') && f.endsWith('.json'))
      .sort();

    if (files.length === 0) {
      throw new Error(`No donation snapshot files found in ${OUTPUT_DIR}`);
    }

    console.log(`Found ${files.length} snapshot file(s). Merging...`);

    const seen = new Set<string>();
    const merged: SavedDonation[] = [];

    for (const file of files) {
      const raw = fs.readFileSync(path.join(OUTPUT_DIR, file), 'utf-8');
      const snapshot = JSON.parse(raw) as DonationsSnapshot;

      for (const donation of snapshot.donations) {
        if (!seen.has(donation.id)) {
          seen.add(donation.id);
          merged.push(donation);
        }
      }
    }

    merged.sort((a, b) => b.completed_at.localeCompare(a.completed_at));

    console.log(`${merged.length} unique donations after dedup.`);

    const output: ConsolidatedOutput = {
      generated_at: new Date().toISOString(),
      donations: merged,
    };

    fs.mkdirSync(path.dirname(WEBAPP_DATA_PATH), { recursive: true });
    fs.writeFileSync(WEBAPP_DATA_PATH, JSON.stringify(output, null, 2), 'utf-8');

    console.log(`Saved to ${WEBAPP_DATA_PATH}`);
  } catch (err) {
    console.error('Error:', err);
    console.error(`[END]   ${new Date().toISOString()}`);
    process.exit(1);
  }

  console.log(`[END]   ${new Date().toISOString()}`);
})();
