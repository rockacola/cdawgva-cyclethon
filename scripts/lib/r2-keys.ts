// Names of the JSON datasets the pipeline reads/writes (R2 object keys, or local filenames
// when DATA_STORE=local). Centralized here since fetch-donations.ts, build-stats.ts, and
// snapshot-by-date.ts all need to agree on the exact same names.

export const R2_KEY_FULL = 'donations-full.json';
export const R2_KEY_LATEST_100 = 'donations-latest-100.json';
export const R2_KEY_LATEST_500 = 'donations-latest-500.json';
export const R2_KEY_STATS = 'donations-stats.json';

export function r2KeyForDate(date: string): string {
  return `donations-${date}.json`;
}
