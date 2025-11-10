/**
 * Authentication Service
 *
 * Handles Google, Apple, and Anonymous sign-in for JustDeen
 * Integrates with Cloudflare D1 API for user management
 */
import {
  GoogleSignin,
  statusCodes,
  type SignInResponse as GoogleSignInResponse,
} from "@react-native-google-signin/google-signin"
import { Platform } from "react-native"
import appleAuth from "@invertase/react-native-apple-authentication"
import { GOOGLE_WEB_CLIENT_ID } from "@env"
import { d1Api } from "../cloudflare/d1Api"

/**
 * User data structure
 */
export interface JustDeenUser {
  id: string
  email: string | null
  displayName: string | null
  photoUrl: string | null
  authProvider: "google" | "apple" | "anonymous"
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
 * Initialize Google Sign-In configuration
 */
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
    forceCodeForRefreshToken: false,
  })
}

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<AuthResult> => {
  try {
    // Check if device supports Google Play Services (Android)
    await GoogleSignin.hasPlayServices()

    // Get user info from Google
    const googleSignInResponse: GoogleSignInResponse = await GoogleSignin.signIn()

    if (!googleSignInResponse.data?.idToken) {
      return {
        success: false,
        error: "Failed to get Google ID token",
      }
    }

    const googleUser = googleSignInResponse.data

    // Sign in to backend API
    const backendResponse = await d1Api.signIn(googleUser.idToken!, "google")

    if (!backendResponse) {
      return {
        success: false,
        error: "Failed to authenticate with backend",
      }
    }

    // Create JustDeen user object
    const user: JustDeenUser = {
      id: backendResponse.userId,
      email: googleUser.user.email,
      displayName: googleUser.user.name || null,
      photoUrl: googleUser.user.photo || null,
      authProvider: "google",
      idToken: googleUser.idToken!,
      createdAt: new Date(),
    }

    return {
      success: true,
      user,
    }
  } catch (error: any) {
    console.error("Google Sign-In Error:", error)

    let errorMessage = "Google sign-in failed"

    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      errorMessage = "Sign-in cancelled"
    } else if (error.code === statusCodes.IN_PROGRESS) {
      errorMessage = "Sign-in already in progress"
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      errorMessage = "Google Play Services not available"
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Sign in with Apple (iOS only)
 */
export const signInWithApple = async (): Promise<AuthResult> => {
  if (Platform.OS !== "ios") {
    return {
      success: false,
      error: "Apple Sign-In is only available on iOS",
    }
  }

  try {
    // Perform Apple sign-in request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    })

    // Get credential state
    const credentialState = await appleAuth.getCredentialStateForUser(
      appleAuthRequestResponse.user,
    )

    if (credentialState !== appleAuth.State.AUTHORIZED) {
      return {
        success: false,
        error: "Apple authorization failed",
      }
    }

    const { identityToken, email, fullName } = appleAuthRequestResponse

    if (!identityToken) {
      return {
        success: false,
        error: "Failed to get Apple identity token",
      }
    }

    // Sign in to backend API
    const backendResponse = await d1Api.signIn(identityToken, "apple")

    if (!backendResponse) {
      return {
        success: false,
        error: "Failed to authenticate with backend",
      }
    }

    // Create display name from fullName
    let displayName: string | null = null
    if (fullName?.givenName && fullName?.familyName) {
      displayName = `${fullName.givenName} ${fullName.familyName}`
    } else if (fullName?.givenName) {
      displayName = fullName.givenName
    }

    // Create JustDeen user object
    const user: JustDeenUser = {
      id: backendResponse.userId,
      email: email || null,
      displayName,
      photoUrl: null, // Apple doesn't provide photos
      authProvider: "apple",
      idToken: identityToken,
      createdAt: new Date(),
    }

    return {
      success: true,
      user,
    }
  } catch (error: any) {
    console.error("Apple Sign-In Error:", error)

    let errorMessage = "Apple sign-in failed"

    if (error.code === appleAuth.Error.CANCELED) {
      errorMessage = "Sign-in cancelled"
    } else if (error.code === appleAuth.Error.FAILED) {
      errorMessage = "Authorization failed"
    } else if (error.code === appleAuth.Error.NOT_HANDLED) {
      errorMessage = "Sign-in not handled"
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Sign in anonymously (no authentication required)
 */
export const signInAnonymously = async (): Promise<AuthResult> => {
  try {
    // Generate anonymous user ID (will be replaced by backend)
    const anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Sign in to backend API
    const backendResponse = await d1Api.signInAnonymous()

    if (!backendResponse) {
      return {
        success: false,
        error: "Failed to create anonymous account",
      }
    }

    // Create JustDeen user object
    const user: JustDeenUser = {
      id: backendResponse.userId,
      email: null,
      displayName: "Guest User",
      photoUrl: null,
      authProvider: "anonymous",
      idToken: backendResponse.token,
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
export const signOut = async (authProvider: "google" | "apple" | "anonymous") => {
  try {
    // Sign out from provider
    if (authProvider === "google") {
      await GoogleSignin.signOut()
    }
    // Apple doesn't require explicit sign-out
    // Anonymous doesn't require sign-out

    return { success: true }
  } catch (error) {
    console.error("Sign-Out Error:", error)
    return { success: false, error: "Sign-out failed" }
  }
}

/**
 * Get current Google user (if signed in)
 */
export const getCurrentGoogleUser = async () => {
  try {
    return await GoogleSignin.getCurrentUser()
  } catch {
    return null
  }
}
