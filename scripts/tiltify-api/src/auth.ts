import { TILTIFY_TOKEN_URL } from './constants';

export interface AccessToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

// Obtains an application access token via the Client Credentials OAuth flow.
// Tokens expire in 7200 seconds (2 hours) — call this once per session or on 401.
export async function getAccessToken(clientId: string, clientSecret: string): Promise<AccessToken> {
  const response = await fetch(TILTIFY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
      scope: 'public',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<AccessToken>;
}
