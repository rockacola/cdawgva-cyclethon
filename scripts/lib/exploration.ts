import * as fs from 'fs';
import * as path from 'path';

import { OUTPUT_DIR } from './constants.ts';
import { formatTimestamp } from './format-timestamp.ts';

const EXPLORATION_DIR = path.join(OUTPUT_DIR, 'exploration');

// Saves an exploration script's raw API response to data/output/exploration/ for later review.
export function saveExploration(name: string, data: unknown): string {
  fs.mkdirSync(EXPLORATION_DIR, { recursive: true });

  const filePath = path.join(EXPLORATION_DIR, `${name}_${formatTimestamp(new Date())}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

  return filePath;
}
