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
    // Perform Auth0 authentication using Universal Login
    // prompt: 'login' forces the login screen to appear even if user has an active session
    const credentials = await auth0.webAuth.authorize({
      scope: "openid profile email",
      prompt: "login", // Force login screen to show all options
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

    // Create JustDeen user object
    const user: JustDeenUser = {
      id: userId,
      email: userInfo.email || null,
      displayName: userInfo.name || null,
      photoUrl: userInfo.picture || null,
      authProvider: "auth0",
      accessToken: credentials.accessToken,
      idToken: credentials.idToken,
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
