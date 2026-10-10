// Usage: npm run get-user-campaigns -- <user_id>

import { setup } from './lib/setup.ts';

const userId = process.argv[2];

if (!userId) {
  console.error('Usage: npm run get-user-campaigns -- <user_id>');
  process.exit(1);
}

try {
  const client = await setup();

  const { data, error } = await client.GET('/api/public/users/{user_id}/campaigns', {
    params: { path: { user_id: userId } },
  });

  if (error) {
    throw new Error(`API error: ${JSON.stringify(error)}`);
  }

  console.log(JSON.stringify(data, null, 2));
} catch (err) {
  console.error('Error:', err);
  process.exit(1);
}
