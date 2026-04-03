import { scrapeAllPages } from './scraper';
import { saveDonations } from './storage';
import { Donation } from './types';

(async () => {
  console.log(`[START] ${new Date().toISOString()}`);

  try {
    const scrapedAt = new Date().toISOString();

    console.log('Launching browser...');
    const rawDonations = await scrapeAllPages();

    const donations: Donation[] = rawDonations.map((d) => ({
      ...d,
      scraped_at: scrapedAt,
    }));

    console.log(`Scraped ${donations.length} donations in total.`);

    const outputPath = saveDonations(donations);
    console.log(`Saved to ${outputPath}`);
  } catch (err) {
    console.error('Error:', err);
    console.error(`[END]   ${new Date().toISOString()}`);
    process.exit(1);
  }

  console.log(`[END]   ${new Date().toISOString()}`);
})();
