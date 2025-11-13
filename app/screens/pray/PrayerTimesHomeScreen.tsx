/**
 * Prayer Times Home Screen
 *
 * CRITICAL - P0 Feature
 * Calendar/Timeline view for prayer times
 * - Weekly calendar strip at top
 * - Timeline view showing prayer times
 * - Quick action buttons
 * - Location-based calculation
 * - Prayer completion tracking
 */
import React, { useEffect, useState, useRef } from "react"
import {
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
  Modal,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  Animated,
  Linking,
} from "react-native"
import { Screen, Text, Icon } from "@/components"
import { useAppTheme } from "@/theme/context"
import { useAuth } from "@/context/AuthContext"
import { usePrayer } from "@/context/PrayerContext"
import { FontAwesome6 } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { DrawerNavigationProp } from "@react-navigation/drawer"
import type { PrayStackScreenProps } from "@/navigators"
import type { DrawerParamList } from "@/navigators/navigationTypes"
import type { ThemedStyle } from "@/theme/types"
import { getCurrentLocation, requestLocationPermission, checkLocationPermission, LocationPermissionStatus } from "@/services/location/locationService"
import { aladhanApi, PrayerTime } from "@/services/prayer/aladhanApi"
import { PrayerTrackingStatus } from "@/types/prayer"

const { width } = Dimensions.get("window")

interface WeekDay {
  dayOfWeek: string
  date: number | null  // null for empty cells
  isToday: boolean
  fullDate: Date | null  // null for empty cells
  hasEvents: boolean
  isEmpty: boolean
}

