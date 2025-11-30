/**
 * Authentication Service
 *
 * Handles Auth0 authentication for JustDeen
 * Integrates with Cloudflare D1 API for user management
 */
import Auth0 from "react-native-auth0"
import { AUTH0_DOMAIN, AUTH0_CLIENT_ID } from "@env"
import { d1Api } from "../cloudflare/d1Api"

/**
 * Initialize Auth0 client
 */
const AUTH0_CONFIG = {
  domain: AUTH0_DOMAIN || "justdeen.au.auth0.com",
  clientId: AUTH0_CLIENT_ID || "EEb2Paneq7GTvU04LYLrJ7ge6KZV77LW",
}

/**
 * Auth0 API Audience (for JustDeen API)
 * This tells Auth0 which API the token is intended for
 * Using the same audience as the web app ensures users can access
 * their chat history across mobile and web platforms
 * Must match VITE_AUTH0_AUDIENCE in cloudflare-rag/frontend/.env.production
 */
const AUTH0_AUDIENCE = "https://chat-justdeen-api"

// Validate configuration
if (!AUTH0_CONFIG.domain || !AUTH0_CONFIG.clientId) {
  console.error("Auth0 Configuration Error:", {
    domain: AUTH0_CONFIG.domain,
    clientId: AUTH0_CONFIG.clientId ? "SET" : "MISSING",
  })
}

const auth0 = new Auth0(AUTH0_CONFIG)

/**
 * User data structure
 */
export interface JustDeenUser {
  id: string
  email: string | null
  displayName: string | null
  photoUrl: string | null
  authProvider: "auth0" | "anonymous"
  accessToken: string
  idToken: string
  refreshToken?: string
  expiresAt?: number
  createdAt: Date
}

/**
 * Authentication result
 */
export interface AuthResult {
  success: boolean
  user?: JustDeenUser
  error?: string
}

/**
 * Sign in with Auth0 (Universal Login)
 * Supports Google, Apple, Email/Password via Auth0
 */
