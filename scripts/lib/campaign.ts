export const CDAWGVA_SLUG = 'cdawgva';
export const CDAWGVA_USER_ID = '42e524f3-4626-485a-8399-54f773e360c4';
export const CYCLETHON_5_SLUG = 'cyclethon-5';
export const CYCLETHON_5_CAMPAIGN_ID = '69c5aa70-54cf-42a9-8754-d4d60ec28da0';

export const EVENT_START = '2026-04-05'; // inclusive, JST
export const EVENT_END = '2026-04-19'; // inclusive, JST

export interface CyclethonCampaign {
  number: number;
  name: string;
  slug: string;
  campaignId: string;
  status: 'published' | 'retired';
}

// Every CDawgVA Cyclethon campaign to date, from `npm run get-user-campaigns -- <CDAWGVA_USER_ID>`.
// Cyclethon 5 is the one the pipeline currently tracks (see CYCLETHON_5_* above); the rest are historical.
export const CYCLETHON_CAMPAIGNS: CyclethonCampaign[] = [
  {
    number: 1,
    name: "Connor's 500 mile Cyclethon",
    slug: 'connors-500-mile-cyclethon',
    campaignId: '5bd3736c-7c2d-4327-b45e-b2ddb324e4d3',
    status: 'retired',
  },
  {
    number: 2,
    name: "Connor's Cyclethon 2",
    slug: 'connors-cyclethon-2',
    campaignId: '25762a63-161d-4bf2-8765-e4817237982a',
    status: 'retired',
  },
  {
    number: 3,
    name: 'CDawgVA Cyclethon 3',
    slug: 'cdawgva-cyclethon-3',
    campaignId: '0d071a79-a64d-4c54-bbd0-3b2bd64ca24f',
    status: 'retired',
  },
  {
    number: 4,
    name: 'CDawgVA Cyclethon 4',
    slug: 'cdawgva-cyclethon-4',
    campaignId: 'ce11e184-6f7a-421d-836a-bda6e40100cc',
    status: 'retired',
  },
  {
    number: 5,
    name: 'Cyclethon 5',
    slug: CYCLETHON_5_SLUG,
    campaignId: CYCLETHON_5_CAMPAIGN_ID,
    status: 'published',
  },
];
