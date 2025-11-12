/**
 * usePrayerTracking Hook
 * Enhanced prayer tracking with gamification and statistics
 */

import { useState, useEffect, useCallback } from "react"
import { PrayerRecord } from "@/types/userStats"
import * as storage from "@/utils/storage"
import { STORAGE_KEYS } from "@/constants/storageKeys"
import { useUserStats } from "./useUserStats"
import { calculatePrayerPoints } from "@/utils/pointsCalculator"

export interface TodayPrayers {
  fajr: boolean
  dhuhr: boolean
  asr: boolean
  maghrib: boolean
  isha: boolean
}

export interface UsePrayerTrackingReturn {
  // Today's prayers
  todayPrayers: TodayPrayers
  allPrayersCompleted: boolean

  // Functions
  markPrayerPrayed: (prayerName: string, onTime?: boolean) => Promise<void>
  isPrayerPrayedToday: (prayerName: string) => boolean
  getTodayProgress: () => { completed: number; total: number; percentage: number }
  getPrayerHistory: (days?: number) => PrayerRecord[]

  // Stats
  prayerStats: {
    totalPrayed: number
    streakDays: number
    lastPrayerDate: string | null
    byPrayer: {
      fajr: number
      dhuhr: number
      asr: number
      maghrib: number
      isha: number
    }
  }
}

/**
 * Get today's date in YYYY-MM-DD format
 */
const getTodayDateString = (): string => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Calculate streak from last prayer date
 */
const calculateStreak = (lastPrayerDate: string | null): number => {
  if (!lastPrayerDate) return 0

  const today = new Date()
  const lastDate = new Date(lastPrayerDate)

  // Reset time to start of day for accurate comparison
  today.setHours(0, 0, 0, 0)
  lastDate.setHours(0, 0, 0, 0)

  const diffTime = today.getTime() - lastDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  // If more than 1 day has passed, streak is broken
  if (diffDays > 1) {
    return 0
  }

  return diffDays
}

/**
 * Hook for prayer tracking with gamification
 */
export const usePrayerTracking = (): UsePrayerTrackingReturn => {
  const { stats, updateStat, addPoints } = useUserStats()
  const [todayPrayers, setTodayPrayers] = useState<TodayPrayers>({
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  })

  /**
   * Load today's prayers from storage
   */
  const loadTodayPrayers = useCallback(() => {
    try {
      const todayDate = getTodayDateString()
      const storedDate = storage.loadString(`${STORAGE_KEYS.TODAY_PRAYERS}_date`)

      // If stored date is not today, reset
      if (storedDate !== todayDate) {
        storage.save(STORAGE_KEYS.TODAY_PRAYERS, {
          fajr: false,
          dhuhr: false,
          asr: false,
          maghrib: false,
          isha: false,
        })
        storage.saveString(`${STORAGE_KEYS.TODAY_PRAYERS}_date`, todayDate)
        setTodayPrayers({
          fajr: false,
          dhuhr: false,
          asr: false,
          maghrib: false,
          isha: false,
        })
        return
      }

      const stored = storage.load<TodayPrayers>(STORAGE_KEYS.TODAY_PRAYERS)
      if (stored) {
        setTodayPrayers(stored)
      }
    } catch (err) {
      console.error("Failed to load today's prayers:", err)
    }
  }, [])

  /**
   * Save today's prayers to storage
   */
  const saveTodayPrayers = useCallback((prayers: TodayPrayers) => {
    try {
      storage.save(STORAGE_KEYS.TODAY_PRAYERS, prayers)
      setTodayPrayers(prayers)
    } catch (err) {
      console.error("Failed to save today's prayers:", err)
    }
  }, [])

  /**
   * Mark a prayer as prayed
   */
  const markPrayerPrayed = useCallback(async (prayerName: string, onTime: boolean = true) => {
    const prayerKey = prayerName.toLowerCase() as keyof TodayPrayers

    // Check if prayer is valid
    if (!["fajr", "dhuhr", "asr", "maghrib", "isha"].includes(prayerKey)) {
      console.warn(`Invalid prayer name: ${prayerName}`)
      return
    }

    // Check if prayer already marked
    if (todayPrayers[prayerKey]) {
      console.log(`${prayerName} already marked as prayed today`)
      return
    }

    try {
      // Update today's prayers
      const updatedPrayers = {
        ...todayPrayers,
        [prayerKey]: true,
      }
      saveTodayPrayers(updatedPrayers)

      // Calculate points
      const points = calculatePrayerPoints(onTime, false)

      // Update user stats
      const todayDate = getTodayDateString()
      const newStreak = calculateStreak(stats.lastPrayerDate) === 0 ? 1 : stats.prayersStreakDays + 1

      await Promise.all([
        updateStat("totalPrayersPrayed", stats.totalPrayersPrayed + 1),
        updateStat("lastPrayerDate", todayDate),
        updateStat("prayersStreakDays", newStreak),
        updateStat(`${prayerKey}Count` as keyof typeof stats, (stats[`${prayerKey}Count` as keyof typeof stats] as number) + 1),
        addPoints(points),
      ])

      console.log(`✅ ${prayerName} marked as prayed! +${points} points`)
    } catch (err) {
      console.error(`Failed to mark ${prayerName} as prayed:`, err)
    }
  }, [todayPrayers, stats, updateStat, addPoints, saveTodayPrayers])

  /**
   * Check if a prayer was prayed today
   */
  const isPrayerPrayedToday = useCallback((prayerName: string): boolean => {
    const prayerKey = prayerName.toLowerCase() as keyof TodayPrayers
    return todayPrayers[prayerKey] || false
  }, [todayPrayers])

  /**
   * Get today's prayer progress
   */
  const getTodayProgress = useCallback(() => {
    const completed = Object.values(todayPrayers).filter(Boolean).length
    const total = 5
    const percentage = (completed / total) * 100

    return { completed, total, percentage }
  }, [todayPrayers])

  /**
   * Get prayer history
   */
  const getPrayerHistory = useCallback((days: number = 30): PrayerRecord[] => {
    try {
      const history = storage.load<PrayerRecord[]>(STORAGE_KEYS.PRAYER_HISTORY) || []
      return history.slice(0, days)
    } catch (err) {
      console.error("Failed to load prayer history:", err)
      return []
    }
  }, [])

  /**
   * Check if all prayers are completed
   */
  const allPrayersCompleted = Object.values(todayPrayers).every(Boolean)

  /**
   * Prayer statistics
   */
  const prayerStats = {
    totalPrayed: stats.totalPrayersPrayed,
    streakDays: stats.prayersStreakDays,
    lastPrayerDate: stats.lastPrayerDate,
    byPrayer: {
      fajr: stats.fajrCount,
      dhuhr: stats.dhuhrCount,
      asr: stats.asrCount,
      maghrib: stats.maghribCount,
      isha: stats.ishaCount,
    },
  }

  // Load today's prayers on mount
  useEffect(() => {
    loadTodayPrayers()
  }, [loadTodayPrayers])

  return {
    todayPrayers,
    allPrayersCompleted,
    markPrayerPrayed,
    isPrayerPrayedToday,
    getTodayProgress,
    getPrayerHistory,
    prayerStats,
  }
}
