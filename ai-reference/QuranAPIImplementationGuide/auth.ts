// lib/quran-api/auth.ts
// OAuth2 Client Credentials Authentication for Quran Foundation API

interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  scope: string;
}

interface QuranAPIConfig {
  clientId: string;
  clientSecret: string;
  oauthUrl: string;
  baseUrl: string;
  scope: string;
}

export const QURAN_API_CONFIG: QuranAPIConfig = {
  clientId: 'f0a9dc38-2ba0-4386-9dbc-00ce81a197db',
  clientSecret: 'miilaATs0vtm5WD1NN8alt3OGz',
  oauthUrl: 'https://oauth2.quran.foundation/oauth2/token',
  baseUrl: 'https://apis-prelive.quran.foundation/content/api/v4',
  scope: 'content',
};

/**
 * Get a valid Quran API access token
 * Automatically manages caching in D1 database
 * Tokens are valid for 1 hour, cached for 59 minutes
 */
export async function getQuranAccessToken(db: D1Database): Promise<string> {
  // Check for valid cached token
  const cached = await db
    .prepare(
      'SELECT access_token, expires_at FROM quran_access_tokens ORDER BY created_at DESC LIMIT 1'
    )
    .first<{ access_token: string; expires_at: string }>();

  if (cached && new Date(cached.expires_at) > new Date()) {
    console.log('✅ Using cached Quran API token');
    return cached.access_token;
  }

  // Fetch new token
  console.log('🔄 Fetching new Quran API token...');

  const credentials = Buffer.from(
    `${QURAN_API_CONFIG.clientId}:${QURAN_API_CONFIG.clientSecret}`
  ).toString('base64');

  const response = await fetch(QURAN_API_CONFIG.oauthUrl, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=content',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get access token: ${response.statusText} - ${errorText}`);
  }

  const data: TokenResponse = await response.json();

  // Calculate expiry (59 minutes to be safe, avoid edge cases)
  const expiresAt = new Date(Date.now() + (data.expires_in - 60) * 1000);

  // Store in cache
  await db
    .prepare('INSERT INTO quran_access_tokens (access_token, expires_at) VALUES (?, ?)')
    .bind(data.access_token, expiresAt.toISOString())
    .run();

  // Clean up old tokens
  await db
    .prepare('DELETE FROM quran_access_tokens WHERE expires_at < datetime("now")')
    .run();

  console.log('✅ New token cached, expires at:', expiresAt.toISOString());
  return data.access_token;
}

/**
 * Make an authenticated request to the Quran API
 */
export async function makeQuranAPIRequest<T>(
  db: D1Database,
  endpoint: string
): Promise<T> {
  const token = await getQuranAccessToken(db);

  const response = await fetch(`${QURAN_API_CONFIG.baseUrl}${endpoint}`, {
    headers: {
      'x-auth-token': token,
      'x-client-id': QURAN_API_CONFIG.clientId,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}
