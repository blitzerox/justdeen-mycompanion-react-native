/**
 * TypeScript declarations for environment variables
 * Provides type safety when importing from '@env'
 */

declare module "@env" {
  // API Endpoints
  export const CLOUDFLARE_API_URL: string
  export const CLOUDFLARE_API_KEY: string
  export const ALADHAN_API_URL: string

  // Authentication
  export const GOOGLE_WEB_CLIENT_ID: string
  export const GOOGLE_IOS_CLIENT_ID: string

  // In-App Purchases
  export const REVENUE_CAT_API_KEY: string
  export const APP_STORE_SHARED_SECRET: string

  // Prayer Configuration
  export const DEFAULT_PRAYER_METHOD: string
  export const DEFAULT_MADHAB: string

  // AI Chatbot
  export const OPENAI_API_KEY: string
  export const OPENAI_MODEL: string

  // Analytics & Monitoring
  export const SENTRY_DSN: string
  export const SEGMENT_WRITE_KEY: string

  // Development
  export const API_TIMEOUT: string
  export const DEBUG: string
  export const REACTOTRON_HOST: string
}
