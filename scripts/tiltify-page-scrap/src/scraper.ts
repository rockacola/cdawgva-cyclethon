import { Page, chromium } from 'playwright';

import { MAX_PAGES, TARGET_URL } from './constants';
import { Donation } from './types';

// Scrapes all donation rows visible in the current table page
async function scrapeCurrentPage(page: Page): Promise<Omit<Donation, 'index' | 'scraped_at'>[]> {
  return page.evaluate((): Omit<Donation, 'index' | 'scraped_at'>[] => {
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
}

// Navigates through all pages up to MAX_PAGES and returns deduplicated raw donations
export async function scrapeAllPages(): Promise<Omit<Donation, 'index' | 'scraped_at'>[]> {
  const browser = await chromium.launch({ headless: true });
  const allRawDonations: Omit<Donation, 'index' | 'scraped_at'>[] = [];

  try {
    const page = await browser.newPage();

    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });

    console.log('Waiting for donations table...');
    await page.waitForSelector('table', { timeout: 30000 });

    // Dismiss cookie consent banner if present, as it blocks clicks on pagination
    const acceptButton = page.locator('[data-cky-tag="accept-button"]');
    if (await acceptButton.isVisible()) {
      console.log('Dismissing cookie consent banner...');
      await acceptButton.click();
      await page.waitForSelector('[data-cky-tag="notice"]', { state: 'hidden' });
      // Allow the page to fully settle after the banner dismissal before paginating
      await page.waitForTimeout(2000);
    }

    const seen = new Set<string>();

    for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum++) {
      console.log(`Scraping page ${pageNum}/${MAX_PAGES}...`);

      const rows = await scrapeCurrentPage(page);
      let newCount = 0;

      for (const row of rows) {
        // Deduplicate using a composite key of name + amount + comment
        const key = `${row.name}|${row.amount_label}|${row.comment}`;
        if (!seen.has(key)) {
          seen.add(key);
          allRawDonations.push(row);
          newCount++;
        }
      }

      console.log(`  Found ${rows.length} rows, ${newCount} new.`);

      if (pageNum === MAX_PAGES) {
        break;
      }

      // Find the "next page" button by its SVG title "Right"
      const nextButton = page.locator('button:has(svg title:text("Right"))').last();
      const isDisabled = await nextButton.isDisabled();

      if (isDisabled) {
        console.log('Reached last page.');
        break;
      }

      // Capture first row text before clicking so we can detect when new data has loaded
      const firstRowTextBefore = await page.locator('table tbody tr:first-child').innerText();
      await nextButton.click();

      // Wait for the first row to change from the previous value, then wait an additional
      // moment for the full page of results to settle (table updates take ~2s)
      await page.waitForFunction(
        (prev) => {
          const el = document.querySelector('table tbody tr:first-child');
          return el !== null && el.textContent !== prev;
        },
        firstRowTextBefore,
        { timeout: 10000 },
      );
      await page.waitForTimeout(2000);
    }
  } finally {
    await browser.close();
  }

  return allRawDonations;
}
