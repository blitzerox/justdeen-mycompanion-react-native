/**
 * Location Service
 * Handles location permissions and fetching user's current location
 * Used for prayer times calculation and Qibla direction
 */

import Geolocation from "react-native-geolocation-service"
import { Platform, PermissionsAndroid, Linking } from "react-native"

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
    if (Platform.OS === "ios") {
      const auth = await Geolocation.requestAuthorization("whenInUse")
      if (auth === "granted" || auth === "restricted") return "granted"
      if (auth === "denied") return "denied"
      return "undetermined"
    } else {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      )
      return granted ? "granted" : "denied"
    }
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
    if (Platform.OS === "ios") {
      const auth = await Geolocation.requestAuthorization("whenInUse")
      return auth === "granted" || auth === "restricted"
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      )
      return granted === PermissionsAndroid.RESULTS.GRANTED
    }
  } catch (err) {
    console.error("Location permission error:", err)
    return false
  }
}

/**
 * Get current location
 */
export const getCurrentLocation = async (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      },
      (error) => {
        console.error("Geolocation error:", error)
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    )
  })
}

/**
 * Watch location changes (for Qibla compass)
 */
export const watchLocation = async (
  onLocationUpdate: (coords: Coordinates) => void,
  onError?: (error: any) => void
): Promise<number> => {
  try {
    const watchId = Geolocation.watchPosition(
      (position) => {
        onLocationUpdate({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      },
      (error) => {
        console.error("Watch location error:", error)
        if (onError) onError(error)
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: 5000, // Update every 5 seconds
      }
    )
    return watchId
  } catch (error) {
    console.error("Watch location error:", error)
    if (onError) onError(error)
    throw error
  }
}

/**
 * Clear location watch
 */
export const clearLocationWatch = (watchId: number) => {
  Geolocation.clearWatch(watchId)
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
