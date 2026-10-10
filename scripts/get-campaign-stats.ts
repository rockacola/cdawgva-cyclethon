// Usage: npm run get-campaign-stats -- <campaign_id>

import { setup } from './lib/setup.ts';

const campaignId = process.argv[2];

if (!campaignId) {
  console.error('Usage: npm run get-campaign-stats -- <campaign_id>');
  process.exit(1);
}

try {
  const client = await setup();

  const { data, error } = await client.GET('/api/public/campaigns/{campaign_id}', {
    params: { path: { campaign_id: campaignId } },
  });

  if (error) {
    throw new Error(`API error: ${JSON.stringify(error)}`);
  }

  const campaign = data?.data;

  if (!campaign) {
    throw new Error('No campaign data returned');
  }

  console.log('campaign:', campaign);
} catch (err) {
  console.error('Error:', err);
  process.exit(1);
}
