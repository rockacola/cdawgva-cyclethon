// Example response:
// {
//   "data": {
//     "id": "42e524f3-4626-485a-8399-54f773e360c4",
//     "description": "Welsh Voice Actor & YouTuber",
//     "url": "/@cdawgva",
//     "username": "cdawgva",
//     "slug": "cdawgva",
//     "avatar": {
//       "width": 200,
//       "alt": "alt",
//       "src": "https://assets.tiltify.com/uploads/user/thumbnail/238222/blob-e85d70c0-1f0b-4f9e-9772-6f4c06c34cd8.jpeg",
//       "height": 200
//     },
//     "social": {
//       "twitch": null,
//       "twitter": null,
//       "facebook": null,
//       "discord": null,
//       "website": null,
//       "snapchat": null,
//       "instagram": null,
//       "youtube": null,
//       "tiktok": null
//     },
//     "total_amount_raised": {
//       "value": "3864767.61",
//       "currency": "USD"
//     },
//     "legacy_id": 238222
//   }
// }

import { setup } from './setup';

const SLUG = 'cdawgva';

(async () => {
  try {
    const client = await setup();

    const { data, error } = await client.GET('/api/public/users/by/slug/{slug}', {
      params: { path: { slug: SLUG } },
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
