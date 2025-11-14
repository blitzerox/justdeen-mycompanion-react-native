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
  type JustDeenUser,
} from "@/services/auth/authService"
import { d1Api } from "@/services/cloudflare/d1Api"

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
  const saveUser = useCallback((newUser: JustDeenUser) => {
    setUser(newUser)
    storage.set(STORAGE_KEYS.USER, JSON.stringify(newUser))
    storage.set(STORAGE_KEYS.TOKEN, newUser.idToken)

    // Set auth token in D1 API client
    d1Api.setAuthToken(newUser.idToken)
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
        saveUser(result.user)
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
        saveUser(result.user)
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
