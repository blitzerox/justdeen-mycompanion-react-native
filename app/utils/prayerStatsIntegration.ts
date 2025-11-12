/**
 * Prayer Stats Integration
 * Helper functions to integrate prayer tracking with stats/gamification system
 */

import { PrayerTrackingStatus } from "@/types/prayer"
import { UserStats } from "@/types/userStats"
import { calculatePrayerPoints } from "./pointsCalculator"
import * as storage from "./storage"
import { STORAGE_KEYS } from "@/constants/storageKeys"

/**
 * Get today's date string in YYYY-MM-DD format
 */
export const getTodayDateString = (): string => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Check if today is the date
 */
export const isToday = (date: Date): boolean => {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

/**
 * Handle prayer status change and award points
 * Returns the points awarded (or 0 if no points)
 */
export const handlePrayerStatusChange = async (
  prayerName: string,
  date: Date,
  newStatus: PrayerTrackingStatus,
  previousStatus: PrayerTrackingStatus
): Promise<number> => {
  // Only award points for today's prayers
  if (!isToday(date)) {
    return 0
  }

  // Only award points when marking as DONE or LATE (not for MISSED or removing status)
  if (newStatus !== PrayerTrackingStatus.DONE && newStatus !== PrayerTrackingStatus.LATE) {
    return 0
  }

  // Don't award points if prayer was already marked as DONE or LATE
  if (previousStatus === PrayerTrackingStatus.DONE || previousStatus === PrayerTrackingStatus.LATE) {
    return 0
  }

  try {
    // Load current stats
    const stats = storage.load<UserStats>(STORAGE_KEYS.USER_STATS)
    if (!stats) {
      console.warn("No stats found, skipping points award")
      return 0
    }

    // Calculate points
    const onTime = newStatus === PrayerTrackingStatus.DONE
    const points = calculatePrayerPoints(onTime, false)

    // Update stats
    const todayDate = getTodayDateString()
    const prayerKey = `${prayerName.toLowerCase()}Count` as keyof UserStats

    // Calculate streak
    let newStreak = stats.prayersStreakDays
    if (stats.lastPrayerDate === todayDate) {
      // Same day, keep streak
      newStreak = stats.prayersStreakDays
    } else if (stats.lastPrayerDate) {
      // Check if it's consecutive days
      const lastDate = new Date(stats.lastPrayerDate)
      const today = new Date()
      const diffTime = today.getTime() - lastDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        // Consecutive day, increment streak
        newStreak = stats.prayersStreakDays + 1
      } else if (diffDays > 1) {
        // Streak broken, restart
        newStreak = 1
      }
    } else {
      // First prayer ever
      newStreak = 1
    }

    // Update all relevant stats
    const updatedStats: UserStats = {
      ...stats,
      totalPrayersPrayed: stats.totalPrayersPrayed + 1,
      totalPoints: stats.totalPoints + points,
      lastPrayerDate: todayDate,
      prayersStreakDays: newStreak,
      [prayerKey]: ((stats[prayerKey] as number) || 0) + 1,
      updatedAt: new Date().toISOString(),
    }

    // Recalculate level
    updatedStats.level = calculateLevel(updatedStats.totalPoints)

    // Save updated stats
    storage.save(STORAGE_KEYS.USER_STATS, updatedStats)

    console.log(`✅ ${prayerName} marked! +${points} points (Status: ${newStatus})`)
    return points
  } catch (error) {
    console.error("Failed to update prayer stats:", error)
    return 0
  }
}

/**
 * Calculate level from total points
 */
const calculateLevel = (points: number): number => {
  const thresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000]

  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (points >= thresholds[i]) {
      return i + 1
    }
  }

  return 1
}

/**
 * Get points message based on status
 */
export const getPointsMessage = (prayerName: string, status: PrayerTrackingStatus, points: number): string => {
  if (points === 0) {
    return ""
  }

  const statusText = status === PrayerTrackingStatus.DONE ? "on time" : "marked"
  return `${prayerName} ${statusText}! +${points} points`
}
