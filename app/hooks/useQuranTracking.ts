/**
 * useQuranTracking Hook
 * Track Quran reading progress, bookmarks, and sessions
 */

import { useState, useEffect, useCallback } from "react"
import { QuranProgress, QuranBookmark } from "@/types/userStats"
import * as storage from "@/utils/storage"
import { STORAGE_KEYS } from "@/constants/storageKeys"
import { useUserStats } from "./useUserStats"
import { calculateQuranPoints } from "@/utils/pointsCalculator"

export interface UseQuranTrackingReturn {
  // Current progress
  lastReadPosition: {
    surahNumber: number | null
    ayahNumber: number | null
    pageNumber: number | null
    juzNumber: number | null
  }

  // Bookmarks
  bookmarks: QuranBookmark[]

  // Functions
  updateQuranProgress: (
    surahNumber: number,
    ayahNumber: number,
    pageNumber: number,
    juzNumber: number,
    durationMinutes: number
  ) => Promise<number>

  addBookmark: (
    surahNumber: number,
    ayahNumber: number,
    pageNumber: number,
    note?: string
  ) => Promise<void>

  removeBookmark: (bookmarkId: string) => Promise<void>
  getBookmarks: () => QuranBookmark[]

  // Stats
  quranStats: {
    totalPagesRead: number
    totalTimeMinutes: number
    streakDays: number
    lastReadDate: string | null
    completedCount: number
  }
}

/**
 * Get today's date in YYYY-MM-DD format
 */
const getTodayDateString = (): string => {
  const today = new Date()
  return today.toISOString().split("T")[0]
}

/**
 * Hook for Quran reading tracking
 */
export const useQuranTracking = (): UseQuranTrackingReturn => {
  const { stats, updateStat, addPoints } = useUserStats()
  const [bookmarks, setBookmarks] = useState<QuranBookmark[]>([])

  // Load bookmarks on mount
  useEffect(() => {
    loadBookmarks()
  }, [])

  /**
   * Load bookmarks from storage
   */
  const loadBookmarks = useCallback(() => {
    try {
      const stored = storage.load<QuranBookmark[]>(STORAGE_KEYS.QURAN_BOOKMARKS)
      if (stored) {
        setBookmarks(stored)
      }
    } catch (err) {
      console.error("Failed to load bookmarks:", err)
    }
  }, [])

  /**
   * Save bookmarks to storage
   */
  const saveBookmarks = useCallback((newBookmarks: QuranBookmark[]) => {
    try {
      storage.save(STORAGE_KEYS.QURAN_BOOKMARKS, newBookmarks)
      setBookmarks(newBookmarks)
    } catch (err) {
      console.error("Failed to save bookmarks:", err)
    }
  }, [])

  /**
   * Update Quran reading progress and award points
   */
  const updateQuranProgress = useCallback(async (
    surahNumber: number,
    ayahNumber: number,
    pageNumber: number,
    juzNumber: number,
    durationMinutes: number
  ): Promise<number> => {
    try {
      const todayDate = getTodayDateString()

      // Calculate points (2 points per minute, minimum 5)
      const points = calculateQuranPoints(durationMinutes, false, false)

      // Calculate streak
      let newStreak = stats.quranStreakDays
      if (stats.lastQuranReadDate === todayDate) {
        // Same day, keep streak
        newStreak = stats.quranStreakDays
      } else if (stats.lastQuranReadDate) {
        // Check if consecutive days
        const lastDate = new Date(stats.lastQuranReadDate)
        const today = new Date(todayDate)
        const diffTime = today.getTime() - lastDate.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
          newStreak = stats.quranStreakDays + 1
        } else if (diffDays > 1) {
          newStreak = 1 // Streak broken, restart
        }
      } else {
        newStreak = 1 // First read
      }

      // Update all stats
      await Promise.all([
        updateStat("lastQuranSurah", surahNumber),
        updateStat("lastQuranAyah", ayahNumber),
        updateStat("lastQuranPage", pageNumber),
        updateStat("lastQuranJuz", juzNumber),
        updateStat("totalQuranPagesRead", stats.totalQuranPagesRead + 1),
        updateStat("totalQuranTimeMinutes", stats.totalQuranTimeMinutes + durationMinutes),
        updateStat("quranStreakDays", newStreak),
        updateStat("lastQuranReadDate", todayDate),
        addPoints(points),
      ])

      // Save reading session to history
      const progress: QuranProgress = {
        surahNumber,
        ayahNumber,
        pageNumber,
        juzNumber,
        timestamp: new Date().toISOString(),
        durationMinutes,
        pointsEarned: points,
      }

      const history = storage.load<QuranProgress[]>(STORAGE_KEYS.QURAN_HISTORY) || []
      history.unshift(progress)
      // Keep last 100 sessions
      storage.save(STORAGE_KEYS.QURAN_HISTORY, history.slice(0, 100))

      console.log(`✅ Quran progress updated! +${points} points`)
      return points
    } catch (err) {
      console.error("Failed to update Quran progress:", err)
      throw err
    }
  }, [stats, updateStat, addPoints])

  /**
   * Add a bookmark
   */
  const addBookmark = useCallback(async (
    surahNumber: number,
    ayahNumber: number,
    pageNumber: number,
    note?: string
  ) => {
    try {
      const bookmark: QuranBookmark = {
        id: `${Date.now()}-${surahNumber}-${ayahNumber}`,
        surahNumber,
        ayahNumber,
        pageNumber,
        note,
        createdAt: new Date().toISOString(),
      }

      const newBookmarks = [...bookmarks, bookmark]
      saveBookmarks(newBookmarks)

      console.log("✅ Bookmark added")
    } catch (err) {
      console.error("Failed to add bookmark:", err)
      throw err
    }
  }, [bookmarks, saveBookmarks])

  /**
   * Remove a bookmark
   */
  const removeBookmark = useCallback(async (bookmarkId: string) => {
    try {
      const newBookmarks = bookmarks.filter((b) => b.id !== bookmarkId)
      saveBookmarks(newBookmarks)

      console.log("✅ Bookmark removed")
    } catch (err) {
      console.error("Failed to remove bookmark:", err)
      throw err
    }
  }, [bookmarks, saveBookmarks])

  /**
   * Get all bookmarks
   */
  const getBookmarks = useCallback((): QuranBookmark[] => {
    return bookmarks
  }, [bookmarks])

  // Last read position
  const lastReadPosition = {
    surahNumber: stats.lastQuranSurah,
    ayahNumber: stats.lastQuranAyah,
    pageNumber: stats.lastQuranPage,
    juzNumber: stats.lastQuranJuz,
  }

  // Quran statistics
  const quranStats = {
    totalPagesRead: stats.totalQuranPagesRead,
    totalTimeMinutes: stats.totalQuranTimeMinutes,
    streakDays: stats.quranStreakDays,
    lastReadDate: stats.lastQuranReadDate,
    completedCount: stats.completedQuranCount,
  }

  return {
    lastReadPosition,
    bookmarks,
    updateQuranProgress,
    addBookmark,
    removeBookmark,
    getBookmarks,
    quranStats,
  }
}
