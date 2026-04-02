import * as fs from 'fs';
import * as path from 'path';

import { chromium } from 'playwright';

import { OUTPUT_DIR, TARGET_URL } from './constants';
import { Donation } from './types';
import { formatTimestamp } from './utils';

async function scrapeDonations(): Promise<void> {
  const scrapedAt = new Date();
  const scrapedAtISO = scrapedAt.toISOString();

  console.log(`Launching browser and navigating to ${TARGET_URL}...`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });

  // Wait for the donations table to appear
  console.log('Waiting for donations table...');
  await page.waitForSelector('table', { timeout: 30000 });

  const rawDonations = await page.evaluate((): Omit<Donation, 'scraped_at'>[] => {
    const tables = Array.from(document.querySelectorAll('table'));

    // Find the table that has the expected donation columns (Name, Amount, Comment, Incentives)
    let donationTable: Element | null = null;
    for (const table of tables) {
      const headers = Array.from(table.querySelectorAll('thead th')).map(
        (th) => th.textContent?.trim().replace(/\s+/g, ' ') ?? '',
      );
      if (headers.some((h) => h.includes('Name')) && headers.some((h) => h.includes('Amount'))) {
        donationTable = table;
        break;
      }
    }

    if (!donationTable) {
      return [];
    }

    const rows = Array.from(donationTable.querySelectorAll('tbody tr'));

    return rows.map((row) => {
      const cells = Array.from(row.querySelectorAll('td'));

      // is_sticky: the top/pinned row has a Trophy SVG icon in the name cell
      const is_sticky = !!cells[0]?.querySelector('svg title');

      // Name is in the first cell — strip SVG title text (e.g. "Trophy") by
      // removing all <svg> elements before reading textContent
      const nameCell = cells[0]?.cloneNode(true) as Element | undefined;
      nameCell?.querySelectorAll('svg').forEach((svg) => svg.remove());
      const name = nameCell?.textContent?.trim() ?? '';

      // Amount is in the second cell
      const amount_label = cells[1]?.textContent?.trim() ?? '';
      const parsed = parseFloat(amount_label.replace(/[^0-9.]/g, ''));
      const amount = Number.isNaN(parsed) ? null : parsed;

      // Comment is in the fourth cell (index 3; index 2 is a small icon/spacer column)
      const comment = cells[3]?.textContent?.trim() ?? '';

      // Incentives is in the fifth cell
      const incentives = cells[4]?.textContent?.trim() ?? '';

      return { name, amount, amount_label, comment, incentives, is_sticky };
    });
  });

  await browser.close();

  const donations: Donation[] = rawDonations.map((d) => ({
    ...d,
    scraped_at: scrapedAtISO,
  }));

  console.log(`Scraped ${donations.length} donations.`);

  const filename = `donations_${formatTimestamp(scrapedAt)}.json`;
  const outputPath = path.join(OUTPUT_DIR, filename);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(donations, null, 2), 'utf-8');

  console.log(`Saved to ${outputPath}`);
}

scrapeDonations().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
