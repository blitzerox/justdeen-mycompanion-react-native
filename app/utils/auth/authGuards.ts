/**
 * Authentication Guards
 *
 * Helpers to check if features require Auth0 authentication
 * Guest users can use most app features, but community features require Auth0
 */

import type { JustDeenUser } from "@/services/auth/authService"

/**
 * Check if a user is authenticated with Auth0 (not a guest user)
 */
export const isAuth0User = (user: JustDeenUser | null): boolean => {
  return user !== null && user.authProvider === "auth0"
}

/**
 * Check if a user is a guest user
 */
export const isGuestUser = (user: JustDeenUser | null): boolean => {
  return user !== null && user.authProvider === "anonymous"
}

/**
 * Check if a user has access to a specific feature
 *
 * @param user - Current user object
 * @param feature - Feature to check access for
 * @returns true if user has access, false otherwise
 */
export const hasFeatureAccess = (
  user: JustDeenUser | null,
  feature: "community" | "core",
): boolean => {
  // Community features require Auth0 authentication
  if (feature === "community") {
    return isAuth0User(user)
  }

  // Core features (Prayer, Quran, Dhikr, etc.) are available to all authenticated users
  // Both guest users and Auth0 users can access core features
  if (feature === "core") {
    return user !== null
  }

  return false
}

/**
 * Get a message to show when user doesn't have access to a feature
 */
export const getAccessDeniedMessage = (feature: "community" | "core"): string => {
  if (feature === "community") {
    return "Please sign in with your account to access community features. Your prayer data and progress will be saved to the cloud."
  }

  return "Please sign in or continue as guest to use this feature."
}

/**
 * List of routes that require Auth0 authentication
 * Add community feature routes here as you build them
 */
export const AUTH0_REQUIRED_ROUTES = [
  "Community",
  "CommunityPost",
  "CommunityCreate",
  // Add more community routes as needed
]

/**
 * Check if a route requires Auth0 authentication
 */
export const routeRequiresAuth0 = (routeName: string): boolean => {
  return AUTH0_REQUIRED_ROUTES.includes(routeName)
}
