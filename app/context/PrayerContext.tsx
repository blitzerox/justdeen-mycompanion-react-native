/**
 * Prayer Context
 * Manages prayer times, location, and prayer-related state
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { aladhanApi, PrayerTime } from "../services/prayer/aladhanApi"
import * as storage from "../utils/storage"

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

  // Load cached data on mount
  useEffect(() => {
    loadCachedData()
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

  const value: PrayerContextValue = {
    prayerTimes,
    loading,
    error,
    location,
    setLocation,
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
