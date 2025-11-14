/**
 * Quran Foundation API - OAuth2 Authentication
 * Manages access tokens with automatic refresh
 */

import { getDatabase } from './database'
import { encode as btoa } from 'base-64'

interface TokenResponse {
  access_token: string
  token_type: 'bearer'
  expires_in: number
  scope: string
}

export const QURAN_API_CONFIG = {
  clientId: 'f0a9dc38-2ba0-4386-9dbc-00ce81a197db',
  clientSecret: 'miilaATs0vtm5WD1NN8alt3OGz',
  oauthUrl: 'https://oauth2.quran.foundation/oauth2/token',
  baseUrl: 'https://apis-prelive.quran.foundation/content/api/v4',
  scope: 'content',
}

/**
 * Get a valid Quran API access token
 * Automatically manages caching and refresh
 */
export async function getQuranAccessToken(): Promise<string> {
  const db = await getDatabase()

  // Check for valid cached token
  const cached = await db.getFirstAsync<{
    access_token: string
    expires_at: string
  }>(
    'SELECT access_token, expires_at FROM quran_access_tokens ORDER BY created_at DESC LIMIT 1'
  )

  if (cached && new Date(cached.expires_at) > new Date()) {
    console.log('✅ Using cached Quran API token')
    return cached.access_token
  }

  // Fetch new token
  console.log('🔄 Fetching new Quran API token...')

  const credentials = btoa(`${QURAN_API_CONFIG.clientId}:${QURAN_API_CONFIG.clientSecret}`)

  const response = await fetch(QURAN_API_CONFIG.oauthUrl, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=content',
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to get access token: ${response.statusText} - ${errorText}`)
  }

  const data: TokenResponse = await response.json()

  // Calculate expiry (59 minutes to be safe)
  const expiresAt = new Date(Date.now() + (data.expires_in - 60) * 1000).toISOString()

  // Store in cache
  await db.runAsync(
    'INSERT INTO quran_access_tokens (access_token, expires_at) VALUES (?, ?)',
    data.access_token,
    expiresAt
  )

  // Clean up old tokens
  await db.runAsync('DELETE FROM quran_access_tokens WHERE expires_at < datetime("now")')

  console.log('✅ New token cached, expires at:', expiresAt)
  return data.access_token
}

/**
 * Make an authenticated request to the Quran API
 */
export async function makeQuranAPIRequest<T>(endpoint: string): Promise<T> {
  const token = await getQuranAccessToken()

  const response = await fetch(`${QURAN_API_CONFIG.baseUrl}${endpoint}`, {
    headers: {
      'x-auth-token': token,
      'x-client-id': QURAN_API_CONFIG.clientId,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API request failed: ${response.statusText} - ${errorText}`)
  }

  return response.json()
}
