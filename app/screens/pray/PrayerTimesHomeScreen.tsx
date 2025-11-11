/**
 * Prayer Times Home Screen
 *
 * CRITICAL - P0 Feature
 * Displays:
 * - Current prayer time and countdown to next prayer
 * - Today's 5 prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha)
 * - Location-based calculation
 * - Prayer logging (mark as prayed)
 * - Quick access to Qibla compass
 *
 * Requirements:
 * - ±1 minute accuracy requirement
 * - AlAdhan API integration
 * - MMKV caching for offline support
 */
import React, { useEffect, useState } from "react"
import { View, ViewStyle, TextStyle, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { Screen, Text, Icon } from "@/components"
import { useAppTheme } from "@/theme/context"
import { usePrayer } from "@/context/PrayerContext"
import type { PrayStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme/types"
import { getCurrentLocation, requestLocationPermission } from "@/services/location/locationService"

interface TimeRemaining {
  hours: number
  minutes: number
  seconds: number
}

export const PrayerTimesHomeScreen: React.FC<PrayStackScreenProps<"PrayerTimesHome">> = ({
  navigation,
}) => {
  const { themed, theme: { colors, spacing } } = useAppTheme()
  const { prayerTimes, loading, error, setLocation, getNextPrayer, refreshPrayerTimes } = usePrayer()

  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null)
  const [loadingLocation, setLoadingLocation] = useState(false)

  // Request location on mount
  useEffect(() => {
    requestLocation()
  }, [])

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      updateCountdown()
    }, 1000)

    return () => clearInterval(interval)
  }, [prayerTimes])

  const requestLocation = async () => {
    setLoadingLocation(true)
    try {
      const hasPermission = await requestLocationPermission()
      if (!hasPermission) {
        Alert.alert(
          "Location Permission Required",
          "Please enable location access to get accurate prayer times for your area."
        )
        setLoadingLocation(false)
        return
      }

      const coords = await getCurrentLocation()
      setLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        name: `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`,
      })
    } catch (err) {
      console.error("Location error:", err)
      Alert.alert("Location Error", "Could not get your location. Please try again.")
    } finally {
      setLoadingLocation(false)
    }
  }

  const updateCountdown = () => {
    const nextPrayer = getNextPrayer()
    if (!nextPrayer) {
      setTimeRemaining(null)
      return
    }

    const now = Date.now()
    const diff = nextPrayer.timestamp - now

    if (diff <= 0) {
      setTimeRemaining(null)
      return
    }

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    setTimeRemaining({ hours, minutes, seconds })
  }

  const formatTime = (time: string) => {
    // Convert 24h to 12h format
    const [hours, minutes] = time.split(":")
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const nextPrayer = getNextPrayer()
  const isLoading = loading || loadingLocation

  return (
    <Screen preset="scroll" contentContainerStyle={themed($container)}>
      {/* Header Section */}
      <View style={themed($header)}>
        <View style={themed($locationContainer)}>
          <Icon icon="community" size={16} color={colors.textDim} />
          <Text size="sm" style={themed($locationText)}>
            {loadingLocation ? "Getting location..." : "Current Location"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={refreshPrayerTimes}
          style={themed($refreshButton)}
          disabled={isLoading}
        >
          <Icon icon="settings" size={20} color={colors.pray} />
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={colors.pray} />
          <Text style={themed($loadingText)}>
            {loadingLocation ? "Getting your location..." : "Loading prayer times..."}
          </Text>
        </View>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <View style={themed($errorContainer)}>
          <Text style={themed($errorText)}>{error}</Text>
          <TouchableOpacity onPress={requestLocation} style={themed($retryButton)}>
            <Text style={themed($retryButtonText)}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Next Prayer Countdown */}
      {nextPrayer && timeRemaining && !isLoading && (
        <View style={themed($nextPrayerCard)}>
          <Text size="sm" style={themed($nextPrayerLabel)}>
            Next Prayer
          </Text>
          <Text style={themed($nextPrayerName)}>{nextPrayer.name}</Text>
          <Text style={themed($nextPrayerTime)}>{formatTime(nextPrayer.time)}</Text>

          <View style={themed($countdownContainer)}>
            <View style={themed($countdownBox)}>
              <Text style={themed($countdownNumber)}>{String(timeRemaining.hours).padStart(2, "0")}</Text>
              <Text style={themed($countdownLabel)}>Hours</Text>
            </View>
            <Text style={themed($countdownSeparator)}>:</Text>
            <View style={themed($countdownBox)}>
              <Text style={themed($countdownNumber)}>{String(timeRemaining.minutes).padStart(2, "0")}</Text>
              <Text style={themed($countdownLabel)}>Min</Text>
            </View>
            <Text style={themed($countdownSeparator)}>:</Text>
            <View style={themed($countdownBox)}>
              <Text style={themed($countdownNumber)}>{String(timeRemaining.seconds).padStart(2, "0")}</Text>
              <Text style={themed($countdownLabel)}>Sec</Text>
            </View>
          </View>
        </View>
      )}

      {/* Prayer Times List */}
      {prayerTimes.length > 0 && !isLoading && (
        <View style={themed($prayerTimesContainer)}>
          <Text style={themed($sectionTitle)}>Today's Prayer Times</Text>

          {prayerTimes.map((prayer, index) => {
            const isNext = nextPrayer?.name === prayer.name
            const isPast = prayer.timestamp < Date.now()

            return (
              <View
                key={prayer.name}
                style={themed([
                  $prayerTimeRow,
                  isNext && $prayerTimeRowNext,
                  isPast && $prayerTimeRowPast,
                ])}
              >
                <View style={themed($prayerTimeLeft)}>
                  <View
                    style={themed([
                      $prayerDot,
                      isNext && $prayerDotNext,
                      isPast && $prayerDotPast,
                    ])}
                  />
                  <Text
                    style={themed([
                      $prayerName,
                      isNext && $prayerNameNext,
                      isPast && $prayerNamePast,
                    ])}
                  >
                    {prayer.name}
                  </Text>
                </View>

                <Text
                  style={themed([
                    $prayerTime,
                    isNext && $prayerTimeNext,
                    isPast && $prayerTimePast,
                  ])}
                >
                  {formatTime(prayer.time)}
                </Text>
              </View>
            )
          })}
        </View>
      )}

      {/* Quick Actions */}
      {!isLoading && prayerTimes.length > 0 && (
        <View style={themed($quickActions)}>
          <TouchableOpacity
            style={themed($actionButton)}
            onPress={() => navigation.navigate("QiblaCompass")}
          >
            <Icon icon="components" size={24} color={colors.pray} />
            <Text style={themed($actionButtonText)}>Qibla</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={themed($actionButton)}
            onPress={() => navigation.navigate("PrayerTimingSettings")}
          >
            <Icon icon="settings" size={24} color={colors.pray} />
            <Text style={themed($actionButtonText)}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={themed($actionButton)}
            onPress={() => navigation.navigate("IslamicCalendar")}
          >
            <Icon icon="community" size={24} color={colors.pray} />
            <Text style={themed($actionButtonText)}>Calendar</Text>
          </TouchableOpacity>
        </View>
      )}
    </Screen>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.lg,
})

