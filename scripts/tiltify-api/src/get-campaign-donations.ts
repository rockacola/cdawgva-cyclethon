// Example response:
// {
//   "data": [
//     {
//       "id": "aaa997f4-6bfc-4049-9812-89475624c6fb",
//       "campaign_id": "69c5aa70-54cf-42a9-8754-d4d60ec28da0",
//       "cause_id": "dd2bee7a-4297-4b97-8626-e58b5d72da60",
//       "donor_name": "Dustin M.",
//       "donor_comment": null,
//       "amount": { "value": "25.00", "currency": "USD" },
//       "is_match": false,
//       "sustained": false,
//       "created_at": "2026-04-02T01:17:40Z",
//       "completed_at": "2026-04-02T01:18:23.352636Z",
//       "reward_id": null,
//       "poll_id": null,
//       "poll_option_id": null,
//       "target_id": null,
//       "fundraising_event_id": null,
//       "team_event_id": null,
//       "donation_matches": null,
//       "reward_claims": null,
//       "legacy_id": 10546586,
//       "facts": [
//         { "id": "fc7118e4-9066-40dc-b868-ce5c3b4bb7f4", "name": "Immune Deficiency Foundation", "usage_type": "cause" },
//         { "id": "69c5aa70-54cf-42a9-8754-d4d60ec28da0", "name": "Cyclethon 5", "usage_type": "campaign" }
//       ]
//     },
//     {
//       "id": "43362929-531c-4a60-9f5c-e7e2198a7ae5",
//       "campaign_id": "69c5aa70-54cf-42a9-8754-d4d60ec28da0",
//       "cause_id": "dd2bee7a-4297-4b97-8626-e58b5d72da60",
//       "donor_name": "Robin Turner",
//       "donor_comment": "Good luck on this fifth Cyclethon!",
//       "amount": { "value": "100.00", "currency": "USD" },
//       "is_match": false,
//       "sustained": false,
//       "created_at": "2026-03-29T06:46:23Z",
//       "completed_at": "2026-03-29T06:47:20.972069Z",
//       "reward_id": null,
//       "poll_id": null,
//       "poll_option_id": null,
//       "target_id": null,
//       "fundraising_event_id": null,
//       "team_event_id": null,
//       "donation_matches": null,
//       "reward_claims": null,
//       "legacy_id": 10541190,
//       "facts": [
//         { "id": "fc7118e4-9066-40dc-b868-ce5c3b4bb7f4", "name": "Immune Deficiency Foundation", "usage_type": "cause" },
//         { "id": "69c5aa70-54cf-42a9-8754-d4d60ec28da0", "name": "Cyclethon 5", "usage_type": "campaign" }
//       ]
//     },
//     {
//       "id": "5b8a1aa6-25ad-402c-9bac-0055f0e2a0ee",
//       "campaign_id": "69c5aa70-54cf-42a9-8754-d4d60ec28da0",
//       "cause_id": "dd2bee7a-4297-4b97-8626-e58b5d72da60",
//       "donor_name": "Ecostacey",
//       "donor_comment": "Does your car have a name? My ex named all of his cars",
//       "amount": { "value": "5.00", "currency": "USD" },
//       "is_match": false,
//       "sustained": false,
//       "created_at": "2026-03-28T07:08:16Z",
//       "completed_at": "2026-03-28T07:08:34.837062Z",
//       "reward_id": null,
//       "poll_id": null,
//       "poll_option_id": null,
//       "target_id": null,
//       "fundraising_event_id": null,
//       "team_event_id": null,
//       "donation_matches": null,
//       "reward_claims": null,
//       "legacy_id": 10539098,
//       "facts": [
//         { "id": "fc7118e4-9066-40dc-b868-ce5c3b4bb7f4", "name": "Immune Deficiency Foundation", "usage_type": "cause" },
//         { "id": "69c5aa70-54cf-42a9-8754-d4d60ec28da0", "name": "Cyclethon 5", "usage_type": "campaign" }
//       ]
//     },
//     {
//       "id": "550f2340-57d0-4f6c-accb-7a6080d34772",
//       "campaign_id": "69c5aa70-54cf-42a9-8754-d4d60ec28da0",
//       "cause_id": "dd2bee7a-4297-4b97-8626-e58b5d72da60",
//       "donor_name": "Anonymous",
//       "donor_comment": "There is no greater gift then spamming TTS but this TTS voice can't even do UU? RR? correctly. I am sadge",
//       "amount": { "value": "1.00", "currency": "USD" },
//       "is_match": false,
//       "sustained": false,
//       "created_at": "2026-03-28T07:13:20Z",
//       "completed_at": "2026-03-28T07:14:02.599518Z",
//       "reward_id": null,
//       "poll_id": null,
//       "poll_option_id": null,
//       "target_id": null,
//       "fundraising_event_id": null,
//       "team_event_id": null,
//       "donation_matches": null,
//       "reward_claims": null,
//       "legacy_id": 10539101,
//       "facts": [
//         { "id": "fc7118e4-9066-40dc-b868-ce5c3b4bb7f4", "name": "Immune Deficiency Foundation", "usage_type": "cause" },
//         { "id": "69c5aa70-54cf-42a9-8754-d4d60ec28da0", "name": "Cyclethon 5", "usage_type": "campaign" }
//       ]
//     }
//   ],
//   "metadata": {
//     "after": "g2wAAAABdAAAAA13C21p...",  // cursor for next page
//     "before": null,
//     "limit": 10
//   }
// }

import { CYCLETHON_5_CAMPAIGN_ID } from './constants';
import { setup } from './setup';

const LIMIT = 100;

(async () => {
  try {
    const client = await setup();

    const { data, error } = await client.GET('/api/public/campaigns/{campaign_id}/donations', {
      params: {
        path: { campaign_id: CYCLETHON_5_CAMPAIGN_ID },
        query: { limit: LIMIT },
      },
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
