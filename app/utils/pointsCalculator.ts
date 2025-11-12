/**
 * Points Calculator
 * Calculate points for various Islamic activities
 */

/**
 * Points configuration
 */
export const POINTS_CONFIG = {
  // Prayer Points
  PRAYER_ON_TIME: 15,
  PRAYER_LATE: 10,
  CONGREGATION_BONUS: 10,
  FIVE_PRAYERS_BONUS: 25, // Bonus for completing all 5 prayers in a day

  // Quran Points
  QURAN_READING_PER_MINUTE: 2,
  QURAN_READING_MIN_POINTS: 5, // Minimum points for any Quran reading
  COMPLETE_SURAH_BONUS: 50,
  COMPLETE_JUZ_BONUS: 100,

  // Hadith Points
  HADITH_READ: 5,
  COMPLETE_HADITH_BOOK_BONUS: 200,

  // Tafsir Points
  TAFSIR_SESSION: 10,

  // Dua Points
  DUA_READ: 3,

  // Tasbih Points
  TASBIH_PER_10_COUNTS: 5,
  TASBIH_COMPLETE_SESSION_BONUS: 10,
} as const

/**
 * Level thresholds
 * Each level requires reaching the specified points
 */
export const LEVEL_THRESHOLDS = [
  0, // Level 1
  100, // Level 2
  250, // Level 3
  500, // Level 4
  1000, // Level 5
  2000, // Level 6
  3500, // Level 7
  5500, // Level 8
  8000, // Level 9
  12000, // Level 10
] as const

/**
 * Calculate points for prayer
 * @param onTime Whether prayer was prayed on time
 * @param inCongregation Whether prayer was prayed in congregation
 * @returns Points earned
 */
export function calculatePrayerPoints(onTime: boolean, inCongregation: boolean = false): number {
  let points = onTime ? POINTS_CONFIG.PRAYER_ON_TIME : POINTS_CONFIG.PRAYER_LATE

  if (inCongregation) {
    points += POINTS_CONFIG.CONGREGATION_BONUS
  }

  return points
}

/**
 * Calculate points for Quran reading
 * @param durationMinutes Duration of reading session in minutes
 * @param completedSurah Whether a surah was completed
 * @param completedJuz Whether a juz was completed
 * @returns Points earned
 */
export function calculateQuranPoints(
  durationMinutes: number,
  completedSurah: boolean = false,
  completedJuz: boolean = false
): number {
  let points = Math.max(
    durationMinutes * POINTS_CONFIG.QURAN_READING_PER_MINUTE,
    POINTS_CONFIG.QURAN_READING_MIN_POINTS
  )

  if (completedSurah) {
    points += POINTS_CONFIG.COMPLETE_SURAH_BONUS
  }

  if (completedJuz) {
    points += POINTS_CONFIG.COMPLETE_JUZ_BONUS
  }

  return points
}

/**
 * Calculate points for Hadith reading
 * @param count Number of hadiths read
 * @returns Points earned
 */
export function calculateHadithPoints(count: number = 1): number {
  return count * POINTS_CONFIG.HADITH_READ
}

/**
 * Calculate points for Tafsir reading
 * @returns Points earned
 */
export function calculateTafsirPoints(): number {
  return POINTS_CONFIG.TAFSIR_SESSION
}

/**
 * Calculate points for Dua
 * @param count Number of duas read
 * @returns Points earned
 */
export function calculateDuaPoints(count: number = 1): number {
  return count * POINTS_CONFIG.DUA_READ
}

/**
 * Calculate points for Tasbih/Dhikr
 * @param count Total count of tasbih
 * @param completedSession Whether the target was reached
 * @returns Points earned
 */
export function calculateTasbihPoints(count: number, completedSession: boolean = false): number {
  const groups = Math.floor(count / 10)
  let points = groups * POINTS_CONFIG.TASBIH_PER_10_COUNTS

  if (completedSession) {
    points += POINTS_CONFIG.TASBIH_COMPLETE_SESSION_BONUS
  }

  return points
}

/**
 * Calculate level from total points
 * @param points Total points
 * @returns Current level (1-10+)
 */
export function calculateLevelFromPoints(points: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      return i + 1
    }
  }

  return 1
}

/**
 * Get points required for next level
 * @param currentPoints Current total points
 * @returns Points needed for next level, or null if at max level
 */
export function getPointsForNextLevel(currentPoints: number): number | null {
  const currentLevel = calculateLevelFromPoints(currentPoints)

  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return null // Max level reached
  }

  return LEVEL_THRESHOLDS[currentLevel] - currentPoints
}

/**
 * Get progress to next level as percentage
 * @param currentPoints Current total points
 * @returns Progress percentage (0-100), or 100 if at max level
 */
export function getLevelProgress(currentPoints: number): number {
  const currentLevel = calculateLevelFromPoints(currentPoints)

  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return 100 // Max level reached
  }

  const currentLevelThreshold = LEVEL_THRESHOLDS[currentLevel - 1]
  const nextLevelThreshold = LEVEL_THRESHOLDS[currentLevel]
  const pointsInCurrentLevel = currentPoints - currentLevelThreshold
  const pointsNeededForLevel = nextLevelThreshold - currentLevelThreshold

  return (pointsInCurrentLevel / pointsNeededForLevel) * 100
}