export const signInWithAuth0 = async (): Promise<AuthResult> => {
  try {
    console.log('🔐 Starting Auth0 sign-in with audience:', AUTH0_AUDIENCE)

    // Perform Auth0 authentication using Universal Login
    // prompt: 'login' forces the login screen to appear even if user has an active session
    // offline_access scope is required to get a refresh token
    //
    // IMPORTANT: The 'audience' parameter MUST be included to get JWT tokens
    // instead of opaque tokens. Without it, the Cloudflare Worker will reject the token.
    //
    // PREREQUISITES (in Auth0 Dashboard):
    // 1. Go to Applications → Your Mobile App (EEb2Paneq7GTvU04LYLrJ7ge6KZV77LW)
    // 2. Click "APIs" tab
    // 3. Authorize "Chat.JustDeen" API (https://chat-justdeen-api)
    const credentials = await auth0.webAuth.authorize({
      scope: "openid profile email offline_access",
      audience: AUTH0_AUDIENCE, // REQUIRED for JWT tokens
      prompt: "login", // Force login screen to show all options
    })

    console.log('✅ Auth0 credentials received:', {
      hasAccessToken: !!credentials.accessToken,
      hasIdToken: !!credentials.idToken,
      hasRefreshToken: !!credentials.refreshToken,
      expiresIn: credentials.expiresIn
    })

    if (!credentials.accessToken || !credentials.idToken) {
      return {
        success: false,
        error: "Failed to get Auth0 credentials",
      }
    }

    // Get user info from Auth0
    const userInfo = await auth0.auth.userInfo({
      token: credentials.accessToken,
    })

    // Sign in to backend API with Auth0 token
    // TODO: Fix backend connection when running on physical device
    let userId = userInfo.sub || `auth0_${Date.now()}`

    try {
      const backendResponse = await d1Api.signIn(credentials.idToken, "auth0")
      if (backendResponse) {
        userId = backendResponse.userId
      }
    } catch (error) {
      console.warn("Backend API connection failed (using mock user ID):", error)
      // Continue with Auth0 user ID even if backend fails
    }

    // Calculate token expiration time (typically 24 hours from now)
    // Auth0 tokens are typically valid for 24 hours
    const expiresAt = Date.now() + (credentials.expiresIn || 86400) * 1000

    // Create JustDeen user object
    const user: JustDeenUser = {
      id: userId,
      email: userInfo.email || null,
      displayName: userInfo.name || null,
      photoUrl: userInfo.picture || null,
      authProvider: "auth0",
      accessToken: credentials.accessToken,
      idToken: credentials.idToken,
      refreshToken: credentials.refreshToken,
      expiresAt,
      createdAt: new Date(),
    }

    return {
      success: true,
      user,
    }
  } catch (error: any) {
    console.error("Auth0 Sign-In Error:", error)

    let errorMessage = "Sign-in failed"

    if (error.error === "a0.session.user_cancelled") {
      errorMessage = "Sign-in cancelled"
    } else if (error.error === "login_required") {
      errorMessage = "Login required"
    } else if (error.message) {
      errorMessage = error.message
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Sign in anonymously (no authentication required)
 * Creates a persistent guest user that will be remembered on subsequent app launches
 */
export const signInAnonymously = async (
  existingGuestId?: string,
): Promise<AuthResult> => {
  try {
    // Use existing guest ID if provided, otherwise generate a new one
    // This ensures the same guest user persists across app sessions
    const anonymousId =
      existingGuestId || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const mockToken = `guest_token_${Date.now()}`

    // Try to sign in to backend API (but allow fallback if it fails)
    // Backend is optional - guest users work fully offline
    let userId = anonymousId
    let token = mockToken

    try {
      const backendResponse = await d1Api.signInAnonymous()

      if (backendResponse) {
        userId = backendResponse.userId
        token = backendResponse.token
      }
    } catch (error) {
      console.warn("Backend API connection failed (using offline guest account):", error)
      // Continue with offline credentials - guest users don't require backend
    }

    // Create JustDeen user object
    const user: JustDeenUser = {
      id: userId,
      email: null,
      displayName: "Guest User",
      photoUrl: null,
      authProvider: "anonymous",
      accessToken: token,
      idToken: token,
      createdAt: new Date(),
    }

    return {
      success: true,
      user,
    }
  } catch (error: any) {
    console.error("Anonymous Sign-In Error:", error)

    return {
      success: false,
      error: "Failed to sign in anonymously",
    }
  }
}

/**
 * Refresh Auth0 access token using refresh token
 */
export const refreshAuthToken = async (refreshToken: string): Promise<AuthResult> => {
  try {
    console.log('🔄 Refreshing token...')

    // Use Auth0's refresh token to get new access token
    const credentials = await auth0.auth.refreshToken({
      refreshToken,
      // NOTE: scope is optional but helps ensure we get the same scopes
      scope: "openid profile email offline_access",
    })

    console.log('🔍 Refresh credentials received:', {
      hasAccessToken: !!credentials.accessToken,
      hasIdToken: !!credentials.idToken,
      hasRefreshToken: !!credentials.refreshToken,
      expiresIn: credentials.expiresIn,
      accessTokenStart: credentials.accessToken?.substring(0, 30)
    })

    if (!credentials.accessToken || !credentials.idToken) {
      return {
        success: false,
        error: "Failed to refresh token",
      }
    }

    // Debug: Try to decode the token to see if it's a JWT or opaque token
    try {
      const tokenParts = credentials.accessToken.split('.')
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')))
        console.log('🔍 Refreshed Token - Audience:', payload.aud)
        console.log('🔍 Refreshed Token - Expiry:', new Date(payload.exp * 1000).toISOString())
      } else {
        console.warn('⚠️ Refreshed token is NOT a JWT (opaque token). This will not work with the API.')
        console.warn('⚠️ Token format:', credentials.accessToken.substring(0, 50))
      }
    } catch (e) {
      console.warn('⚠️ Could not decode refreshed token:', e)
    }

    // Get updated user info
    const userInfo = await auth0.auth.userInfo({
      token: credentials.accessToken,
    })

    // Calculate new expiration time
    const expiresAt = Date.now() + (credentials.expiresIn || 86400) * 1000

    // Create updated user object
    const user: JustDeenUser = {
      id: userInfo.sub || `auth0_${Date.now()}`,
      email: userInfo.email || null,
      displayName: userInfo.name || null,
      photoUrl: userInfo.picture || null,
      authProvider: "auth0",
      accessToken: credentials.accessToken,
      idToken: credentials.idToken,
      refreshToken: credentials.refreshToken || refreshToken,
      expiresAt,
      createdAt: new Date(),
    }

    return {
      success: true,
      user,
    }
  } catch (error: any) {
    // Silently fail - user will be redirected to login
    return {
      success: false,
      error: "Token refresh failed. Please log in again.",
    }
  }
}

/**
 * Check if token is expired or will expire soon (within 5 minutes)
 */
export const isTokenExpired = (expiresAt?: number): boolean => {
  if (!expiresAt) return true
  const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000
  return expiresAt < fiveMinutesFromNow
}

/**
 * Sign out the current user
 */
export const signOut = async (authProvider: "auth0" | "anonymous") => {
  try {
    // Sign out from Auth0 if needed
    if (authProvider === "auth0") {
      await auth0.webAuth.clearSession()
    }
    // Anonymous doesn't require sign-out

    return { success: true }
  } catch (error) {
    console.error("Sign-Out Error:", error)
    return { success: false, error: "Sign-out failed" }
  }
}
