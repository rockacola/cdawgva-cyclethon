import { CDAWGVA_SLUG, CDAWGVA_USER_ID } from './lib/campaign.ts';
import { saveExploration } from './lib/exploration.ts';
import { setup } from './lib/setup.ts';

try {
  const client = await setup();

  const { data, error } = await client.GET('/api/public/users/{user_id}/campaigns', {
    params: { path: { user_id: CDAWGVA_USER_ID } },
  });

  if (error) {
    throw new Error(`API error: ${JSON.stringify(error)}`);
  }

  console.log(JSON.stringify(data, null, 2));
  console.log(`Saved to ${saveExploration('get-user-campaigns', CDAWGVA_SLUG, data)}`);
} catch (err) {
  console.error('Error:', err);
  process.exit(1);
}
