export const CDAWGVA_SLUG = 'cdawgva';
export const CDAWGVA_USER_ID = '42e524f3-4626-485a-8399-54f773e360c4';

export interface LiveWindow {
  start: string; // inclusive, JST, YYYY-MM-DD
  end: string; // inclusive, JST, YYYY-MM-DD
}

export interface DonationEvent {
  key: string; // canonical storage key, e.g. 'cyclethon-5' — ours to define, decoupled from Tiltify's slug
  name: string;
  slug: string; // Tiltify's actual campaign slug — human lookup / exploration scripts only, not a storage key
  campaignId: string;
  status: 'archived' | 'live';
  liveWindow?: LiveWindow; // present only while status === 'live'
}

// Every CDawgVA donation event tracked by this pipeline, from `npm run get-user-campaigns -- <CDAWGVA_USER_ID>`.
export const EVENTS: DonationEvent[] = [
  {
    key: 'cyclethon-1',
    name: "Connor's 500 mile Cyclethon",
    slug: 'connors-500-mile-cyclethon',
    campaignId: '5bd3736c-7c2d-4327-b45e-b2ddb324e4d3',
    status: 'archived',
  },
  {
    key: 'cyclethon-2',
    name: "Connor's Cyclethon 2",
    slug: 'connors-cyclethon-2',
    campaignId: '25762a63-161d-4bf2-8765-e4817237982a',
    status: 'archived',
  },
  {
    key: 'cyclethon-3',
    name: 'CDawgVA Cyclethon 3',
    slug: 'cdawgva-cyclethon-3',
    campaignId: '0d071a79-a64d-4c54-bbd0-3b2bd64ca24f',
    status: 'archived',
  },
  {
    key: 'cyclethon-4',
    name: 'CDawgVA Cyclethon 4',
    slug: 'cdawgva-cyclethon-4',
    campaignId: 'ce11e184-6f7a-421d-836a-bda6e40100cc',
    status: 'archived',
  },
  {
    key: 'cyclethon-5',
    name: 'Cyclethon 5',
    slug: 'cyclethon-5',
    campaignId: '69c5aa70-54cf-42a9-8754-d4d60ec28da0',
    status: 'archived',
  },
];

// The event the live pipeline (fetch-donations.ts) currently tracks. null means no event is live.
export const CURRENT_LIVE_EVENT_KEY: string | null = null;

export function getEvent(key: string): DonationEvent {
  const event = EVENTS.find((e) => e.key === key);

  if (!event) {
    throw new Error(
      `Unknown event key "${key}". Known keys: ${EVENTS.map((e) => e.key).join(', ')}`,
    );
  }

  return event;
}
