/**
 * useTasbihCounter Hook
 * Track tasbih/dhikr counts and sessions with points
 */

import { useState, useCallback } from "react"
import { Alert } from "react-native"
import { TasbihSession } from "@/types/userStats"
import * as storage from "@/utils/storage"
import { STORAGE_KEYS } from "@/constants/storageKeys"
import { useUserStats } from "./useUserStats"
import { calculateTasbihPoints } from "@/utils/pointsCalculator"
import type { PredefinedTasbih } from "@/constants/predefinedTasbihs"

export interface UseTasbihCounterReturn {
  // Current counter state
  currentCount: number
  targetCount: number
  isComplete: boolean

  // Active tasbih
  activeTasbih: PredefinedTasbih | null
  customTasbihName: string | null

  // Counter actions
  increment: () => void
  reset: () => void
  setTarget: (count: number) => void
  startTasbih: (tasbih: PredefinedTasbih | null, customName?: string, target?: number) => void
  completeTasbih: () => Promise<number>

  // Stats
  tasbihStats: {
    totalCount: number
    sessionsCompleted: number
    lastSessionDate: string | null
  }

  // History
  getRecentSessions: (limit?: number) => TasbihSession[]
}

/**
 * Get today's date in YYYY-MM-DD format
 */
const getTodayDateString = (): string => {
  const today = new Date()
  return today.toISOString().split("T")[0]
}

/**
 * Hook for Tasbih/Dhikr counter
 */
export const useTasbihCounter = (): UseTasbihCounterReturn => {
  const { stats, updateStat, addPoints } = useUserStats()
  const [currentCount, setCurrentCount] = useState(0)
  const [targetCount, setTargetCount] = useState(33)
  const [activeTasbih, setActiveTasbih] = useState<PredefinedTasbih | null>(null)
  const [customTasbihName, setCustomTasbihName] = useState<string | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)

  const isComplete = currentCount >= targetCount

  /**
   * Start a new tasbih session
   */
  const startTasbih = useCallback(
    (tasbih: PredefinedTasbih | null, customName?: string, target?: number) => {
      setActiveTasbih(tasbih)
      setCustomTasbihName(customName || null)
      setTargetCount(target || tasbih?.defaultCount || 33)
      setCurrentCount(0)
      setSessionStartTime(new Date())
    },
    []
  )

  /**
   * Increment counter
   */
  const increment = useCallback(() => {
    if (!sessionStartTime) {
      setSessionStartTime(new Date())
    }
    setCurrentCount((prev) => prev + 1)
  }, [sessionStartTime])

  /**
   * Reset counter
   */
  const reset = useCallback(() => {
    setCurrentCount(0)
    setSessionStartTime(new Date())
  }, [])

  /**
   * Set target count
   */
  const setTarget = useCallback((count: number) => {
    setTargetCount(count)
  }, [])

  /**
   * Complete tasbih session and award points
   */
  const completeTasbih = useCallback(async (): Promise<number> => {
    try {
      if (currentCount === 0) {
        throw new Error("No counts to complete")
      }

      const todayDate = getTodayDateString()
      const endTime = new Date()
      const durationMinutes = sessionStartTime
        ? (endTime.getTime() - sessionStartTime.getTime()) / (1000 * 60)
        : 1

      // Calculate points (5 points per 10 counts)
      const points = calculateTasbihPoints(currentCount)

      // Update stats
      await Promise.all([
        updateStat("totalTasbihCount", stats.totalTasbihCount + currentCount),
        updateStat("tasbihSessionsCompleted", stats.tasbihSessionsCompleted + 1),
        updateStat("lastTasbihDate", todayDate),
        addPoints(points),
      ])

      // Save session to history
      const session: TasbihSession = {
        tasbihId: activeTasbih?.id || "custom",
        tasbihName: activeTasbih?.name || customTasbihName || "Custom Dhikr",
        count: currentCount,
        targetCount,
        timestamp: endTime.toISOString(),
        durationMinutes: Math.round(durationMinutes),
        pointsEarned: points,
      }

      const history = storage.load<TasbihSession[]>(STORAGE_KEYS.TASBIH_HISTORY) || []
      history.unshift(session)
      // Keep last 100 sessions
      storage.save(STORAGE_KEYS.TASBIH_HISTORY, history.slice(0, 100))

      // Show success alert
      Alert.alert(
        "Tasbih Completed! 🎉",
        `You earned ${points} points!\n${currentCount} counts completed.`,
        [{ text: "Alhamdulillah", style: "default" }]
      )

      console.log(`✅ Tasbih session completed! +${points} points`)

      // Reset counter for next session
      setCurrentCount(0)
      setSessionStartTime(new Date())

      return points
    } catch (err) {
      console.error("Failed to complete tasbih:", err)
      throw err
    }
  }, [
    currentCount,
    targetCount,
    activeTasbih,
    customTasbihName,
    sessionStartTime,
    stats,
    updateStat,
    addPoints,
  ])

  /**
   * Get recent tasbih sessions
   */
  const getRecentSessions = useCallback((limit: number = 10): TasbihSession[] => {
    try {
      const history = storage.load<TasbihSession[]>(STORAGE_KEYS.TASBIH_HISTORY) || []
      return history.slice(0, limit)
    } catch (err) {
      console.error("Failed to load tasbih history:", err)
      return []
    }
  }, [])

  // Tasbih statistics
  const tasbihStats = {
    totalCount: stats.totalTasbihCount,
    sessionsCompleted: stats.tasbihSessionsCompleted,
    lastSessionDate: stats.lastTasbihDate,
  }

  return {
    currentCount,
    targetCount,
    isComplete,
    activeTasbih,
    customTasbihName,
    increment,
    reset,
    setTarget,
    startTasbih,
    completeTasbih,
    tasbihStats,
    getRecentSessions,
  }
}
