import * as fs from 'fs';
import * as path from 'path';

import { OUTPUT_DIR } from './constants.ts';
import { formatTimestamp } from './format-timestamp.ts';

const EXPLORATION_DIR = path.join(OUTPUT_DIR, 'exploration');

// Saves an exploration script's raw API response to data/output/exploration/ for later review.
// `param` identifies what was queried (a slug, not a UUID) so the filename stays readable once
// more than one user/campaign is being tracked, e.g. get-campaign_cyclethon-5_<timestamp>.json.
export function saveExploration(name: string, param: string, data: unknown): string {
  fs.mkdirSync(EXPLORATION_DIR, { recursive: true });

  const filePath = path.join(
    EXPLORATION_DIR,
    `${name}_${param}_${formatTimestamp(new Date())}.json`,
  );
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

  return filePath;
}
