/**
 * Prayer Tracking Types
 */

export enum PrayerTrackingStatus {
  NONE = "none",
  DONE = "done",
  LATE = "late",
  MISSED = "missed",
}

export interface PrayerTracking {
  prayerName: string
  date: string // YYYY-MM-DD format
  status: PrayerTrackingStatus
  timestamp: number // When the status was set
}

export interface PrayerTrackingRecord {
  [key: string]: PrayerTrackingStatus // key format: "YYYY-MM-DD:PrayerName"
}
