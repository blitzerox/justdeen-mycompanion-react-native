/**
 * Quran Foundation API - OAuth2 Authentication
 * Manages access tokens with automatic refresh
 */

import { getDatabase } from './database'
import { encode as btoa } from 'base-64'
import Constants from 'expo-constants'

interface TokenResponse {
  access_token: string
  token_type: 'bearer'
  expires_in: number
  scope: string
}

// Get environment configuration
const env = Constants.expoConfig?.extra?.env || process.env.QURAN_API_ENV || 'PROD'
const isProd = env === 'PROD'

export const QURAN_API_CONFIG = {
  clientId: isProd
    ? (Constants.expoConfig?.extra?.QURAN_API_PROD_CLIENT_ID || process.env.QURAN_API_PROD_CLIENT_ID)
    : (Constants.expoConfig?.extra?.QURAN_API_PREPROD_CLIENT_ID || process.env.QURAN_API_PREPROD_CLIENT_ID),
  clientSecret: isProd
    ? (Constants.expoConfig?.extra?.QURAN_API_PROD_CLIENT_SECRET || process.env.QURAN_API_PROD_CLIENT_SECRET)
    : (Constants.expoConfig?.extra?.QURAN_API_PREPROD_CLIENT_SECRET || process.env.QURAN_API_PREPROD_CLIENT_SECRET),
  oauthUrl: isProd
    ? (Constants.expoConfig?.extra?.QURAN_API_PROD_OAUTH_URL || process.env.QURAN_API_PROD_OAUTH_URL || 'https://oauth2.quran.foundation/oauth2/token')
    : (Constants.expoConfig?.extra?.QURAN_API_PREPROD_OAUTH_URL || process.env.QURAN_API_PREPROD_OAUTH_URL || 'https://prelive-oauth2.quran.foundation/oauth2/token'),
  baseUrl: isProd
    ? (Constants.expoConfig?.extra?.QURAN_API_PROD_BASE_URL || process.env.QURAN_API_PROD_BASE_URL || 'https://apis.quran.foundation/content/api/v4')
    : (Constants.expoConfig?.extra?.QURAN_API_PREPROD_BASE_URL || process.env.QURAN_API_PREPROD_BASE_URL || 'https://apis-prelive.quran.foundation/content/api/v4'),
  scope: 'content',
}

console.log('🔧 Quran API Config:', {
  env: isProd ? 'PRODUCTION' : 'PRE-PRODUCTION',
  oauthUrl: QURAN_API_CONFIG.oauthUrl,
  baseUrl: QURAN_API_CONFIG.baseUrl,
  clientId: QURAN_API_CONFIG.clientId,
})

/**
 * Get a valid Quran API access token
 * Automatically manages caching and refresh
 */
export async function getQuranAccessToken(forceFresh = false): Promise<string> {
  const db = await getDatabase()

  // Check for valid cached token
  if (!forceFresh) {
    const cached = await db.getFirstAsync<{
      access_token: string
      expires_at: string
    }>(
      'SELECT access_token, expires_at FROM quran_access_tokens ORDER BY created_at DESC LIMIT 1'
    )

    if (cached) {
      const now = new Date()
      const expiresAt = new Date(cached.expires_at)
      console.log('🔍 Current time:', now.toISOString())
      console.log('🔍 Token expires at:', expiresAt.toISOString())
      console.log('🔍 Token is valid:', expiresAt > now)

      if (expiresAt > now) {
        console.log('✅ Using cached Quran API token')
        return cached.access_token
      } else {
        console.log('⚠️ Cached token is expired, fetching new one')
      }
    }
  } else {
    console.log('🔄 Force fetching fresh token (ignoring cache)')
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

  console.log('🔍 Token response:', JSON.stringify(data, null, 2))
  console.log('🔍 Expires in seconds:', data.expires_in)

  // Calculate expiry (59 minutes to be safe)
  const expiresAt = new Date(Date.now() + (data.expires_in - 60) * 1000).toISOString()

  console.log('🔍 Calculated expiry:', expiresAt)
  console.log('🔍 Current time:', new Date().toISOString())

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
export async function makeQuranAPIRequest<T>(
  endpoint: string,
  retryCount = 0
): Promise<T> {
  const token = await getQuranAccessToken(retryCount > 0)

  console.log('🔍 Making API request to:', `${QURAN_API_CONFIG.baseUrl}${endpoint}`)
  console.log('🔍 Using client ID:', QURAN_API_CONFIG.clientId)

  const response = await fetch(`${QURAN_API_CONFIG.baseUrl}${endpoint}`, {
    headers: {
      'x-auth-token': token,
      'x-client-id': QURAN_API_CONFIG.clientId,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ API Response Status:', response.status)
    console.error('❌ API Response:', errorText)

    // If token is expired and we haven't retried yet, get a fresh token and retry
    if (response.status === 403 && errorText.includes('expired') && retryCount === 0) {
      console.log('🔄 Token rejected as expired, fetching fresh token and retrying...')
      return makeQuranAPIRequest(endpoint, retryCount + 1)
    }

    throw new Error(`API request failed: ${response.statusText} - ${errorText}`)
  }

  return response.json()
}
