import 'dotenv/config';

import { getAccessToken } from './auth';
import { createApiClient } from './client';

// Shared bootstrap: loads env, obtains access token, returns a typed API client.
// Call this at the top of every script.
export async function setup() {
  const clientId = process.env.TILTIFY_CLIENT_ID;
  const clientSecret = process.env.TILTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('TILTIFY_CLIENT_ID and TILTIFY_CLIENT_SECRET must be set in .env');
  }

  console.log('Fetching access token...');
  const { access_token, expires_in } = await getAccessToken(clientId, clientSecret);
  console.log(`Access token obtained (expires in ${expires_in}s).`);

  return createApiClient(access_token);
}
