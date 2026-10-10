import { CDAWGVA_SLUG } from './lib/campaign.ts';
import { saveExploration } from './lib/exploration.ts';
import { setup } from './lib/setup.ts';

try {
  const client = await setup();

  const { data, error } = await client.GET('/api/public/users/by/slug/{slug}', {
    params: { path: { slug: CDAWGVA_SLUG } },
  });

  if (error) {
    throw new Error(`API error: ${JSON.stringify(error)}`);
  }

  console.log(JSON.stringify(data, null, 2));
  console.log(`Saved to ${saveExploration('get-user-by-slug', CDAWGVA_SLUG, data)}`);
} catch (err) {
  console.error('Error:', err);
  process.exit(1);
}
