/**
 * Generate daily donation snapshots for completed JST days during the event.
 *
 * For each day in the event range (2026-04-05 ~ 2026-04-19 JST), if the day
 * has ended and a snapshot doesn't already exist on R2, filter donations from
 * donations-full.json and upload a snapshot as donations-YYYY-MM-DD.json.
 *
 * The output format matches donations-latest-100.json: { generated_at, donations }.
 *
 * Called from fetch-donations.ts as part of the refresh pipeline.
 * Can also be run standalone: ts-node src/snapshot-by-date.ts
 */

import 'dotenv/config';

import { downloadJSON, uploadJSON } from './r2';
import { SavedDonation } from './types';

const JST_OFFSET_MS = 9 * 60 * 60 * 1000; // UTC+9

const EVENT_START = '2026-04-05'; // inclusive, JST
const EVENT_END = '2026-04-19'; // inclusive, JST

const R2_KEY_FULL = 'donations-full.json';

interface FullData {
  updated_at: string;
  donations: SavedDonation[];
}

interface DailySnapshot {
  generated_at: string;
  donations: SavedDonation[];
}

function r2KeyForDate(date: string): string {
  return `donations-${date}.json`;
}

function getJstDayRange(dateStr: string): { startUnix: number; endUnix: number } {
  const [year, month, day] = dateStr.split('-').map(Number);
  const jstMidnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const utcStart = new Date(jstMidnight.getTime() - JST_OFFSET_MS);
  const utcEnd = new Date(utcStart.getTime() + 24 * 60 * 60 * 1000);

  return {
    startUnix: Math.floor(utcStart.getTime() / 1000),
    endUnix: Math.floor(utcEnd.getTime() / 1000),
  };
}

function getNowJstDateString(): string {
  const nowJst = new Date(Date.now() + JST_OFFSET_MS);
  return nowJst.toISOString().slice(0, 10);
}

function getEventDates(): string[] {
  const dates: string[] = [];
  const start = new Date(EVENT_START);
  const end = new Date(EVENT_END);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10));
  }

  return dates;
}

export async function buildDailySnapshots(): Promise<void> {
  const todayJst = getNowJstDateString();
  const allDates = getEventDates();

  // Only process days that have fully ended in JST (strictly before today)
  const completedDates = allDates.filter((date) => date < todayJst);

  if (completedDates.length === 0) {
    console.log('No completed event days to snapshot yet.');
    return;
  }

  // Check which snapshots already exist on R2
  const datesToGenerate: string[] = [];
  for (const date of completedDates) {
    const existing = await downloadJSON<DailySnapshot>(r2KeyForDate(date));
    if (existing) {
      console.log(`  Snapshot for ${date} already exists, skipping.`);
    } else {
      datesToGenerate.push(date);
    }
  }

  if (datesToGenerate.length === 0) {
    console.log('All daily snapshots are up to date.');
    return;
  }

  // Download full donations once
  console.log('Downloading donations-full.json from R2...');
  const full = await downloadJSON<FullData>(R2_KEY_FULL);

  if (!full || full.donations.length === 0) {
    console.log('No donations found — skipping daily snapshots.');
    return;
  }

  const generatedAt = new Date().toISOString();

  for (const date of datesToGenerate) {
    const { startUnix, endUnix } = getJstDayRange(date);

    const filtered = full.donations
      .filter((d) => d.completed_at >= startUnix && d.completed_at < endUnix)
      .sort((a, b) => b.completed_at - a.completed_at);

    const snapshot: DailySnapshot = {
      generated_at: generatedAt,
      donations: filtered,
    };

    const key = r2KeyForDate(date);
    await uploadJSON(key, snapshot);
    console.log(`  Uploaded ${key} (${filtered.length} donations).`);
  }
}

// Standalone runner
if (require.main === module) {
  console.log(`[START] ${new Date().toISOString()}`);
  buildDailySnapshots()
    .then(() => console.log(`[END]   ${new Date().toISOString()}`))
    .catch((err) => {
      console.error('Error:', err);
      process.exit(1);
    });
}
