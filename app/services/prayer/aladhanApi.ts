/**
 * AlAdhan API Service
 * Prayer times calculation using AlAdhan.com API
 * Documentation: https://aladhan.com/prayer-times-api
 */

import { ApisauceInstance, create } from "apisauce"
import Config from "../../config"

export interface PrayerTimesParams {
  latitude: number
  longitude: number
  method?: number // Calculation method (1-12)
  madhab?: number // 1 = Shafi, 2 = Hanafi
  date?: string // DD-MM-YYYY format
  month?: number // 1-12
  year?: number // YYYY
}

export interface PrayerTime {
  name: string
  time: string // HH:MM format
  timestamp: number
  isTrackable?: boolean // Whether this prayer can be tracked (Fajr, Dhuhr, Asr, Maghrib, Isha)
  endTime?: string // End time for the prayer window
  duration?: string // Duration text (e.g., "2h 55m")
}

export interface PrayerTimesResponse {
  code: number
  status: string
  data: {
    timings: {
      Fajr: string
      Sunrise: string
      Dhuhr: string
      Asr: string
      Sunset: string
      Maghrib: string
      Isha: string
      Imsak: string
      Midnight: string
      Firstthird: string
      Lastthird: string
    }
    date: {
      readable: string
      timestamp: string
      hijri: {
        date: string
        format: string
        day: string
        weekday: {
          en: string
          ar: string
        }
        month: {
          number: number
          en: string
          ar: string
        }
        year: string
        designation: {
          abbreviated: string
          expanded: string
        }
        holidays: string[]
      }
      gregorian: {
        date: string
        format: string
        day: string
        weekday: {
          en: string
        }
        month: {
          number: number
          en: string
        }
        year: string
        designation: {
          abbreviated: string
          expanded: string
        }
      }
    }
    meta: {
      latitude: number
      longitude: number
      timezone: string
      method: {
        id: number
        name: string
        params: {
          Fajr: number
          Isha: number | string
        }
      }
      latitudeAdjustmentMethod: string
      midnightMode: string
      school: string
      offset: Record<string, number>
    }
  }
}

export interface QiblaResponse {
  code: number
  status: string
  data: {
    latitude: number
    longitude: number
    direction: number // Qibla direction in degrees
  }
}

/**
 * AlAdhan API Client
 */
export class AlAdhanApi {
  private api: ApisauceInstance

  constructor() {
    this.api = create({
      baseURL: Config.ALADHAN_API_URL,
      timeout: Config.API_TIMEOUT,
      headers: {
        Accept: "application/json",
      },
    })
  }

  /**
   * Get prayer times for a specific date and location
   */
  async getPrayerTimes(params: PrayerTimesParams): Promise<PrayerTimesResponse> {
    const {
      latitude,
      longitude,
      method = Config.DEFAULT_PRAYER_METHOD,
      madhab = Config.DEFAULT_MADHAB,
      date,
    } = params

    const response = await this.api.get<PrayerTimesResponse>("/timings", {
      latitude,
      longitude,
      method,
      school: madhab,
      date: date || this.getCurrentDate(),
    })

    if (!response.ok || !response.data) {
      throw new Error(`AlAdhan API error: ${response.problem}`)
    }

    return response.data
  }

  /**
   * Get prayer times for an entire month
   */
  async getPrayerTimesForMonth(
    params: Omit<PrayerTimesParams, "date"> & { month: number; year: number }
  ): Promise<PrayerTimesResponse> {
    const {
      latitude,
      longitude,
      method = Config.DEFAULT_PRAYER_METHOD,
      madhab = Config.DEFAULT_MADHAB,
      month,
      year,
    } = params

    const response = await this.api.get<PrayerTimesResponse>("/calendar", {
      latitude,
      longitude,
      method,
      school: madhab,
      month,
      year,
    })

    if (!response.ok || !response.data) {
      throw new Error(`AlAdhan API error: ${response.problem}`)
    }

    return response.data
  }

  /**
   * Get Qibla direction for a location
   */
  async getQiblaDirection(
    latitude: number,
    longitude: number
  ): Promise<QiblaResponse> {
    const response = await this.api.get<QiblaResponse>("/qibla", {
      latitude,
      longitude,
    })

    if (!response.ok || !response.data) {
      throw new Error(`AlAdhan API error: ${response.problem}`)
    }

    return response.data
  }

