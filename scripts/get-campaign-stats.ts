import { CYCLETHON_5_CAMPAIGN_ID } from './lib/campaign.ts';
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

  const campaign = data?.data;

  if (!campaign) {
    throw new Error('No campaign data returned');
  }

  console.log('campaign:', campaign);
  console.log(`Saved to ${saveExploration('get-campaign-stats', campaign)}`);
} catch (err) {
  console.error('Error:', err);
  process.exit(1);
}
