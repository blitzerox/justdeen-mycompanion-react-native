/**
 * These are configuration settings for the dev environment.
 *
 * Do not include API secrets in this file or anywhere in your JS.
 *
 * https://reactnative.dev/docs/security#storing-sensitive-info
 */
import {
  CLOUDFLARE_API_URL,
  ALADHAN_API_URL,
  API_TIMEOUT,
  DEBUG,
  DEFAULT_PRAYER_METHOD,
  DEFAULT_MADHAB,
} from "@env"

export default {
  // API Endpoints
  CLOUDFLARE_API_URL: CLOUDFLARE_API_URL || "http://localhost:8787",
  ALADHAN_API_URL: ALADHAN_API_URL || "https://api.aladhan.com/v1",

  // Prayer Configuration
  DEFAULT_PRAYER_METHOD: parseInt(DEFAULT_PRAYER_METHOD || "2", 10),
  DEFAULT_MADHAB: parseInt(DEFAULT_MADHAB || "1", 10),

  // Development
  API_TIMEOUT: parseInt(API_TIMEOUT || "10000", 10),
  DEBUG: DEBUG === "true",
}