  /**
   * Helper: Get current date in DD-MM-YYYY format
   */
  private getCurrentDate(): string {
    const now = new Date()
    const day = String(now.getDate()).padStart(2, "0")
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const year = now.getFullYear()
    return `${day}-${month}-${year}`
  }

  /**
   * Helper: Parse prayer times into structured format
   */
  parsePrayerTimes(response: PrayerTimesResponse): PrayerTime[] {
    const { timings, date } = response.data
    const dateTimestamp = parseInt(date.timestamp, 10) * 1000

    // Use Lastthird from API for Tahajjud time
    const lastThirdTime = this.parseTimeToTimestamp(timings.Lastthird, dateTimestamp)
    const fajrTime = this.parseTimeToTimestamp(timings.Fajr, dateTimestamp)

    const prayers: PrayerTime[] = [
      {
        name: "Tahajjud",
        time: timings.Lastthird.split(" ")[0],
        timestamp: lastThirdTime,
        isTrackable: false,
        endTime: timings.Fajr.split(" ")[0],
        duration: this.calculateDuration(lastThirdTime, fajrTime),
      },
      {
        name: "Imsak",
        time: timings.Imsak.split(" ")[0],
        timestamp: this.parseTimeToTimestamp(timings.Imsak, dateTimestamp),
        isTrackable: false,
      },
      {
        name: "Fajr",
        time: timings.Fajr.split(" ")[0],
        timestamp: this.parseTimeToTimestamp(timings.Fajr, dateTimestamp),
        isTrackable: true,
        endTime: timings.Sunrise.split(" ")[0],
        duration: this.calculateDuration(
          this.parseTimeToTimestamp(timings.Fajr, dateTimestamp),
          this.parseTimeToTimestamp(timings.Sunrise, dateTimestamp)
        ),
      },
      {
        name: "Sunrise",
        time: timings.Sunrise.split(" ")[0],
        timestamp: this.parseTimeToTimestamp(timings.Sunrise, dateTimestamp),
        isTrackable: false,
      },
      {
        name: "Dhuhr",
        time: timings.Dhuhr.split(" ")[0],
        timestamp: this.parseTimeToTimestamp(timings.Dhuhr, dateTimestamp),
        isTrackable: true,
        endTime: timings.Asr.split(" ")[0],
        duration: this.calculateDuration(
          this.parseTimeToTimestamp(timings.Dhuhr, dateTimestamp),
          this.parseTimeToTimestamp(timings.Asr, dateTimestamp)
        ),
      },
      {
        name: "Asr",
        time: timings.Asr.split(" ")[0],
        timestamp: this.parseTimeToTimestamp(timings.Asr, dateTimestamp),
        isTrackable: true,
        endTime: timings.Maghrib.split(" ")[0],
        duration: this.calculateDuration(
          this.parseTimeToTimestamp(timings.Asr, dateTimestamp),
          this.parseTimeToTimestamp(timings.Maghrib, dateTimestamp)
        ),
      },
      {
        name: "Maghrib",
        time: timings.Maghrib.split(" ")[0],
        timestamp: this.parseTimeToTimestamp(timings.Maghrib, dateTimestamp),
        isTrackable: true,
        endTime: timings.Isha.split(" ")[0],
        duration: this.calculateDuration(
          this.parseTimeToTimestamp(timings.Maghrib, dateTimestamp),
          this.parseTimeToTimestamp(timings.Isha, dateTimestamp)
        ),
      },
      {
        name: "Isha",
        time: timings.Isha.split(" ")[0],
        timestamp: this.parseTimeToTimestamp(timings.Isha, dateTimestamp),
        isTrackable: true,
        endTime: timings.Midnight.split(" ")[0],
        duration: this.calculateDuration(
          this.parseTimeToTimestamp(timings.Isha, dateTimestamp),
          this.parseTimeToTimestamp(timings.Midnight, dateTimestamp)
        ),
      },
    ]

    return prayers
  }

  /**
   * Helper: Calculate duration between two timestamps
   */
  private calculateDuration(startTime: number, endTime: number): string {
    const durationMs = endTime - startTime
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  /**
   * Helper: Convert time string to timestamp
   */
  private parseTimeToTimestamp(timeStr: string, baseTimestamp: number): number {
    const [time] = timeStr.split(" ")
    const [hours, minutes] = time.split(":").map(Number)
    const date = new Date(baseTimestamp)
    date.setHours(hours, minutes, 0, 0)
    return date.getTime()
  }
}

// Export singleton instance
export const aladhanApi = new AlAdhanApi()
