import createClient from 'openapi-fetch';

import { TILTIFY_API_BASE_URL } from './constants';
import type { paths } from './types/api';

// Creates a typed API client pre-configured with a Bearer token.
// All request/response shapes are inferred from the generated OpenAPI types.
export function createApiClient(accessToken: string) {
  return createClient<paths>({
    baseUrl: TILTIFY_API_BASE_URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
