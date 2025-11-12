/**
 * User Statistics Types
 * Complete type definitions for the gamified tracking system
 */

/**
 * Main user statistics interface
 * Represents all tracked statistics for a user
 */
export interface UserStats {
  id?: number
  userId?: number

  // Prayer Tracking
  totalPrayersPrayed: number
  prayersStreakDays: number
  lastPrayerDate: string | null
  fajrCount: number
  dhuhrCount: number
  asrCount: number
  maghribCount: number
  ishaCount: number

  // Quran Tracking
  totalQuranPagesRead: number
  totalQuranTimeMinutes: number
  lastQuranSurah: number | null
  lastQuranAyah: number | null
  lastQuranPage: number | null
  lastQuranJuz: number | null
  quranStreakDays: number
  lastQuranReadDate: string | null
  completedQuranCount: number

  // Hadith Tracking
  totalHadithRead: number
  lastHadithBook: string | null
  lastHadithNumber: number | null
  hadithStreakDays: number
  lastHadithReadDate: string | null

  // Tafsir Tracking
  totalTafsirRead: number
  lastTafsirSurah: number | null
  lastTafsirAyah: number | null
  tafsirStreakDays: number
  lastTafsirReadDate: string | null

  // Dua Tracking
  totalDuasRead: number
  favoriteDuas: string[] // Array of dua IDs
  lastDuaId: string | null
  duaStreakDays: number
  lastDuaReadDate: string | null

  // Tasbih/Dhikr Tracking
  totalTasbihCount: number
  tasbihSessions: number
  lastTasbihName: string | null
  lastTasbihCount: number
  lastTasbihDate: string | null
  customTasbihs: CustomTasbih[]

  // Gamification
  totalPoints: number
  level: number
  badgesEarned: string[] // Array of badge IDs
  achievements: Achievement[]

  // Metadata
  createdAt: string
  updatedAt: string
  lastSyncedAt: string | null
}

/**
 * Prayer record for a specific date
 */
export interface PrayerRecord {
  date: string // YYYY-MM-DD
  fajr: boolean
  dhuhr: boolean
  asr: boolean
  maghrib: boolean
  isha: boolean
  fajrOnTime: boolean
  dhuhrOnTime: boolean
  asrOnTime: boolean
  maghribOnTime: boolean
  ishaOnTime: boolean
  pointsEarned: number
}

/**
 * Quran reading progress
 */
export interface QuranProgress {
  surahNumber: number
  ayahNumber: number
  pageNumber: number
  juzNumber: number
  timestamp: string
  durationMinutes: number
  pointsEarned: number
}

/**
 * Quran bookmark
 */
export interface QuranBookmark {
  id: string
  surahNumber: number
  ayahNumber: number
  pageNumber: number
  note?: string
  createdAt: string
}

/**
 * Hadith reading record
 */
export interface HadithProgress {
  book: string // e.g., "sahih-bukhari"
  hadithNumber: number
  timestamp: string
  pointsEarned: number
}

/**
 * Tafsir reading record
 */
export interface TafsirProgress {
  surahNumber: number
  ayahNumber: number
  timestamp: string
  pointsEarned: number
}

/**
 * Dua record
 */
export interface DuaRecord {
  duaId: string
  timestamp: string
  pointsEarned: number
}

/**
 * Custom Tasbih created by user
 */
export interface CustomTasbih {
  id: string
  name: string
  arabicText: string
  transliteration: string
  translation: string
  targetCount: number
  createdAt: string
}

/**
 * Predefined Tasbih
 */
export interface PredefinedTasbih {
  id: string
  name: string
  arabicText: string
  transliteration: string
  translation: string
  targetCount: number
  reward?: string
}

/**
 * Tasbih session
 */
export interface TasbihSession {
  id: string
  tasbihId: string
  tasbihName: string
  count: number
  targetCount: number
  completedAt: string | null
  pointsEarned: number
}

/**
 * Achievement
 */
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: string
  points: number
}

/**
 * Badge
 */
export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: string
}

/**
 * Default user stats (for new users)
 */
export const DEFAULT_USER_STATS: UserStats = {
  // Prayer Tracking
  totalPrayersPrayed: 0,
  prayersStreakDays: 0,
  lastPrayerDate: null,
  fajrCount: 0,
  dhuhrCount: 0,
  asrCount: 0,
  maghribCount: 0,
  ishaCount: 0,

  // Quran Tracking
  totalQuranPagesRead: 0,
  totalQuranTimeMinutes: 0,
  lastQuranSurah: null,
  lastQuranAyah: null,
  lastQuranPage: null,
  lastQuranJuz: null,
  quranStreakDays: 0,
  lastQuranReadDate: null,
  completedQuranCount: 0,

  // Hadith Tracking
  totalHadithRead: 0,
  lastHadithBook: null,
  lastHadithNumber: null,
  hadithStreakDays: 0,
  lastHadithReadDate: null,

  // Tafsir Tracking
  totalTafsirRead: 0,
  lastTafsirSurah: null,
  lastTafsirAyah: null,
  tafsirStreakDays: 0,
  lastTafsirReadDate: null,

  // Dua Tracking
  totalDuasRead: 0,
  favoriteDuas: [],
  lastDuaId: null,
  duaStreakDays: 0,
  lastDuaReadDate: null,

  // Tasbih/Dhikr Tracking
  totalTasbihCount: 0,
  tasbihSessions: 0,
  lastTasbihName: null,
  lastTasbihCount: 0,
  lastTasbihDate: null,
  customTasbihs: [],

  // Gamification
  totalPoints: 0,
  level: 1,
  badgesEarned: [],
  achievements: [],

  // Metadata
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastSyncedAt: null,
}
