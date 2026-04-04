// DEPRECATED: This script was used when the webapp lived in this repo and consumed a
// static donations.json at build time. The webapp has since moved to a separate repo
// (cdawgva-cyclethon-app) and now fetches live data from Cloudflare R2.
//
// fetch-donations.ts now handles the full pipeline: fetch from Tiltify → merge → upload to R2.
// This script is no longer part of any workflow and will be removed in a future cleanup.

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

    // TODO (phase 2): Cap donations written to webapp at a reasonable limit (e.g. 500-1000)
    // to keep donations.json small and fast to load. With 5-6 digit total donations expected,
    // the full dataset will be too large for a static JSON file.
    // The full archive remains available in output/ snapshots.
    // Consider: merged.slice(0, 1000) or a configurable MAX_DONATIONS constant.

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