const $locationContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
})

const $locationText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $refreshButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.xs,
})

const $loadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.xxl,
})

const $loadingText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.md,
})

const $errorContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.errorBackground,
  padding: spacing.lg,
  borderRadius: 12,
  alignItems: "center",
})

const $errorText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  textAlign: "center",
  marginBottom: spacing.md,
})

const $retryButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.error,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.sm,
  borderRadius: 8,
})

const $retryButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.white,
  fontWeight: "600",
})

const $nextPrayerCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.pray,
  padding: spacing.xl,
  borderRadius: 16,
  alignItems: "center",
  marginBottom: spacing.xl,
})

const $nextPrayerLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.white,
  opacity: 0.8,
  textTransform: "uppercase",
  letterSpacing: 1,
})

const $nextPrayerName: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.palette.white,
  fontSize: 34,
  fontWeight: "700",
  marginTop: spacing.xs,
})

const $nextPrayerTime: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.palette.white,
  fontSize: 24,
  fontWeight: "600",
  marginBottom: spacing.lg,
})

const $countdownContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
})

const $countdownBox: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  padding: spacing.md,
  borderRadius: 12,
  alignItems: "center",
  minWidth: 70,
})

const $countdownNumber: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.white,
  fontSize: 28,
  fontWeight: "700",
})

const $countdownLabel: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.palette.white,
  opacity: 0.8,
  fontSize: 12,
  marginTop: spacing.xxs,
})

const $countdownSeparator: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.white,
  fontSize: 28,
  fontWeight: "700",
})

const $prayerTimesContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xl,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 20,
  fontWeight: "600",
  color: colors.text,
  marginBottom: spacing.md,
})

const $prayerTimeRow: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.md,
  borderRadius: 12,
  marginBottom: spacing.xs,
  backgroundColor: colors.palette.neutral100,
})

const $prayerTimeRowNext: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.pray,
})

const $prayerTimeRowPast: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.5,
})

const $prayerTimeLeft: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
})

const $prayerDot: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: colors.textDim,
})

const $prayerDotNext: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.white,
})

const $prayerDotPast: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.5,
})

const $prayerName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 17,
  fontWeight: "600",
  color: colors.text,
})

const $prayerNameNext: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.white,
})

const $prayerNamePast: ThemedStyle<TextStyle> = () => ({
  opacity: 0.7,
})

const $prayerTime: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 17,
  fontWeight: "600",
  color: colors.text,
})

const $prayerTimeNext: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.white,
})

const $prayerTimePast: ThemedStyle<TextStyle> = () => ({
  opacity: 0.7,
})

const $quickActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-around",
  paddingVertical: spacing.md,
})

const $actionButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  gap: spacing.xs,
})

const $actionButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.text,
  fontWeight: "500",
})
