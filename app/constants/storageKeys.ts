/**
 * Storage Keys Constants
 * All AsyncStorage keys used in the app
 */

export const STORAGE_KEYS = {
  // User Stats
  USER_STATS: "@justdeen:user_stats",

  // Prayer Tracking
  PRAYER_HISTORY: "@justdeen:prayer_history", // Last 30 days
  TODAY_PRAYERS: "@justdeen:today_prayers", // Today's prayers status

  // Quran Tracking
  QURAN_PROGRESS: "@justdeen:quran_progress", // Last read position
  QURAN_BOOKMARKS: "@justdeen:quran_bookmarks", // Array of bookmarks
  QURAN_HISTORY: "@justdeen:quran_history", // Reading history

  // Hadith Tracking
  HADITH_PROGRESS: "@justdeen:hadith_progress",

  // Tafsir Tracking
  TAFSIR_PROGRESS: "@justdeen:tafsir_progress",

  // Dua Tracking
  DUA_FAVORITES: "@justdeen:dua_favorites",

  // Tasbih/Dhikr
  TASBIH_HISTORY: "@justdeen:tasbih_history", // Session history
  CUSTOM_TASBIHS: "@justdeen:custom_tasbihs", // User-created tasbihs

  // Sync
  LAST_SYNC_TIME: "@justdeen:last_sync_time",

  // Auth (if needed)
  AUTH_TOKEN: "@justdeen:auth_token",
} as const

// Type for storage keys
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
