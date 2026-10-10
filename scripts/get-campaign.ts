import { CYCLETHON_5_CAMPAIGN_ID, CYCLETHON_5_SLUG } from './lib/campaign.ts';
import { saveExploration } from './lib/exploration.ts';
import { setup } from './lib/setup.ts';

try {
  const client = await setup();

  const { data, error } = await client.GET('/api/public/campaigns/{campaign_id}', {
    params: { path: { campaign_id: CYCLETHON_5_CAMPAIGN_ID } },
  });

  if (error) {
    throw new Error(`API error: ${JSON.stringify(error)}`);
  }

  console.log(JSON.stringify(data, null, 2));
  console.log(`Saved to ${saveExploration('get-campaign', CYCLETHON_5_SLUG, data)}`);
} catch (err) {
  console.error('Error:', err);
  process.exit(1);
}