export const PrayerTimesHomeScreen: React.FC<PrayStackScreenProps<"PrayerTimesHome">> = ({
  navigation,
}) => {
  const { themed, theme: { colors } } = useAppTheme()
  const { user, isAuthenticated } = useAuth()
  const { location, setLocation, getNextPrayer, getPrayerStatus, cyclePrayerStatus } = usePrayer()
  const drawerNavigation = useNavigation<DrawerNavigationProp<DrawerParamList>>()

  const [loadingLocation, setLoadingLocation] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>("undetermined")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [weekDays, setWeekDays] = useState<WeekDay[]>([])
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [showYearPicker, setShowYearPicker] = useState(false)
  const [weekStartDate, setWeekStartDate] = useState(new Date())

  // Prayer times state (separate from context to handle date selection)
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Animation state for swipe gesture
  const translateX = useRef(new Animated.Value(0)).current
  const [isAnimating, setIsAnimating] = useState(false)

  // Check permission and request location on mount
  useEffect(() => {
    checkAndRequestLocation()
  }, [])

  const checkAndRequestLocation = async () => {
    const status = await checkLocationPermission()
    setPermissionStatus(status)

    if (status === "granted") {
      requestLocation()
    } else if (status === "undetermined") {
      // Auto-request if permission not yet determined
      requestLocation()
    }
    // If denied, show UI card (handled in render)
  }

  // Generate week days when week start date changes
  useEffect(() => {
    generateWeekDays()
  }, [weekStartDate])

  // Fetch prayer times when selected date or location changes
  useEffect(() => {
    if (location) {
      fetchPrayerTimesForDate(selectedDate)
    }
  }, [selectedDate, location])

  const requestLocation = async () => {
    setLoadingLocation(true)
    setError(null)
    try {
      const hasPermission = await requestLocationPermission()

      // Update permission status after request
      const status = await checkLocationPermission()
      setPermissionStatus(status)

      if (!hasPermission) {
        const errorMsg = "Location permission is required to get accurate prayer times for your area."
        setError(errorMsg)
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
      const errorMsg = err instanceof Error ? err.message : "Could not get your location. Please check your location settings and try again."
      setError(errorMsg)
    } finally {
      setLoadingLocation(false)
    }
  }

  const openSettings = () => {
    Linking.openSettings()
  }

  /**
   * Fetch prayer times for a specific date
   */
  const fetchPrayerTimesForDate = async (date: Date) => {
    if (!location) return

    setLoading(true)
    setError(null)

    try {
      const formattedDate = formatDateForAPI(date)
      const response = await aladhanApi.getPrayerTimes({
        latitude: location.latitude,
        longitude: location.longitude,
        date: formattedDate,
      })

      const times = aladhanApi.parsePrayerTimes(response)
      setPrayerTimes(times)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch prayer times"
      setError(errorMessage)
      console.error("Prayer times fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Format date to DD-MM-YYYY for AlAdhan API
   */
  const formatDateForAPI = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }

  /**
   * Generate week days - always shows 7 days (Sun-Sat) with empty cells for days outside the month
   */
  const generateWeekDays = () => {
    const today = new Date()
    const days: WeekDay[] = []
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    // Find the Sunday of the week containing weekStartDate
    const weekStart = new Date(weekStartDate)
    const dayOfWeek = weekStart.getDay() // 0 = Sunday, 1 = Monday, etc.
    weekStart.setDate(weekStart.getDate() - dayOfWeek) // Move to Sunday

    // Get the first and last day of the current month
    const currentMonth = weekStartDate.getMonth()
    const currentYear = weekStartDate.getFullYear()
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)

    // Generate 7 slots (Sun-Sat)
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart)
      currentDate.setDate(weekStart.getDate() + i)

      // Check if this date is within the current month
      const isInMonth = currentDate >= firstDayOfMonth && currentDate <= lastDayOfMonth

      if (isInMonth) {
        // Cell with actual date
        days.push({
          dayOfWeek: dayNames[i],
          date: currentDate.getDate(),
          isToday: currentDate.toDateString() === today.toDateString(),
          fullDate: currentDate,
          hasEvents: true, // All days have prayers
          isEmpty: false,
        })
      } else {
        // Empty cell
        days.push({
          dayOfWeek: dayNames[i],
          date: null,
          isToday: false,
          fullDate: null,
          hasEvents: false,
          isEmpty: true,
        })
      }
    }

    setWeekDays(days)
  }

  /**
   * Handle date selection
   */
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  /**
   * Navigate to previous week
   */
  const navigateToPreviousWeek = () => {
    const newStartDate = new Date(weekStartDate)
    newStartDate.setDate(weekStartDate.getDate() - 7)
    setWeekStartDate(newStartDate)
  }

  /**
   * Navigate to next week
   */
  const navigateToNextWeek = () => {
    const newStartDate = new Date(weekStartDate)
    newStartDate.setDate(weekStartDate.getDate() + 7)
    setWeekStartDate(newStartDate)
  }

  /**
   * Pan responder for swipe gestures on week strip with animation
   */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isAnimating,
      onMoveShouldSetPanResponder: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        // Only respond to horizontal swipes
        return !isAnimating && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10
      },
      onPanResponderGrant: () => {
        // Stop any ongoing animations when user starts touching
        translateX.stopAnimation()
      },
      onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        // Update position in real-time as user drags
        // Add resistance at the edges for natural feel (rubber band effect)
        const resistance = 0.5
        const movement = gestureState.dx * resistance
        translateX.setValue(movement)
      },
      onPanResponderRelease: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const threshold = 80 // Minimum swipe distance to trigger week change
        const velocity = gestureState.vx // Velocity of the swipe

        if (Math.abs(gestureState.dx) > threshold || Math.abs(velocity) > 0.5) {
          // Swipe is significant enough to trigger week change
          setIsAnimating(true)

          if (gestureState.dx > 0 || velocity > 0) {
            // Swipe right - show previous week
            animateWeekChange(width, navigateToPreviousWeek)
          } else {
            // Swipe left - show next week
            animateWeekChange(-width, navigateToNextWeek)
          }
        } else {
          // Snap back to original position
          animateSnapBack()
        }
      },
      onPanResponderTerminate: () => {
        // If gesture is cancelled, snap back
        animateSnapBack()
      },
    })
  ).current

  /**
   * Animate week change with smooth slide transition
   */
  const animateWeekChange = (targetX: number, onComplete: () => void) => {
    // First, slide out to the target position
    Animated.spring(translateX, {
      toValue: targetX,
      velocity: 2,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start(() => {
      // Update the data
      onComplete()

      // Reset position instantly (this will show new week data)
      translateX.setValue(0)
      setIsAnimating(false)
    })
  }

  /**
   * Animate snap back to original position
   */
  const animateSnapBack = () => {
    Animated.spring(translateX, {
      toValue: 0,
      velocity: 2,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start(() => {
      setIsAnimating(false)
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const formatTimeRange = (time: string, durationMinutes: number = 15) => {
    const [hours, minutes] = time.split(":")
    const startHour = parseInt(hours, 10)
    const startMin = parseInt(minutes, 10)

    const endMin = startMin + durationMinutes
    const endHour = startHour + Math.floor(endMin / 60)
    const finalMin = endMin % 60

    const formatSingleTime = (h: number, m: number) => {
      const ampm = h >= 12 ? "PM" : "AM"
      const hour12 = h % 12 || 12
      return `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`
    }

    return `${formatSingleTime(startHour, startMin)} - ${formatSingleTime(endHour, finalMin)}`
  }

  const getPrayerIcon = (prayerName: string): any => {
    const icons: Record<string, any> = {
      Tahajjud: "moon",
      Imsak: "bell",
      Fajr: "sun",
      Sunrise: "sun",
      Dhuhr: "sun",
      Asr: "sun",
      Maghrib: "moon",
      Isha: "moon",
    }
    return icons[prayerName] || "heart"
  }

  const getPrayerColor = (prayerName: string, index: number): string => {
    const colors: Record<string, string> = {
      Tahajjud: "#64C7F0",  // Light Blue/Cyan
      Imsak: "#A78BFA",     // Purple
      Fajr: "#5856D6",      // SF Purple
      Sunrise: "#FFD60A",   // SF Yellow
      Dhuhr: "#34C759",     // SF Green
      Asr: "#FF9500",       // SF Orange
      Maghrib: "#FF6B6B",   // Red/Pink
      Isha: "#007AFF",      // SF Blue
    }
    return colors[prayerName] || "#4ECDC4"
  }

  const getTimeProgress = (time: string): number => {
    const [hours, minutes] = time.split(":")
    const prayerMinutes = parseInt(hours) * 60 + parseInt(minutes)
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    return (currentMinutes / 1440) * 100 // 1440 minutes in a day
  }

  const nextPrayer = getNextPrayer()
  const isLoading = loading || loadingLocation
  const currentMonth = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <Screen preset="fixed" safeAreaEdges={["top", "bottom"]} contentContainerStyle={themed($container(colors))}>
      {/* Custom Header */}
      <View style={themed($header)}>
        <View style={themed($headerLeft)}>
          <TouchableOpacity
            style={themed($hamburger(colors))}
            onPress={() => drawerNavigation.openDrawer()}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="bars" size={24} color={colors.pray} />
          </TouchableOpacity>
          <Text style={themed($greeting(colors))}>Pray</Text>
        </View>
        <View style={themed($headerRight)}>
          <TouchableOpacity
            style={themed($iconButton(colors))}
            onPress={() => navigation.navigate("TasbihCounter")}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="hand" size={20} color={colors.pray} solid />
          </TouchableOpacity>
          <TouchableOpacity
            style={themed($iconButton(colors))}
            onPress={() => navigation.navigate("QiblaCompass")}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="compass" size={20} color={colors.pray} solid />
          </TouchableOpacity>
          <TouchableOpacity
            style={themed($iconButton(colors))}
            onPress={() => navigation.navigate("IslamicCalendar")}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="calendar" size={20} color={colors.pray} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={themed($scrollView)}
        contentContainerStyle={themed($scrollContentContainer)}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        {/* Month and Year Header */}
        <View style={themed($monthYearHeader)}>
          <View style={themed($monthYearContainer)}>
            <TouchableOpacity onPress={() => setShowMonthPicker(true)} activeOpacity={0.7}>
              <Text style={themed($monthText(colors))}>
                {currentMonth.split(' ')[0]}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowYearPicker(true)} activeOpacity={0.7}>
              <Text style={themed($yearText(colors))}>{selectedDate.getFullYear()}</Text>
            </TouchableOpacity>
          </View>
          <Text style={themed($todayText(colors))}>Today</Text>
        </View>

        {/* Weekly Calendar Strip */}
        <View style={themed($weekStripContainer)} {...panResponder.panHandlers}>
          <Animated.View
            style={[
              themed($weekStrip),
              {
                transform: [{ translateX }],
              },
            ]}
          >
            {weekDays.map((day, index) => {
              const isSelected = day.fullDate && day.fullDate.toDateString() === selectedDate.toDateString()

              if (day.isEmpty) {
                // Empty cell - non-clickable
                return (
                  <View
                    key={index}
                    style={themed($dayButton(colors, false, false, true))}
                  >
                    <Text style={themed($dayText(colors, false, false, true))}>
                      {day.dayOfWeek}
                    </Text>
                  </View>
                )
              }

              // Normal cell with date
              return (
                <TouchableOpacity
                  key={index}
                  style={themed($dayButton(colors, day.isToday, isSelected, false))}
                  onPress={() => day.fullDate && handleDateSelect(day.fullDate)}
                  activeOpacity={0.7}
                >
                  <Text style={themed($dayText(colors, day.isToday, isSelected, false))}>
                    {day.dayOfWeek}
                  </Text>
                  <Text style={themed($dateText(colors, day.isToday, isSelected, false))}>
                    {day.date}
                  </Text>
                  {day.hasEvents && (
                    <View style={themed($eventDots)}>
                      <View style={themed($eventDot("#FF6B6B"))} />
                      <View style={themed($eventDot("#4ECDC4"))} />
                      <View style={themed($eventDot("#FFD93D"))} />
                      <View style={themed($eventDot("#6C5CE7"))} />
                      <View style={themed($eventDot("#A8E6CF"))} />
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
          </Animated.View>
        </View>

        {/* Location Permission Denied Card */}
        {permissionStatus === "denied" && !location && (
          <View style={themed($permissionCard(colors))}>
            <View style={themed($permissionIconContainer(colors))}>
              <FontAwesome6 name="location-crosshairs" size={32} color={colors.pray} />
            </View>
            <Text style={themed($permissionTitle(colors))}>Location Access Required</Text>
            <Text style={themed($permissionMessage(colors))}>
              We need your location to show accurate prayer times for your area. Please enable location
              access in your device settings.
            </Text>
            <TouchableOpacity
              style={themed($settingsButton(colors))}
              onPress={openSettings}
              activeOpacity={0.7}
            >
              <FontAwesome6 name="gear" size={16} color="#FFFFFF" />
              <Text style={themed($settingsButtonText)}>Open Settings</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading State */}
        {isLoading && (
          <View style={themed($loadingContainer)}>
            <ActivityIndicator size="large" color={colors.pray} />
            <Text style={themed($loadingText(colors))}>
              {loadingLocation ? "Getting your location..." : "Loading prayer times..."}
            </Text>
          </View>
        )}

        {/* Error State */}
        {error && !isLoading && permissionStatus !== "denied" && (
          <View style={themed($errorContainer(colors))}>
            <Text style={themed($errorText(colors))}>{error}</Text>
            <TouchableOpacity onPress={requestLocation} style={themed($retryButton(colors))}>
              <Text style={themed($retryButtonText)}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Prayer Times Timeline */}
        {!isLoading && prayerTimes.length > 0 && (
          <View style={themed($timeline)}>
            {prayerTimes.map((prayer, index) => {
              const isPast = prayer.timestamp < Date.now()
              const isNext = nextPrayer?.name === prayer.name
              const prayerColor = getPrayerColor(prayer.name, index)
              const timeProgress = getTimeProgress(prayer.time)
              const trackingStatus = getPrayerStatus(prayer.name, selectedDate)

              const handleDotPress = () => {
                if (prayer.isTrackable) {
                  cyclePrayerStatus(prayer.name, selectedDate)
                }
              }

              // Get icon color based on tracking status
              // Use background color for contrast against the filled circle
              const getStatusColor = () => {
                switch (trackingStatus) {
                  case PrayerTrackingStatus.DONE:
                    return "#34C759" // Green
                  case PrayerTrackingStatus.LATE:
                    return "#FFD60A" // Yellow
                  case PrayerTrackingStatus.MISSED:
                    return "#FF3B30" // Red
                  default:
                    return colors.background // Use background color for contrast
                }
              }

              return (
                <View key={prayer.name} style={themed($timelineRow)}>
                  {/* Timeline Line */}
                  <View style={themed($timelineLine)}>
                    <TouchableOpacity
                      style={themed($timelineDot(colors, trackingStatus, isNext, prayer.isTrackable))}
                      onPress={handleDotPress}
                      disabled={!prayer.isTrackable}
                      activeOpacity={0.7}
                    >
                      {prayer.isTrackable && trackingStatus === PrayerTrackingStatus.DONE ? (
                        <FontAwesome6 name="check" size={18} color={getStatusColor()} solid />
                      ) : prayer.isTrackable && trackingStatus === PrayerTrackingStatus.LATE ? (
                        <FontAwesome6 name="clock" size={18} color={getStatusColor()} solid />
                      ) : prayer.isTrackable && trackingStatus === PrayerTrackingStatus.MISSED ? (
                        <FontAwesome6 name="xmark" size={18} color={getStatusColor()} solid />
                      ) : null}
                    </TouchableOpacity>
                    {index < prayerTimes.length - 1 && (
                      <View style={themed($timelineConnector(colors))} />
                    )}
                  </View>

                  {/* Prayer Card */}
                  <View style={themed($prayerCard(colors, prayerColor, isPast, isNext))}>
                    <View style={themed($prayerIconContainer(prayerColor))}>
                      <Icon icon={getPrayerIcon(prayer.name)} size={28} color={prayerColor} />
                    </View>
                    <View style={themed($prayerInfoContainer)}>
                      <Text style={themed($prayerStartTime(colors, isPast))}>
                        {formatTime(prayer.time)}
                      </Text>
                      <View style={themed($prayerNameRow)}>
                        <Text style={themed($prayerCardName(colors, isPast))}>
                          {prayer.name}
                        </Text>
                        {prayer.isTrackable && (
                          <FontAwesome6 name="circle-check" size={10} color={colors.textDim} solid style={{ marginLeft: 6 }} />
                        )}
                      </View>
                      {prayer.endTime && (
                        <Text style={themed($prayerCardTimeRange(colors, isPast))}>
                          {formatTime(prayer.time)} - {formatTime(prayer.endTime)} {prayer.duration && `(${prayer.duration})`}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
        )}

        {/* Footer Spacer */}
        <View style={themed($footer)} />
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={themed($fabButton(colors))}
        onPress={() => fetchPrayerTimesForDate(selectedDate)}
        activeOpacity={0.8}
      >
        <Icon icon="refresh" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Month Picker Modal */}
      <Modal
        visible={showMonthPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <View style={themed($pickerModalOverlay)}>
          <View style={themed($pickerModalContent(colors))}>
            <View style={themed($pickerHeader)}>
              <Text style={themed($pickerTitle(colors))}>Select Month</Text>
              <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                <FontAwesome6 name="xmark" size={20} color={colors.textDim} />
              </TouchableOpacity>
            </View>
            <ScrollView style={themed($pickerScroll)}>
              {['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                <TouchableOpacity
                  key={month}
                  style={themed($pickerItem(colors))}
                  onPress={() => {
                    const newDate = new Date(selectedDate)
                    newDate.setMonth(index)
                    setSelectedDate(newDate)
                    setWeekStartDate(new Date(newDate))
                    setShowMonthPicker(false)
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={themed($pickerItemText(colors, selectedDate.getMonth() === index))}>
                    {month}
                  </Text>
                  {selectedDate.getMonth() === index && (
                    <FontAwesome6 name="check" size={16} color={colors.pray} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Year Picker Modal */}
      <Modal
        visible={showYearPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <View style={themed($pickerModalOverlay)}>
          <View style={themed($pickerModalContent(colors))}>
            <View style={themed($pickerHeader)}>
              <Text style={themed($pickerTitle(colors))}>Select Year</Text>
              <TouchableOpacity onPress={() => setShowYearPicker(false)}>
                <FontAwesome6 name="xmark" size={20} color={colors.textDim} />
              </TouchableOpacity>
            </View>
            <ScrollView style={themed($pickerScroll)}>
              {Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - 10 + i).map((year) => (
                <TouchableOpacity
                  key={year}
                  style={themed($pickerItem(colors))}
                  onPress={() => {
                    const newDate = new Date(selectedDate)
                    newDate.setFullYear(year)
                    setSelectedDate(newDate)
                    setWeekStartDate(new Date(newDate))
                    setShowYearPicker(false)
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={themed($pickerItemText(colors, selectedDate.getFullYear() === year))}>
                    {year}
                  </Text>
                  {selectedDate.getFullYear() === year && (
                    <FontAwesome6 name="check" size={16} color={colors.pray} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = (colors) => ({
  flex: 1,
  backgroundColor: colors.background,
})

// Header Styles
const $header: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 16,
  paddingTop: 8,
  paddingBottom: 16,
}

const $headerLeft: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
}

const $hamburger: ThemedStyle<ViewStyle> = (colors) => ({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: colors.pray + "20",
  alignItems: "center",
  justifyContent: "center",
})

const $avatar: ThemedStyle<ViewStyle> = (colors) => ({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: colors.pray + "20",
  alignItems: "center",
  justifyContent: "center",
})

const $greeting: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 24,
  fontWeight: "700",
  color: colors.text,
  lineHeight: 24,
})

const $headerSubtitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 13,
  color: colors.textDim,
  marginTop: 2,
})

const $headerRight: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  gap: 12,
}

const $iconButton: ThemedStyle<ViewStyle> = (colors) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.palette.surface,
  alignItems: "center",
  justifyContent: "center",
})

const $scrollView: ThemedStyle<ViewStyle> = {
  flex: 1,
}

const $scrollContentContainer: ThemedStyle<ViewStyle> = {
  flexGrow: 1,
  paddingBottom: 24,
}

const $monthYearHeader: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 20,
  paddingTop: 12,
  paddingBottom: 12,
}

const $monthYearContainer: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
}

const $monthText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 24,
  fontWeight: "700",
  color: colors.text,
})

const $yearText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 24,
  fontWeight: "700",
  color: colors.pray,
})

const $todayText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.pray,
})

const $weekStripContainer: ThemedStyle<ViewStyle> = {
  overflow: "hidden",
  paddingHorizontal: 12,
  paddingVertical: 12,
}

const $weekStrip: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  gap: 8,
}

const $dayButton: ThemedStyle<ViewStyle> = (colors, isToday: boolean, isSelected?: boolean, isEmpty?: boolean) => ({
  flex: 1,
  alignItems: "center",
  paddingVertical: 12,
  borderRadius: 12,
  backgroundColor: isEmpty ? "transparent" : isToday ? colors.pray : isSelected ? colors.pray + "30" : "transparent",
  borderWidth: isSelected && !isToday && !isEmpty ? 2 : 0,
  borderColor: isSelected && !isToday && !isEmpty ? colors.pray : "transparent",
  opacity: isEmpty ? 0.3 : 1,
})

const $dayText: ThemedStyle<TextStyle> = (colors, isToday: boolean, isSelected?: boolean, isEmpty?: boolean) => ({
  fontSize: 12,
  fontWeight: "500",
  color: isEmpty ? colors.textDim : isToday ? "#FFFFFF" : isSelected ? colors.pray : colors.textDim,
  marginBottom: isEmpty ? 0 : 4,
})

const $dateText: ThemedStyle<TextStyle> = (colors, isToday: boolean, isSelected?: boolean, isEmpty?: boolean) => ({
  fontSize: 16,
  fontWeight: "700",
  color: isEmpty ? "transparent" : isToday ? "#FFFFFF" : isSelected ? colors.pray : colors.text,
  marginBottom: 4,
})

const $eventDots: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  gap: 2,
  marginTop: 4,
}

const $eventDot: ThemedStyle<ViewStyle> = (color: string) => ({
  width: 4,
  height: 4,
  borderRadius: 2,
  backgroundColor: color,
})

const $loadingContainer: ThemedStyle<ViewStyle> = {
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 60,
}

const $loadingText: ThemedStyle<TextStyle> = (colors) => ({
  color: colors.textDim,
  marginTop: 16,
})

const $errorContainer: ThemedStyle<ViewStyle> = (colors) => ({
  backgroundColor: colors.errorBackground,
  padding: 20,
  borderRadius: 12,
  alignItems: "center",
  marginHorizontal: 20,
  marginVertical: 20,
})

const $errorText: ThemedStyle<TextStyle> = (colors) => ({
  color: colors.error,
  textAlign: "center",
  marginBottom: 16,
})

const $retryButton: ThemedStyle<ViewStyle> = (colors) => ({
  backgroundColor: colors.error,
  paddingHorizontal: 24,
  paddingVertical: 12,
  borderRadius: 8,
})

const $retryButtonText: ThemedStyle<TextStyle> = {
  color: "#FFFFFF",
  fontWeight: "600",
}

// Permission Card Styles
const $permissionCard: ThemedStyle<ViewStyle> = (colors) => ({
  backgroundColor: colors.surface,
  padding: 24,
  borderRadius: 16,
  alignItems: "center",
  marginHorizontal: 20,
  marginVertical: 20,
  borderWidth: 1,
  borderColor: colors.pray + "30",
})

const $permissionIconContainer: ThemedStyle<ViewStyle> = (colors) => ({
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: colors.pray + "20",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 16,
})

const $permissionTitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 18,
  fontWeight: "700",
  color: colors.text,
  marginBottom: 12,
  textAlign: "center",
})

const $permissionMessage: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 14,
  color: colors.textDim,
  textAlign: "center",
  lineHeight: 20,
  marginBottom: 20,
})

const $settingsButton: ThemedStyle<ViewStyle> = (colors) => ({
  backgroundColor: colors.pray,
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  paddingHorizontal: 24,
  paddingVertical: 12,
  borderRadius: 8,
})

const $settingsButtonText: ThemedStyle<TextStyle> = {
  color: "#FFFFFF",
  fontWeight: "600",
  fontSize: 16,
}

const $timeline: ThemedStyle<ViewStyle> = {
  paddingHorizontal: 20,
  paddingTop: 8,
}

const $timelineRow: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  marginBottom: 0,
  minHeight: 90,
}

const $timeColumn: ThemedStyle<ViewStyle> = {
  width: 60,
  paddingTop: 12,
  alignItems: "flex-start",
}

const $timeText: ThemedStyle<TextStyle> = (colors, isPast: boolean) => ({
  fontSize: 13,
  fontWeight: "600",
  color: isPast ? colors.textDim : colors.text,
  opacity: isPast ? 0.6 : 1,
})

const $timelineLine: ThemedStyle<ViewStyle> = {
  width: 40,
  alignItems: "center",
  position: "relative",
  justifyContent: "center",
}

const $timelineDot: ThemedStyle<ViewStyle> = (
  colors,
  trackingStatus: PrayerTrackingStatus,
  isNext: boolean,
  isTrackable?: boolean
) => {
  // Determine if this is a tracked prayer (has a status)
  const hasTracking = trackingStatus !== PrayerTrackingStatus.NONE

  // Non-trackable prayers: filled circle with theme color
  if (isTrackable === false) {
    return {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.text,
      zIndex: 2,
      borderWidth: 0,
      alignItems: "center",
      justifyContent: "center",
    }
  }

  // Trackable prayers with tracking: filled circle with theme color (will have colored icon)
  if (hasTracking) {
    return {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.text,
      zIndex: 2,
      borderWidth: 0,
      alignItems: "center",
      justifyContent: "center",
    }
  }

  // Trackable prayers without tracking: hollow circle (border only) with theme color
  return {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "transparent",
    zIndex: 2,
    borderWidth: 3,
    borderColor: colors.text,
    alignItems: "center",
    justifyContent: "center",
  }
}

const $innerDot: ThemedStyle<ViewStyle> = {
  width: 12,
  height: 12,
  borderRadius: 6,
  backgroundColor: "#FFFFFF",
}

const $timelineConnector: ThemedStyle<ViewStyle> = (colors) => ({
  position: "absolute",
  top: 0,
  bottom: 0,
  left: "50%",
  marginLeft: -1.5,
  width: 3,
  backgroundColor: colors.border,
  zIndex: 1,
})

const $prayerCard: ThemedStyle<ViewStyle> = (colors, prayerColor: string, isPast: boolean, isNext: boolean) => ({
  flex: 1,
  backgroundColor: colors.palette.surface,
  borderRadius: 12,
  padding: 16,
  marginLeft: 8,
  marginVertical: 6,
  flexDirection: "row",
  alignItems: "center",
  gap: 16,
  opacity: isPast ? 0.7 : 1,
})

const $prayerIconContainer: ThemedStyle<ViewStyle> = (color: string) => ({
  width: 56,
  height: 56,
  borderRadius: 12,
  backgroundColor: color + "20",
  alignItems: "center",
  justifyContent: "center",
})

const $prayerInfoContainer: ThemedStyle<ViewStyle> = {
  flex: 1,
  gap: 2,
}

const $prayerStartTime: ThemedStyle<TextStyle> = (colors, isPast: boolean) => ({
  fontSize: 13,
  fontWeight: "600",
  color: colors.textDim,
  lineHeight: 18,
})

const $prayerStatus: ThemedStyle<TextStyle> = (colors, isPast: boolean) => ({
  fontSize: 11,
  fontWeight: "500",
  color: colors.textDim,
  textTransform: "uppercase",
  letterSpacing: 0.5,
})

const $prayerNameRow: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  alignItems: "center",
}

const $prayerCardName: ThemedStyle<TextStyle> = (colors, isPast: boolean) => ({
  fontSize: 17,
  fontWeight: "600",
  color: colors.text,
})

const $prayerCardTime: ThemedStyle<TextStyle> = (colors, isPast: boolean) => ({
  fontSize: 12,
  color: colors.textDim,
  lineHeight: 16,
})

const $prayerCardTimeRange: ThemedStyle<TextStyle> = (colors, isPast: boolean) => ({
  fontSize: 12,
  color: colors.textDim,
  lineHeight: 16,
  marginTop: 2,
})

const $prayerCardDuration: ThemedStyle<TextStyle> = (colors, isPast: boolean) => ({
  fontSize: 11,
  color: colors.textDim,
  lineHeight: 14,
  marginTop: 2,
})

const $checkButton: ThemedStyle<ViewStyle> = (colors, isChecked: boolean) => ({
  width: 32,
  height: 32,
  borderRadius: 16,
  borderWidth: 2,
  borderColor: isChecked ? colors.pray : colors.border,
  backgroundColor: isChecked ? colors.pray + "20" : "transparent",
  alignItems: "center",
  justifyContent: "center",
})

const $footer: ThemedStyle<ViewStyle> = {
  height: 100,
}

const $fabButton: ThemedStyle<ViewStyle> = (colors) => ({
  position: "absolute",
  bottom: 24,
  right: 24,
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: colors.pray,
  alignItems: "center",
  justifyContent: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 6,
})

// Picker Modal Styles
const $pickerModalOverlay: ThemedStyle<ViewStyle> = {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "flex-end",
}

const $pickerModalContent: ThemedStyle<ViewStyle> = (colors) => ({
  backgroundColor: colors.background,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  paddingTop: 20,
  paddingBottom: 40,
  maxHeight: "60%",
})

const $pickerHeader: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 20,
  paddingBottom: 16,
  borderBottomWidth: 1,
  borderBottomColor: "rgba(0, 0, 0, 0.1)",
}

const $pickerTitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 20,
  fontWeight: "700",
  color: colors.text,
})

const $pickerScroll: ThemedStyle<ViewStyle> = {
  paddingHorizontal: 20,
}

const $pickerItem: ThemedStyle<ViewStyle> = (colors) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: 16,
  paddingHorizontal: 16,
  borderRadius: 12,
  marginTop: 8,
})

const $pickerItemText: ThemedStyle<TextStyle> = (colors, isSelected: boolean) => ({
  fontSize: 16,
  fontWeight: isSelected ? "700" : "500",
  color: isSelected ? colors.pray : colors.text,
})
