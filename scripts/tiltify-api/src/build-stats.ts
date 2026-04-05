import 'dotenv/config';

import { downloadJSON, uploadJSON } from './r2';
import { SavedDonation } from './types';

const R2_KEY_FULL = 'donations-full.json';
const R2_KEY_STATS = 'donations-stats.json';

const JST_OFFSET_MS = 9 * 60 * 60 * 1000; // UTC+9, no DST

interface FullData {
  updated_at: string;
  donations: SavedDonation[];
}

interface CurrencyTotal {
  amount_cent: number;
  count: number;
}

interface DailyTotal {
  date: string; // YYYY-MM-DD in JST
  by_currency: Record<string, CurrencyTotal>;
  cumulative_by_currency: Record<string, CurrencyTotal>;
}

interface StatsOutput {
  _meta: {
    generated_at: string;
    timezone: string;
    utc_offset: string;
  };
  stats: {
    daily_totals: DailyTotal[];
  };
}

function toJstDateString(unixSeconds: number): string {
  const jstMs = unixSeconds * 1000 + JST_OFFSET_MS;
  return new Date(jstMs).toISOString().slice(0, 10);
}

export async function buildStats(): Promise<void> {
  console.log('Downloading donations-full.json from R2...');
  const full = await downloadJSON<FullData>(R2_KEY_FULL);

  if (!full || full.donations.length === 0) {
    console.log('No donations found — skipping stats build.');
    return;
  }

  // Aggregate per-day per-currency totals (donations sorted DESC, so reverse for ASC processing)
  const dailyMap = new Map<string, Record<string, CurrencyTotal>>();

  for (const donation of full.donations) {
    const date = toJstDateString(donation.completed_at);
    const currency = donation.amount_currency;

    if (!dailyMap.has(date)) {
      dailyMap.set(date, {});
    }

    const day = dailyMap.get(date)!;

    if (!day[currency]) {
      day[currency] = { amount_cent: 0, count: 0 };
    }

    day[currency].amount_cent += donation.amount_cent;
    day[currency].count += 1;
  }

  // Sort dates ASC for chart output and cumulative calculation
  const sortedDates = Array.from(dailyMap.keys()).sort();

  // Build cumulative totals rolling forward across days
  const runningCumulative: Record<string, CurrencyTotal> = {};

  const dailyTotals: DailyTotal[] = sortedDates.map((date) => {
    const by_currency = dailyMap.get(date)!;

    for (const [currency, totals] of Object.entries(by_currency)) {
      if (!runningCumulative[currency]) {
        runningCumulative[currency] = { amount_cent: 0, count: 0 };
      }
      runningCumulative[currency].amount_cent += totals.amount_cent;
      runningCumulative[currency].count += totals.count;
    }

    // Deep-copy the running cumulative so each day has its own snapshot
    const cumulative_by_currency: Record<string, CurrencyTotal> = {};
    for (const [currency, totals] of Object.entries(runningCumulative)) {
      cumulative_by_currency[currency] = { ...totals };
    }

    return { date, by_currency, cumulative_by_currency };
  });

  const output: StatsOutput = {
    _meta: {
      generated_at: new Date().toISOString(),
      timezone: 'Asia/Tokyo',
      utc_offset: '+09:00',
    },
    stats: {
      daily_totals: dailyTotals,
    },
  };

  await uploadJSON(R2_KEY_STATS, output);
  console.log(`Uploaded ${R2_KEY_STATS} (${dailyTotals.length} day(s)).`);
}

// Standalone runner
if (require.main === module) {
  console.log(`[START] ${new Date().toISOString()}`);
  buildStats()
    .then(() => console.log(`[END]   ${new Date().toISOString()}`))
    .catch((err) => {
      console.error('Error:', err);
      process.exit(1);
    });
}
