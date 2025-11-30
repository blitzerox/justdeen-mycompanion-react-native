/**
 * Authentication Context
 *
 * Manages user authentication state across the app
 * Supports Auth0 (Google, Apple, Email/Password) and Anonymous sign-in
 */
import React, {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { storage } from "@/utils/storage"
import {
  signInWithAuth0,
  signInAnonymously,
  signOut as authSignOut,
  refreshAuthToken,
  isTokenExpired,
  type JustDeenUser,
} from "@/services/auth/authService"
import { d1Api } from "@/services/cloudflare/d1Api"
import { registerUser } from "@/services/ai/cloudflareRagApi"

export type AuthContextType = {
  // Authentication state
  isAuthenticated: boolean
  isLoading: boolean
  user: JustDeenUser | null

  // Sign-in methods
  signInWithAuth0: () => Promise<{ success: boolean; error?: string }>
  signInAnonymously: () => Promise<{ success: boolean; error?: string }>

  // Sign-out
  logout: () => Promise<void>

  // Token refresh
  refreshToken: () => Promise<{ success: boolean; error?: string; user?: JustDeenUser }>

  // Error handling
  error: string | null
  clearError: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

export interface AuthProviderProps {}

// Storage keys
const STORAGE_KEYS = {
  USER: "auth.user",
  TOKEN: "auth.token",
}

export const AuthProvider: FC<PropsWithChildren<AuthProviderProps>> = ({ children }) => {
  const [user, setUser] = useState<JustDeenUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Initialize authentication on mount
   * - Load saved user from storage (Auth0 or Guest)
   * - For guest users: Automatically restore their session so they don't need to login again
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        // Load saved user from storage
        const savedUserStr = storage.getString(STORAGE_KEYS.USER)
        if (savedUserStr) {
          const parsedUser: JustDeenUser = JSON.parse(savedUserStr)

          console.log('🔍 Loaded user from storage:', {
            authProvider: parsedUser.authProvider,
            email: parsedUser.email,
            hasRefreshToken: !!parsedUser.refreshToken,
            expiresAt: parsedUser.expiresAt ? new Date(parsedUser.expiresAt).toISOString() : 'N/A'
          })

          // For guest users, verify the user data is still valid
          // Guest users persist across app launches - they only need to login once
          if (parsedUser.authProvider === "anonymous") {
            // Guest user found - restore their session automatically
            setUser(parsedUser)
            // Guest users don't sync with backend, so no need to set auth token
          } else {
            // Auth0 user - restore session and set backend token
            setUser(parsedUser)
            d1Api.setAuthToken(parsedUser.idToken)
          }
        } else {
          console.log('ℹ️ No saved user found in storage')
        }
      } catch (err) {
        console.error("Auth initialization error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [])

  /**
   * Save user to state and storage
   */
  const saveUser = useCallback(async (newUser: JustDeenUser) => {
    setUser(newUser)
    storage.set(STORAGE_KEYS.USER, JSON.stringify(newUser))
    storage.set(STORAGE_KEYS.TOKEN, newUser.idToken)

    // Set auth token in D1 API client
    d1Api.setAuthToken(newUser.idToken)

    // Register user in Cloudflare RAG backend (for AI chat)
    // Only register Auth0 users (anonymous users don't need backend registration)
    if (newUser.authProvider === "auth0") {
      try {
        await registerUser(
          newUser.accessToken,
          newUser.id,
          newUser.email,
          newUser.displayName
        )
        console.log("✅ User registered in Cloudflare backend")
      } catch (error) {
        console.warn("Failed to register user in Cloudflare backend:", error)
        // Don't fail the login if backend registration fails
        // The user can still use other features
      }
    }
  }, [])

  /**
   * Clear user from state and storage
   */
  const clearUser = useCallback(() => {
    setUser(null)
    storage.delete(STORAGE_KEYS.USER)
    storage.delete(STORAGE_KEYS.TOKEN)

    // Clear auth token from D1 API client
    d1Api.setAuthToken("")
  }, [])

  /**
   * Sign in with Auth0
   */
  const handleSignInWithAuth0 = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await signInWithAuth0()

      if (result.success && result.user) {
        await saveUser(result.user)
        return { success: true }
      }

      setError(result.error || "Sign-in failed")
      return { success: false, error: result.error }
    } catch (err: any) {
      const errorMessage = err.message || "Sign-in failed"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [saveUser])

  /**
   * Sign in anonymously
   */
  const handleSignInAnonymously = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await signInAnonymously()

      if (result.success && result.user) {
        await saveUser(result.user)
        return { success: true }
      }

      setError(result.error || "Anonymous sign-in failed")
      return { success: false, error: result.error }
    } catch (err: any) {
      const errorMessage = err.message || "Anonymous sign-in failed"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [saveUser])

  /**
   * Logout current user
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true)

      // Sign out from provider if needed
      if (user) {
        await authSignOut(user.authProvider)
      }

      clearUser()
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [user, clearUser])

  /**
   * Refresh token if expired
   */
  const handleRefreshToken = useCallback(async () => {
    if (!user || user.authProvider !== "auth0") {
      return { success: false, error: "No auth user to refresh" }
    }

    if (!user.refreshToken) {
      return { success: false, error: "No refresh token available" }
    }

    try {
      setIsLoading(true)
      setError(null)

      const result = await refreshAuthToken(user.refreshToken)

      if (result.success && result.user) {
        await saveUser(result.user)
        // Return the new user object so callers can use the fresh token immediately
        return { success: true, user: result.user }
      }

      setError(result.error || "Token refresh failed")
      return { success: false, error: result.error }
    } catch (err: any) {
      const errorMessage = err.message || "Token refresh failed"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [user, saveUser])

  /**
   * Check token expiration and auto-refresh if needed
   */
  useEffect(() => {
    if (!user || user.authProvider !== "auth0") return

    const checkAndRefreshToken = async () => {
      if (isTokenExpired(user.expiresAt)) {
        const result = await handleRefreshToken()
        if (!result.success) {
          // Silently clear user if refresh fails - they'll be redirected to login
          clearUser()
        }
      }
    }

    // Check immediately
    checkAndRefreshToken()

    // Check every 5 minutes
    const interval = setInterval(checkAndRefreshToken, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [user, handleRefreshToken, clearUser])

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value: AuthContextType = {
    // Authentication state
    isAuthenticated: !!user,
    isLoading,
    user,

    // Sign-in methods
    signInWithAuth0: handleSignInWithAuth0,
    signInAnonymously: handleSignInAnonymously,

    // Sign-out
    logout,

    // Token refresh
    refreshToken: handleRefreshToken,

    // Error handling
    error,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
