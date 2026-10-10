// Usage: npm run get-user-by-slug -- <slug>

import { setup } from './lib/setup.ts';

const slug = process.argv[2];

if (!slug) {
  console.error('Usage: npm run get-user-by-slug -- <slug>');
  process.exit(1);
}

try {
  const client = await setup();

  const { data, error } = await client.GET('/api/public/users/by/slug/{slug}', {
    params: { path: { slug } },
  });

  if (error) {
    throw new Error(`API error: ${JSON.stringify(error)}`);
  }

  console.log(JSON.stringify(data, null, 2));
} catch (err) {
  console.error('Error:', err);
  process.exit(1);
}
