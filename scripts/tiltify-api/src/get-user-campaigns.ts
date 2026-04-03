// Example response:
// {
//   "data": [
//     {
//       "id": "5bd3736c-7c2d-4327-b45e-b2ddb324e4d3",
//       "name": "Connor's 500 mile Cyclethon",
//       "status": "retired",
//       "slug": "connors-500-mile-cyclethon",
//       "url": "/@cdawgva/connors-500-mile-cyclethon",
//       "description": "Cycling the entire length of Hokkaido with Chris (Abroad in Japan) for charity.",
//       "cause_id": "dd2bee7a-4297-4b97-8626-e58b5d72da60",
//       "fundraising_event_id": null,
//       "inserted_at": "2022-08-21T09:03:10Z",
//       "published_at": "2022-08-21T09:03:45Z",
//       "retired_at": "2023-03-14T06:53:24Z",
//       "original_goal": { "value": "25000.00", "currency": "USD" },
//       "goal": { "value": "250000", "currency": "USD" },
//       "amount_raised": { "value": "319857.87", "currency": "USD" },
//       "total_amount_raised": { "value": "319857.87", "currency": "USD" },
//       "donate_url": "https://donate.tiltify.com/@cdawgva/connors-500-mile-cyclethon",
//       "livestream": { "type": "twitch", "channel": "cdawgva" },
//       "parent_facts": [
//         { "id": "fc7118e4-9066-40dc-b868-ce5c3b4bb7f4", "name": "Immune Deficiency Foundation", "usage_type": "cause" }
//       ]
//     },
//     {
//       "id": "69c5aa70-54cf-42a9-8754-d4d60ec28da0",
//       "name": "Cyclethon 5",
//       "status": "published",
//       "slug": "cyclethon-5",
//       "url": "/@cdawgva/cyclethon-5",
//       "description": "Cycling 1200km across Japan live everyday on twitch!",
//       "cause_id": "dd2bee7a-4297-4b97-8626-e58b5d72da60",
//       "fundraising_event_id": null,
//       "inserted_at": "2026-03-22T15:24:34Z",
//       "published_at": "2026-03-22T15:27:52Z",
//       "retired_at": null,
//       "original_goal": { "value": "50000", "currency": "USD" },
//       "goal": { "value": "50000", "currency": "USD" },
//       "amount_raised": { "value": "1661.70", "currency": "USD" },
//       "total_amount_raised": { "value": "1661.70", "currency": "USD" },
//       "donate_url": "https://donate.tiltify.com/@cdawgva/cyclethon-5",
//       "livestream": { "type": "twitch", "channel": "cdawgva" },
//       "parent_facts": [
//         { "id": "fc7118e4-9066-40dc-b868-ce5c3b4bb7f4", "name": "Immune Deficiency Foundation", "usage_type": "cause" }
//       ]
//     }
//   ],
//   "metadata": {
//     "after": null,
//     "before": null,
//     "limit": 10
//   }
// }

import { CDAWGVA_USER_ID } from './constants';
import { setup } from './setup';

(async () => {
  try {
    const client = await setup();

    const { data, error } = await client.GET('/api/public/users/{user_id}/campaigns', {
      params: { path: { user_id: CDAWGVA_USER_ID } },
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
