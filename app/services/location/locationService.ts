/**
 * Location Service
 * Handles location permissions and fetching user's current location
 * Used for prayer times calculation and Qibla direction
 */

import * as Location from "expo-location"

export interface Coordinates {
  latitude: number
  longitude: number
  accuracy?: number
}

export type LocationPermissionStatus = "granted" | "denied" | "undetermined"

/**
 * Check current location permission status
 */
export const checkLocationPermission = async (): Promise<LocationPermissionStatus> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync()
    if (status === "granted") return "granted"
    if (status === "denied") return "denied"
    return "undetermined"
  } catch (err) {
    console.error("Check location permission error:", err)
    return "undetermined"
  }
}

/**
 * Request location permissions
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync()
    return status === "granted"
  } catch (err) {
    console.error("Location permission error:", err)
    return false
  }
}

/**
 * Get current location
 */
export const getCurrentLocation = async (): Promise<Coordinates> => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    })
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
    }
  } catch (error) {
    console.error("Geolocation error:", error)
    throw error
  }
}

/**
 * Watch location changes (for Qibla compass)
 */
export const watchLocation = async (
  onLocationUpdate: (coords: Coordinates) => void,
  onError?: (error: any) => void
): Promise<Location.LocationSubscription> => {
  try {
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10, // Update every 10 meters
        timeInterval: 5000, // Update every 5 seconds
      },
      (location) => {
        onLocationUpdate({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
        })
      }
    )
    return subscription
  } catch (error) {
    console.error("Watch location error:", error)
    if (onError) onError(error)
    throw error
  }
}

/**
 * Clear location watch
 */
export const clearLocationWatch = (subscription: Location.LocationSubscription) => {
  subscription.remove()
}

/**
 * Reverse geocode coordinates to location name
 * Note: This requires a geocoding API like Google Maps Geocoding API
 * TODO: Implement with actual geocoding service
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  try {
    // Placeholder - implement with actual geocoding service
    // Options: Google Maps Geocoding API, Mapbox, OpenStreetMap Nominatim
    return `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
  } catch (err) {
    console.error("Reverse geocode error:", err)
    return "Unknown location"
  }
}
