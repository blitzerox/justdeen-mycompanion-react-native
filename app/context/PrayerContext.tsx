/**
 * Prayer Context
 * Manages prayer times, location, and prayer-related state
 * Integrated with user statistics and gamification
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Alert } from "react-native"
import { aladhanApi, PrayerTime } from "../services/prayer/aladhanApi"
import * as storage from "../utils/storage"
import { PrayerTrackingStatus, PrayerTrackingRecord } from "../types/prayer"
import { handlePrayerStatusChange, getPointsMessage } from "../utils/prayerStatsIntegration"

interface Location {
  latitude: number
  longitude: number
  name?: string
}

interface PrayerContextValue {
  // Prayer times
  prayerTimes: PrayerTime[]
  loading: boolean
  error: string | null

  // Location
  location: Location | null
  setLocation: (location: Location) => void

  // Prayer tracking
  prayerTracking: PrayerTrackingRecord
  getPrayerStatus: (prayerName: string, date: Date) => PrayerTrackingStatus
  setPrayerStatus: (prayerName: string, date: Date, status: PrayerTrackingStatus) => void
  cyclePrayerStatus: (prayerName: string, date: Date) => PrayerTrackingStatus

  // Actions
  refreshPrayerTimes: () => Promise<void>
  getNextPrayer: () => PrayerTime | null
  getCurrentPrayer: () => PrayerTime | null
}

const PrayerContext = createContext<PrayerContextValue | undefined>(undefined)

interface PrayerProviderProps {
  children: ReactNode
}

export const PrayerProvider: React.FC<PrayerProviderProps> = ({ children }) => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([])
  const [location, setLocationState] = useState<Location | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prayerTracking, setPrayerTracking] = useState<PrayerTrackingRecord>({})

  // Load cached data on mount
  useEffect(() => {
    loadCachedData()
    loadPrayerTracking()
  }, [])

  // Fetch prayer times when location changes
  useEffect(() => {
    if (location) {
      fetchPrayerTimes()
    }
  }, [location])

  /**
   * Load cached prayer times and location from storage
   */
  const loadCachedData = async () => {
    try {
      const cachedLocation = storage.loadString("prayer.location")
      const cachedTimes = storage.loadString("prayer.times")

      if (cachedLocation) {
        setLocationState(JSON.parse(cachedLocation))
      }

      if (cachedTimes) {
        const times = JSON.parse(cachedTimes)
        // Check if times are still valid (same day)
        const today = new Date().toDateString()
        const timesDate = new Date(times[0]?.timestamp).toDateString()
        if (today === timesDate) {
          setPrayerTimes(times)
        }
      }
    } catch (err) {
      console.error("Failed to load cached prayer data:", err)
    }
  }

  /**
   * Fetch prayer times from AlAdhan API
   */
  const fetchPrayerTimes = async () => {
    if (!location) return

    setLoading(true)
    setError(null)

    try {
      const response = await aladhanApi.getPrayerTimes({
        latitude: location.latitude,
        longitude: location.longitude,
      })

      const times = aladhanApi.parsePrayerTimes(response)
      setPrayerTimes(times)

      // Cache prayer times
      storage.saveString("prayer.times", JSON.stringify(times))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch prayer times"
      setError(errorMessage)
      console.error("Prayer times fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Refresh prayer times (manual refresh)
   */
  const refreshPrayerTimes = async () => {
    await fetchPrayerTimes()
  }

  /**
   * Set location and cache it
   */
  const setLocation = (newLocation: Location) => {
    setLocationState(newLocation)
    storage.saveString("prayer.location", JSON.stringify(newLocation))
  }

  /**
   * Get next upcoming prayer
   */
  const getNextPrayer = (): PrayerTime | null => {
    const now = Date.now()
    return prayerTimes.find((prayer) => prayer.timestamp > now) || null
  }

  /**
   * Get current prayer (most recent past prayer)
   */
  const getCurrentPrayer = (): PrayerTime | null => {
    const now = Date.now()
    const pastPrayers = prayerTimes.filter((prayer) => prayer.timestamp <= now)
    return pastPrayers[pastPrayers.length - 1] || null
  }

  /**
   * Load prayer tracking from storage
   */
  const loadPrayerTracking = async () => {
    try {
      const cachedTracking = storage.loadString("prayer.tracking")
      if (cachedTracking) {
        setPrayerTracking(JSON.parse(cachedTracking))
      }
    } catch (err) {
      console.error("Failed to load prayer tracking:", err)
    }
  }

  /**
   * Save prayer tracking to storage
   */
  const savePrayerTracking = (tracking: PrayerTrackingRecord) => {
    try {
      storage.saveString("prayer.tracking", JSON.stringify(tracking))
    } catch (err) {
      console.error("Failed to save prayer tracking:", err)
    }
  }

  /**
   * Generate tracking key from prayer name and date
   */
  const getTrackingKey = (prayerName: string, date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}:${prayerName}`
  }

  /**
   * Get prayer status for a specific date
   */
  const getPrayerStatus = (prayerName: string, date: Date): PrayerTrackingStatus => {
    const key = getTrackingKey(prayerName, date)
    return prayerTracking[key] || PrayerTrackingStatus.NONE
  }

  /**
   * Set prayer status for a specific date
   */
  const setPrayerStatus = (prayerName: string, date: Date, status: PrayerTrackingStatus) => {
    const key = getTrackingKey(prayerName, date)
    const newTracking = { ...prayerTracking }

    if (status === PrayerTrackingStatus.NONE) {
      delete newTracking[key]
    } else {
      newTracking[key] = status
    }

    setPrayerTracking(newTracking)
    savePrayerTracking(newTracking)
  }

  /**
   * Cycle through prayer statuses: NONE -> DONE -> LATE -> MISSED -> NONE
   * Integrated with stats/gamification system
   */
  const cyclePrayerStatus = (prayerName: string, date: Date): PrayerTrackingStatus => {
    const currentStatus = getPrayerStatus(prayerName, date)
    let newStatus: PrayerTrackingStatus

    switch (currentStatus) {
      case PrayerTrackingStatus.NONE:
        newStatus = PrayerTrackingStatus.DONE
        break
      case PrayerTrackingStatus.DONE:
        newStatus = PrayerTrackingStatus.LATE
        break
      case PrayerTrackingStatus.LATE:
        newStatus = PrayerTrackingStatus.MISSED
        break
      case PrayerTrackingStatus.MISSED:
        newStatus = PrayerTrackingStatus.NONE
        break
      default:
        newStatus = PrayerTrackingStatus.NONE
    }

    // Update prayer status
    setPrayerStatus(prayerName, date, newStatus)

    // Handle stats integration and award points
    handlePrayerStatusChange(prayerName, date, newStatus, currentStatus)
      .then((points) => {
        if (points > 0) {
          const message = getPointsMessage(prayerName, newStatus, points)
          if (message) {
            // Show success alert with points
            Alert.alert("Prayer Marked! 🎉", message, [{ text: "OK" }])
          }
        }
      })
      .catch((error) => {
        console.error("Failed to update prayer stats:", error)
      })

    return newStatus
  }

  const value: PrayerContextValue = {
    prayerTimes,
    loading,
    error,
    location,
    setLocation,
    prayerTracking,
    getPrayerStatus,
    setPrayerStatus,
    cyclePrayerStatus,
    refreshPrayerTimes,
    getNextPrayer,
    getCurrentPrayer,
  }

  return <PrayerContext.Provider value={value}>{children}</PrayerContext.Provider>
}

/**
 * Hook to use Prayer Context
 */
export const usePrayer = () => {
  const context = useContext(PrayerContext)
  if (context === undefined) {
    throw new Error("usePrayer must be used within a PrayerProvider")
  }
  return context
}
