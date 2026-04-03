// Example response:
// {
//   "data": {
//     "id": "69c5aa70-54cf-42a9-8754-d4d60ec28da0",
//     "name": "Cyclethon 5",
//     "status": "published",
//     "slug": "cyclethon-5",
//     "url": "/@cdawgva/cyclethon-5",
//     "description": "I'm fundraising for Immune Deficiency Foundation. In my 5th annual cyclethon. Cycling 1200km across Japan live everyday on twitch!",
//     "cause_id": "dd2bee7a-4297-4b97-8626-e58b5d72da60",
//     "user_id": "42e524f3-4626-485a-8399-54f773e360c4",
//     "campaign_id": null,
//     "fundraising_event_id": null,
//     "team_campaign_id": null,
//     "supporting_type": "none",
//     "inserted_at": "2026-03-22T15:24:34Z",
//     "updated_at": "2026-03-22T15:27:52Z",
//     "published_at": "2026-03-22T15:27:52Z",
//     "retired_at": null,
//     "original_goal": { "value": "50000", "currency": "USD" },
//     "goal": { "value": "50000", "currency": "USD" },
//     "amount_raised": { "value": "1661.70", "currency": "USD" },
//     "total_amount_raised": { "value": "1661.70", "currency": "USD" },
//     "donate_url": "https://donate.tiltify.com/@cdawgva/cyclethon-5",
//     "livestream": { "type": "twitch", "channel": "cdawgva" },
//     "has_schedule": false,
//     "parent_facts": [
//       { "id": "fc7118e4-9066-40dc-b868-ce5c3b4bb7f4", "name": "Immune Deficiency Foundation", "usage_type": "cause" }
//     ],
//     "legacy_id": 620763
//   }
// }

import { CYCLETHON_5_CAMPAIGN_ID } from './constants';
import { setup } from './setup';

(async () => {
  try {
    const client = await setup();

    const { data, error } = await client.GET('/api/public/campaigns/{campaign_id}', {
      params: { path: { campaign_id: CYCLETHON_5_CAMPAIGN_ID } },
    });

    if (error) {
      throw new Error(`API error: ${JSON.stringify(error)}`);
    }

    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
