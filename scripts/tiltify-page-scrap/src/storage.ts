import * as fs from 'fs';
import * as path from 'path';

import { OUTPUT_DIR } from './constants';
import { Donation } from './types';
import { formatTimestamp } from './utils';

export function saveDonations(donations: Donation[]): string {
  const filename = `donations_${formatTimestamp(new Date())}.json`;
  const outputPath = path.join(OUTPUT_DIR, filename);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(donations, null, 2), 'utf-8');
  return outputPath;
}
