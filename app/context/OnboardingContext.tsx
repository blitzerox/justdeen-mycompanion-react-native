/**
 * Onboarding Context
 *
 * Manages the onboarding flow state using @onboardjs/react
 * Handles first-time user experience and configuration
 */
import React, { createContext, useContext, useCallback, useEffect, useState } from "react"
import { OnboardingProvider as OnboardJSProvider, useOnboarding as useOnboardJS } from "@onboardjs/react"
import AsyncStorage from "@react-native-async-storage/async-storage"

const ONBOARDING_COMPLETE_KEY = "@justdeen/onboarding_complete"
const ONBOARDING_DATA_KEY = "@justdeen/onboarding_data"

// Step types for the onboarding flow
export type OnboardingStepType =
  | "WELCOME"
  | "PRIVACY"
  | "FEATURES"
  | "LOCATION"
  | "PRAYER_SETTINGS"
  | "THEME"
  | "COMPLETE"

// Data collected during onboarding
export interface OnboardingData {
  locationEnabled?: boolean
  calculationMethod?: number
  madhab?: number
  theme?: "light" | "dark" | "system"
}

// Define the onboarding steps
export const onboardingSteps = [
  {
    id: "welcome",
    type: "WELCOME" as const,
    payload: {
      title: "Assalamu Alaikum",
      subtitle: "Welcome to JustDeen",
      description: "Your companion for prayer, Quran, and spiritual growth",
    },
  },
  {
    id: "privacy",
    type: "PRIVACY" as const,
    payload: {
      title: "Privacy by Design",
      features: [
        { icon: "shield-check", text: "No ads, ever" },
        { icon: "lock", text: "Your data stays on your device" },
        { icon: "eye-off", text: "No tracking or analytics" },
        { icon: "server-off", text: "Works offline" },
      ],
    },
  },
  {
    id: "features",
    type: "FEATURES" as const,
    payload: {
      title: "Everything You Need",
      features: [
        { icon: "clock", text: "Accurate prayer times", color: "pray" },
        { icon: "book-open", text: "Complete Quran with translations", color: "read" },
        { icon: "compass", text: "Qibla direction finder", color: "pray" },
        { icon: "robot", text: "Islamic AI assistant", color: "ai" },
        { icon: "hand", text: "Tasbih counter & dhikr", color: "home" },
      ],
    },
  },
  {
    id: "location",
    type: "LOCATION" as const,
    payload: {
      title: "Location Services",
      description: "We need your location to calculate accurate prayer times and Qibla direction for your area.",
      note: "Your location is never shared or stored on any server.",
    },
  },
  {
    id: "prayer-settings",
    type: "PRAYER_SETTINGS" as const,
    payload: {
      title: "Prayer Settings",
      description: "Configure your prayer time calculation preferences",
    },
  },
  {
    id: "theme",
    type: "THEME" as const,
    payload: {
      title: "Choose Your Theme",
      description: "Select your preferred appearance",
    },
  },
  {
    id: "complete",
    type: "COMPLETE" as const,
    payload: {
      title: "You're All Set!",
      description: "Begin your spiritual journey with JustDeen",
    },
  },
]

// Context type
interface OnboardingContextType {
  isOnboardingComplete: boolean
  isLoading: boolean
  showOnboarding: boolean
  onboardingData: OnboardingData
  startOnboarding: () => void
  completeOnboarding: () => Promise<void>
  resetOnboarding: () => Promise<void>
  updateOnboardingData: (data: Partial<OnboardingData>) => void
  setShowOnboarding: (show: boolean) => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

/**
 * Hook to access onboarding context
 */
export const useOnboardingContext = () => {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error("useOnboardingContext must be used within OnboardingContextProvider")
  }
  return context
}

/**
 * Provider component for onboarding state
 */
export const OnboardingContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({})

  // Check if onboarding has been completed
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY)
        const savedData = await AsyncStorage.getItem(ONBOARDING_DATA_KEY)

        setIsOnboardingComplete(completed === "true")
        if (savedData) {
          setOnboardingData(JSON.parse(savedData))
        }

        // Show onboarding if not complete
        if (completed !== "true") {
          setShowOnboarding(true)
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkOnboardingStatus()
  }, [])

  const startOnboarding = useCallback(() => {
    setShowOnboarding(true)
  }, [])

  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true")
      await AsyncStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(onboardingData))
      setIsOnboardingComplete(true)
      setShowOnboarding(false)
    } catch (error) {
      console.error("Error completing onboarding:", error)
    }
  }, [onboardingData])

  const resetOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY)
      await AsyncStorage.removeItem(ONBOARDING_DATA_KEY)
      setIsOnboardingComplete(false)
      setOnboardingData({})
      setShowOnboarding(true)
    } catch (error) {
      console.error("Error resetting onboarding:", error)
    }
  }, [])

  const updateOnboardingData = useCallback((data: Partial<OnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...data }))
  }, [])

  const value: OnboardingContextType = {
    isOnboardingComplete,
    isLoading,
    showOnboarding,
    onboardingData,
    startOnboarding,
    completeOnboarding,
    resetOnboarding,
    updateOnboardingData,
    setShowOnboarding,
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

export { useOnboardJS }
