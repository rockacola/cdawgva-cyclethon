// Example response:
// {
//   id: '69c5aa70-54cf-42a9-8754-d4d60ec28da0',
//   name: 'Cyclethon 5',
//   status: 'published',
//   user: {
//     id: '42e524f3-4626-485a-8399-54f773e360c4',
//     description: 'Welsh Voice Actor & YouTuber',
//     url: '/@cdawgva',
//     username: 'cdawgva',
//     slug: 'cdawgva',
//     avatar: {
//       width: 200,
//       alt: 'alt',
//       src: 'https://assets.tiltify.com/uploads/user/thumbnail/238222/blob-e85d70c0-1f0b-4f9e-9772-6f4c06c34cd8.jpeg',
//       height: 200
//     },
//     social: {
//       twitch: null,
//       twitter: null,
//       facebook: null,
//       discord: null,
//       website: null,
//       snapchat: null,
//       instagram: null,
//       youtube: null,
//       tiktok: null
//     },
//     total_amount_raised: { value: '4019147.00', currency: 'USD' },
//     legacy_id: 238222
//   },
//   description: "I'm fundraising for Immune Deficiency Foundation. In my 5th annual cyclethon. Cycling 1200km across Japan live everyday on twitch!",
//   url: '/@cdawgva/cyclethon-5',
//   cause_id: 'dd2bee7a-4297-4b97-8626-e58b5d72da60',
//   inserted_at: '2026-03-22T15:24:34Z',
//   updated_at: '2026-04-05T15:00:59Z',
//   user_id: '42e524f3-4626-485a-8399-54f773e360c4',
//   slug: 'cyclethon-5',
//   campaign_id: null,
//   avatar: {
//     width: 64,
//     alt: 'alt',
//     src: 'https://assets.tiltify.com/uploads/user/thumbnail/238222/blob-e85d70c0-1f0b-4f9e-9772-6f4c06c34cd8.jpeg',
//     height: 64
//   },
//   fundraising_event_id: null,
//   supporting_type: 'none',
//   retired_at: null,
//   published_at: '2026-03-22T15:27:52Z',
//   parent_facts: [
//     {
//       id: 'fc7118e4-9066-40dc-b868-ce5c3b4bb7f4',
//       name: 'Immune Deficiency Foundation',
//       usage_type: 'cause'
//     }
//   ],
//   original_goal: { value: '50000', currency: 'USD' },
//   goal: { value: '150000', currency: 'USD' },
//   amount_raised: { value: '156041.09', currency: 'USD' },
//   total_amount_raised: { value: '156041.09', currency: 'USD' },
//   livestream: { type: 'twitch', channel: 'cdawgva' },
//   legacy_id: 620763,
//   donate_url: 'https://donate.tiltify.com/@cdawgva/cyclethon-5',
//   has_schedule: false,
//   team_campaign_id: null
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

    const campaign = data?.data;

    if (!campaign) {
      throw new Error('No campaign data returned');
    }

    console.log('campaign:', campaign);

    // const amountRaised = campaign.amount_raised;
    // const goal = campaign.goal;

    // console.log('Campaign:', campaign.name);
    // console.log('Amount Raised:', `${amountRaised?.currency} ${amountRaised?.value}`);
    // console.log('Current Goal:', `${goal?.currency} ${goal?.value}`);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
