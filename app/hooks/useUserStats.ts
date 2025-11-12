/**
 * useUserStats Hook
 * Core hook for managing user statistics across the app
 */

import { useState, useEffect, useCallback } from "react"
import { UserStats, DEFAULT_USER_STATS } from "@/types/userStats"
import * as storage from "@/utils/storage"
import { STORAGE_KEYS } from "@/constants/storageKeys"

export interface UseUserStatsReturn {
  stats: UserStats
  loading: boolean
  error: string | null

  // Core functions
  loadStats: () => Promise<void>
  saveStats: (newStats: UserStats) => Promise<void>
  updateStat: <K extends keyof UserStats>(key: K, value: UserStats[K]) => Promise<void>
  refreshStats: () => Promise<void>
  resetStats: () => Promise<void>

  // Specific updaters
  addPoints: (points: number) => Promise<void>
  updateLevel: () => void
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
 * Hook for managing user statistics
 */
export const useUserStats = (): UseUserStatsReturn => {
  const [stats, setStats] = useState<UserStats>(DEFAULT_USER_STATS)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Load stats from storage
   */
  const loadStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const storedStats = storage.load<UserStats>(STORAGE_KEYS.USER_STATS)

      if (storedStats) {
        setStats(storedStats)
      } else {
        // Initialize with default stats for new users
        await saveStats(DEFAULT_USER_STATS)
      }
    } catch (err) {
      console.error("Failed to load user stats:", err)
      setError(err instanceof Error ? err.message : "Failed to load stats")
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Save stats to storage
   */
  const saveStats = useCallback(async (newStats: UserStats) => {
    try {
      const updatedStats = {
        ...newStats,
        updatedAt: new Date().toISOString(),
      }

      const success = storage.save(STORAGE_KEYS.USER_STATS, updatedStats)

      if (success) {
        setStats(updatedStats)
      } else {
        throw new Error("Failed to save stats to storage")
      }
    } catch (err) {
      console.error("Failed to save user stats:", err)
      setError(err instanceof Error ? err.message : "Failed to save stats")
      throw err
    }
  }, [])

  /**
   * Update a specific stat field
   */
  const updateStat = useCallback(async <K extends keyof UserStats>(
    key: K,
    value: UserStats[K]
  ) => {
    try {
      const newStats = {
        ...stats,
        [key]: value,
      }
      await saveStats(newStats)
    } catch (err) {
      console.error(`Failed to update stat ${String(key)}:`, err)
      throw err
    }
  }, [stats, saveStats])

  /**
   * Refresh stats from storage (force reload)
   */
  const refreshStats = useCallback(async () => {
    await loadStats()
  }, [loadStats])

  /**
   * Reset stats to default
   */
  const resetStats = useCallback(async () => {
    try {
      await saveStats(DEFAULT_USER_STATS)
    } catch (err) {
      console.error("Failed to reset stats:", err)
      throw err
    }
  }, [saveStats])

  /**
   * Add points and recalculate level
   */
  const addPoints = useCallback(async (points: number) => {
    try {
      const newTotalPoints = stats.totalPoints + points
      const newLevel = calculateLevel(newTotalPoints)

      const newStats = {
        ...stats,
        totalPoints: newTotalPoints,
        level: newLevel,
      }

      await saveStats(newStats)
    } catch (err) {
      console.error("Failed to add points:", err)
      throw err
    }
  }, [stats, saveStats])

  /**
   * Update level based on current points
   */
  const updateLevel = useCallback(() => {
    const newLevel = calculateLevel(stats.totalPoints)
    if (newLevel !== stats.level) {
      updateStat("level", newLevel)
    }
  }, [stats.totalPoints, stats.level, updateStat])

  // Load stats on mount
  useEffect(() => {
    loadStats()
  }, [loadStats])

  return {
    stats,
    loading,
    error,
    loadStats,
    saveStats,
    updateStat,
    refreshStats,
    resetStats,
    addPoints,
    updateLevel,
  }
}
