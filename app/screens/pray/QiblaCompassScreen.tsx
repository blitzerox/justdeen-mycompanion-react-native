/**
 * Qibla Compass Screen
 *
 * CRITICAL - P0 Feature
 * Requirements: ±1 degree accuracy requirement
 *
 * Displays compass pointing to Qibla direction (Kaaba in Mecca)
 * Uses device magnetometer + GPS location to calculate direction
 */
import React, { useEffect, useState } from "react"
import { View, ViewStyle, TextStyle, ActivityIndicator, Alert, Animated } from "react-native"
import { Screen, Text } from "@/components"
import { useAppTheme } from "@/theme/context"
import type { PrayStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme/types"
import { getCurrentLocation, requestLocationPermission } from "@/services/location/locationService"
import { aladhanApi } from "@/services/prayer/aladhanApi"
import { Magnetometer } from "expo-sensors"

const KAABA_LAT = 21.4225
const KAABA_LNG = 39.8262

export const QiblaCompassScreen: React.FC<PrayStackScreenProps<"QiblaCompass">> = () => {
  const { themed, theme: { colors } } = useAppTheme()

  const [loading, setLoading] = useState(true)
  const [qiblaDirection, setQiblaDirection] = useState<number>(0)
  const [deviceHeading, setDeviceHeading] = useState<number>(0)
  const [locationName, setLocationName] = useState<string>("")
  const [compassRotation] = useState(new Animated.Value(0))

  useEffect(() => {
    initializeQibla()

    // Subscribe to magnetometer
    const subscription = Magnetometer.addListener((data) => {
      // Calculate heading from magnetometer data
      const heading = Math.atan2(data.y, data.x) * (180 / Math.PI)
      const normalizedHeading = (heading + 360) % 360
      setDeviceHeading(normalizedHeading)

      // Animate compass rotation
      const rotation = normalizedHeading - qiblaDirection
      Animated.spring(compassRotation, {
        toValue: rotation,
        useNativeDriver: true,
        friction: 8,
      }).start()
    })

    // Set magnetometer update interval
    Magnetometer.setUpdateInterval(100)

    return () => {
      subscription && subscription.remove()
    }
  }, [qiblaDirection])

  const initializeQibla = async () => {
    try {
      // Request location permission
      const hasPermission = await requestLocationPermission()
      if (!hasPermission) {
        Alert.alert(
          "Location Permission Required",
          "Please enable location access to calculate Qibla direction."
        )
        setLoading(false)
        return
      }

      // Get current location
      const coords = await getCurrentLocation()
      setLocationName(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`)

      // Calculate Qibla direction
      const direction = calculateQiblaDirection(coords.latitude, coords.longitude)
      setQiblaDirection(direction)

    } catch (err) {
      console.error("Qibla initialization error:", err)
      Alert.alert("Error", "Could not calculate Qibla direction. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  /**
   * Calculate Qibla direction from given coordinates
   * Uses great circle bearing formula
   */
  const calculateQiblaDirection = (lat: number, lng: number): number => {
    const toRad = (deg: number) => (deg * Math.PI) / 180
    const toDeg = (rad: number) => (rad * 180) / Math.PI

    const lat1 = toRad(lat)
    const lng1 = toRad(lng)
    const lat2 = toRad(KAABA_LAT)
    const lng2 = toRad(KAABA_LNG)

    const dLng = lng2 - lng1

    const y = Math.sin(dLng) * Math.cos(lat2)
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)

    const bearing = toDeg(Math.atan2(y, x))
    return (bearing + 360) % 360
  }

  const qiblaAngle = (qiblaDirection - deviceHeading + 360) % 360
  const isAligned = Math.abs(qiblaAngle) < 5 || Math.abs(qiblaAngle) > 355

  return (
    <Screen preset="fixed" contentContainerStyle={themed($container)}>
      {loading ? (
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={colors.pray} />
          <Text style={themed($loadingText)}>Calculating Qibla direction...</Text>
        </View>
      ) : (
        <View style={themed($content)}>
          {/* Location Info */}
          <View style={themed($locationInfo)}>
            <Text size="xs" style={themed($locationLabel)}>Your Location</Text>
            <Text style={themed($locationText)}>{locationName}</Text>
          </View>

          {/* Compass */}
          <View style={themed($compassContainer)}>
            {/* Compass Background Circle */}
            <View style={themed($compassCircle)}>
              {/* Cardinal Directions */}
              <Text style={themed([$cardinalText, { top: 10 }])}>N</Text>
              <Text style={themed([$cardinalText, { right: 10 }])}>E</Text>
              <Text style={themed([$cardinalText, { bottom: 10 }])}>S</Text>
              <Text style={themed([$cardinalText, { left: 10 }])}>W</Text>

              {/* Qibla Arrow */}
              <Animated.View
                style={[
                  themed($qiblaArrow),
                  {
                    transform: [{ rotate: `${qiblaDirection}deg` }],
                  },
                ]}
              >
                <View style={themed($arrowHead)} />
                <View style={themed($arrowBody)} />
              </Animated.View>

              {/* Center Dot */}
              <View style={themed($centerDot)} />
            </View>

            {/* Kaaba Icon (always points to Qibla) */}
            <View
              style={themed([
                $kaabaIcon,
                isAligned && $kaabaIconAligned
              ])}
            >
              <Text style={themed($kaabaText)}>🕋</Text>
            </View>
          </View>

          {/* Direction Info */}
          <View style={themed($directionInfo)}>
            <View style={themed($directionBox)}>
              <Text style={themed($directionLabel)}>Qibla Direction</Text>
              <Text style={themed($directionValue)}>{Math.round(qiblaDirection)}°</Text>
            </View>

            <View style={themed($directionBox)}>
              <Text style={themed($directionLabel)}>Your Heading</Text>
              <Text style={themed($directionValue)}>{Math.round(deviceHeading)}°</Text>
            </View>
          </View>

          {/* Alignment Indicator */}
          {isAligned && (
            <View style={themed($alignedContainer)}>
              <Text style={themed($alignedText)}>✓ Aligned with Qibla</Text>
            </View>
          )}

          {/* Instructions */}
          <Text style={themed($instructions)}>
            Hold your device flat and rotate until the green arrow points to the Kaaba icon
          </Text>
        </View>
      )}
    </Screen>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $loadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.xxl,
})

const $loadingText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.md,
})

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.xl,
})

const $locationInfo: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  marginBottom: spacing.xl,
})

const $locationLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  textTransform: "uppercase",
  letterSpacing: 1,
})

const $locationText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 17,
  fontWeight: "600",
  marginTop: spacing.xxs,
})

const $compassContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  justifyContent: "center",
  marginVertical: spacing.xl,
})

const $compassCircle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 280,
  height: 280,
  borderRadius: 140,
  borderWidth: 2,
  borderColor: colors.border,
  backgroundColor: colors.palette.neutral100,
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
})

const $cardinalText: ThemedStyle<TextStyle> = ({ colors }) => ({
  position: "absolute",
  fontSize: 18,
  fontWeight: "700",
  color: colors.textDim,
})

const $qiblaArrow: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  alignItems: "center",
})

const $arrowHead: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 0,
  height: 0,
  borderLeftWidth: 12,
  borderRightWidth: 12,
  borderBottomWidth: 24,
  borderLeftColor: "transparent",
  borderRightColor: "transparent",
  borderBottomColor: colors.pray,
})

const $arrowBody: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 8,
  height: 100,
  backgroundColor: colors.pray,
})

const $centerDot: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  width: 12,
  height: 12,
  borderRadius: 6,
  backgroundColor: colors.pray,
})

const $kaabaIcon: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  position: "absolute",
  top: -40,
  backgroundColor: colors.palette.white,
  padding: spacing.sm,
  borderRadius: 30,
  borderWidth: 3,
  borderColor: colors.pray,
})

const $kaabaIconAligned: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.palette.angry500,
  backgroundColor: colors.palette.angry100,
})

const $kaabaText: ThemedStyle<TextStyle> = () => ({
  fontSize: 32,
})

const $directionInfo: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.md,
  marginTop: spacing.xl,
})

const $directionBox: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  padding: spacing.md,
  borderRadius: 12,
  alignItems: "center",
  minWidth: 120,
})

const $directionLabel: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  fontSize: 13,
  marginBottom: spacing.xxs,
})

const $directionValue: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 24,
  fontWeight: "700",
})

const $alignedContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.angry100,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.sm,
  borderRadius: 20,
  marginTop: spacing.lg,
})

const $alignedText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.angry500,
  fontSize: 17,
  fontWeight: "600",
})

const $instructions: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  fontSize: 15,
  textAlign: "center",
  lineHeight: 22,
  marginTop: spacing.xl,
  paddingHorizontal: spacing.md,
})
