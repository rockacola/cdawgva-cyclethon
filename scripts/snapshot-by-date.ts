/**
 * Generate per-day donation snapshots for an event.
 *
 * `buildDailySnapshots` is the shared core: given an event key and a list of candidate dates,
 * skip any that already have a snapshot on R2, then filter donations-full.json and upload the
 * rest as donations-YYYY-MM-DD.json.
 *
 * The output format matches donations-latest-100.json: { generated_at, donations }.
 *
 * `getCompletedDates` is the live-pipeline helper: given an event's liveWindow, return the dates
 * within it that have fully ended in JST (strictly before today). Called from fetch-donations.ts,
 * and from the standalone runner below for the currently live event.
 *
 * archive-event.ts does not use `getCompletedDates` — it derives its date range directly from the
 * donations it fetched, since a completed event has no "today" cutoff to worry about.
 */

import 'dotenv/config';

import { CURRENT_LIVE_EVENT_KEY, getEvent } from './lib/campaign.ts';
import { downloadJSON, uploadJSON } from './lib/data-store.ts';
import { r2KeyForDate, r2KeyFull } from './lib/r2-keys.ts';
import type { SavedDonation } from './lib/types.ts';

const JST_OFFSET_MS = 9 * 60 * 60 * 1000; // UTC+9

interface FullData {
  updated_at: string;
  donations: SavedDonation[];
}

interface DailySnapshot {
  generated_at: string;
  donations: SavedDonation[];
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

function getJstDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10));
  }

  return dates;
}

export function getCompletedDates(start: string, end: string): string[] {
  const todayJst = getNowJstDateString();
  return getJstDateRange(start, end).filter((date) => date < todayJst);
}

export async function buildDailySnapshots(
  eventKey: string,
  candidateDates: string[],
): Promise<void> {
  if (candidateDates.length === 0) {
    console.log('No event days to snapshot.');
    return;
  }

  // Check which snapshots already exist on R2
  const datesToGenerate: string[] = [];
  for (const date of candidateDates) {
    const existing = await downloadJSON<DailySnapshot>(r2KeyForDate(eventKey, date));
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
  console.log('Downloading donations-full.json...');
  const full = await downloadJSON<FullData>(r2KeyFull(eventKey));

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

    const key = r2KeyForDate(eventKey, date);
    await uploadJSON(key, snapshot);
    console.log(`  Uploaded ${key} (${filtered.length} donations).`);
  }
}

// Standalone runner — operates on the currently live event, if any.
if (import.meta.filename === process.argv[1]) {
  console.log(`[START] ${new Date().toISOString()}`);
  try {
    if (!CURRENT_LIVE_EVENT_KEY) {
      console.log('No live event configured — nothing to snapshot.');
    } else {
      const event = getEvent(CURRENT_LIVE_EVENT_KEY);
      if (!event.liveWindow) {
        throw new Error(`Live event "${event.key}" has no liveWindow configured.`);
      }
      const completedDates = getCompletedDates(event.liveWindow.start, event.liveWindow.end);
      await buildDailySnapshots(event.key, completedDates);
    }
    console.log(`[END]   ${new Date().toISOString()}`);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}
