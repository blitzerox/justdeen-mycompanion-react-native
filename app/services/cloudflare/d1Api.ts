/**
 * Cloudflare D1 API Client
 * Backend API for user data (bookmarks, groups, settings, etc.)
 */

import { ApisauceInstance, create } from "apisauce"
import Config from "../../config"
import { CLOUDFLARE_API_KEY } from "@env"

export interface User {
  id: string
  email?: string
  displayName?: string
  avatarUrl?: string
  authProvider: "google" | "apple" | "anonymous"
  createdAt: number
  updatedAt: number
  lastActiveAt: number
}

export interface Bookmark {
  id: string
  userId: string
  type: "quran" | "hadith" | "dua"
  contentId: string
  note?: string
  tags?: string[]
  createdAt: number
}

export interface ReadingGroup {
  id: string
  name: string
  description?: string
  goalType: "quran_khatm" | "hadith_study" | "dua_practice"
  goalDetails: any
  inviteCode: string
  creatorId: string
  isActive: boolean
  createdAt: number
  updatedAt: number
}

export interface UserSettings {
  userId: string
  prayerMethod: number
  madhab: number
  language: string
  quranTranslation: string
  theme: "light" | "dark" | "auto"
  notificationFajr: boolean
  notificationDhuhr: boolean
  notificationAsr: boolean
  notificationMaghrib: boolean
  notificationIsha: boolean
  locationLat?: number
  locationLng?: number
  locationName?: string
  updatedAt: number
}

export interface PrayerLog {
  id: string
  userId: string
  prayerName: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha"
  prayerDate: string // YYYY-MM-DD
  prayed: boolean
  prayedAt?: number
  loggedAt: number
}

/**
 * Cloudflare D1 API Client
 */
export class CloudflareD1Api {
  private api: ApisauceInstance
  private authToken?: string

  constructor() {
    this.api = create({
      baseURL: Config.CLOUDFLARE_API_URL,
      timeout: Config.API_TIMEOUT,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-API-Key": CLOUDFLARE_API_KEY || "",
      },
    })
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string) {
    this.authToken = token
    this.api.setHeader("Authorization", `Bearer ${token}`)
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
    this.authToken = undefined
    this.api.deleteHeader("Authorization")
  }

  // ============================================
  // AUTH ENDPOINTS
  // ============================================

  async signIn(
    idToken: string,
    provider: "google" | "apple" | "auth0",
  ): Promise<{ userId: string; token: string }> {
    const response = await this.api.post<{ userId: string; token: string }>("/auth/signin", {
      idToken,
      provider,
    })
    if (!response.ok) throw new Error(`Sign-in failed: ${response.problem}`)
    return response.data || { userId: "", token: "" }
  }

  async signInAnonymous(): Promise<{ userId: string; token: string }> {
    const response = await this.api.post<{ userId: string; token: string }>("/auth/anonymous")
    if (!response.ok) throw new Error(`Anonymous sign-in failed: ${response.problem}`)
    return response.data || { userId: "", token: "" }
  }

  async refreshToken(refreshToken: string) {
    const response = await this.api.post("/auth/refresh", { refreshToken })
    if (!response.ok) throw new Error(`Token refresh failed: ${response.problem}`)
    return response.data
  }

  // ============================================
  // BOOKMARKS ENDPOINTS
  // ============================================

  async getBookmarks(): Promise<Bookmark[]> {
    const response = await this.api.get<Bookmark[]>("/bookmarks")
    if (!response.ok) throw new Error(`Get bookmarks failed: ${response.problem}`)
    return response.data || []
  }

  async createBookmark(bookmark: Omit<Bookmark, "id" | "userId" | "createdAt">) {
    const response = await this.api.post("/bookmarks", bookmark)
    if (!response.ok) throw new Error(`Create bookmark failed: ${response.problem}`)
    return response.data
  }

  async deleteBookmark(bookmarkId: string) {
    const response = await this.api.delete(`/bookmarks/${bookmarkId}`)
    if (!response.ok) throw new Error(`Delete bookmark failed: ${response.problem}`)
    return response.data
  }

  // ============================================
  // GROUPS ENDPOINTS
  // ============================================

  async getGroups(): Promise<ReadingGroup[]> {
    const response = await this.api.get<ReadingGroup[]>("/groups")
    if (!response.ok) throw new Error(`Get groups failed: ${response.problem}`)
    return response.data || []
  }

  async createGroup(group: Omit<ReadingGroup, "id" | "inviteCode" | "creatorId" | "createdAt" | "updatedAt">) {
    const response = await this.api.post("/groups", group)
    if (!response.ok) throw new Error(`Create group failed: ${response.problem}`)
    return response.data
  }

  async joinGroup(inviteCode: string) {
    const response = await this.api.post("/groups/join", { inviteCode })
    if (!response.ok) throw new Error(`Join group failed: ${response.problem}`)
    return response.data
  }

  async getGroupDetails(groupId: string) {
    const response = await this.api.get(`/groups/${groupId}`)
    if (!response.ok) throw new Error(`Get group details failed: ${response.problem}`)
    return response.data
  }

  async createGroupPost(groupId: string, content: string, referenceType?: string, referenceId?: string) {
    const response = await this.api.post(`/groups/${groupId}/posts`, {
      content,
      referenceType,
      referenceId,
    })
    if (!response.ok) throw new Error(`Create post failed: ${response.problem}`)
    return response.data
  }

  async getGroupProgress(groupId: string) {
    const response = await this.api.get(`/groups/${groupId}/progress`)
    if (!response.ok) throw new Error(`Get group progress failed: ${response.problem}`)
    return response.data
  }

  // ============================================
  // SETTINGS ENDPOINTS
  // ============================================

  async getSettings(): Promise<UserSettings> {
    const response = await this.api.get<UserSettings>("/settings")
    if (!response.ok) throw new Error(`Get settings failed: ${response.problem}`)
    return response.data as UserSettings
  }

  async updateSettings(settings: Partial<UserSettings>) {
    const response = await this.api.put("/settings", settings)
    if (!response.ok) throw new Error(`Update settings failed: ${response.problem}`)
    return response.data
  }

  // ============================================
  // PRAYER LOGS ENDPOINTS
  // ============================================

  async getPrayerLogs(startDate?: string, endDate?: string): Promise<PrayerLog[]> {
    const response = await this.api.get<PrayerLog[]>("/prayer-logs", { startDate, endDate })
    if (!response.ok) throw new Error(`Get prayer logs failed: ${response.problem}`)
    return response.data || []
  }

  async logPrayer(prayer: Omit<PrayerLog, "id" | "userId" | "loggedAt">) {
    const response = await this.api.post("/prayer-logs", prayer)
    if (!response.ok) throw new Error(`Log prayer failed: ${response.problem}`)
    return response.data
  }

  async getPrayerStats() {
    const response = await this.api.get("/prayer-logs/stats")
    if (!response.ok) throw new Error(`Get prayer stats failed: ${response.problem}`)
    return response.data
  }
}

// Export singleton instance
export const d1Api = new CloudflareD1Api()
