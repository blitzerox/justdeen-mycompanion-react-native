/**
 * Duas API Service
 * Fetches Dua data from Cloudflare D1 backend
 */

import { ApisauceInstance, create } from "apisauce"
import Config from "../../config"

export interface DuaCategory {
  id: string
  name: string
  arabicName: string
  description: string
  icon: string
  duasCount: number
}

export interface Dua {
  id: string
  categoryId: string
  name: string
  arabicName: string
  arabicText: string
  transliteration: string
  englishTranslation: string
  reference?: string
  audioUrl?: string
  occasion?: string
  benefits?: string
}

/**
 * Duas API Service
 * Connects to Cloudflare Workers backend with D1 database
 */
export class DuasApi {
  private api: ApisauceInstance

  // Cache storage
  private categoriesCache: DuaCategory[] | null = null
  private duasByCategoryCache: Map<string, Dua[]> = new Map()
  private duaCache: Map<string, Dua> = new Map()

  constructor() {
    this.api = create({
      baseURL: Config.CLOUDFLARE_API_URL,
      timeout: Config.API_TIMEOUT,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
  }

  /**
   * Clear all caches (useful for refresh)
   */
  clearCache() {
    this.categoriesCache = null
    this.duasByCategoryCache.clear()
    this.duaCache.clear()
  }

  /**
   * Get all Dua categories
   */
  async getCategories(): Promise<DuaCategory[]> {
    // Return cached data if available
    if (this.categoriesCache) {
      console.log("📦 Using cached dua categories")
      return this.categoriesCache
    }

    console.log("📡 Fetching dua categories from:", this.api.getBaseURL())
    const response = await this.api.get<DuaCategory[]>("/api/duas/categories")
    console.log("📡 Response status:", response.status, "ok:", response.ok, "problem:", response.problem)
    if (!response.ok) {
      console.error("Failed to fetch dua categories:", response.problem, response.originalError)
      // Return fallback data
      return this.getFallbackCategories()
    }
    console.log("✅ Fetched", response.data?.length, "dua categories")

    // Cache the result
    this.categoriesCache = response.data || []
    return this.categoriesCache
  }

  /**
   * Get a specific category
   */
  async getCategory(categoryId: string): Promise<DuaCategory | undefined> {
    const categories = await this.getCategories()
    return categories.find((c) => c.id === categoryId)
  }

  /**
   * Get Duas from a category
   */
  async getDuasFromCategory(categoryId: string): Promise<Dua[]> {
    // Return cached data if available
    if (this.duasByCategoryCache.has(categoryId)) {
      console.log("📦 Using cached duas for category:", categoryId)
      return this.duasByCategoryCache.get(categoryId)!
    }

    const response = await this.api.get<{ duas: Dua[]; total: number }>(`/api/duas/categories/${categoryId}/duas`)
    if (!response.ok) {
      console.error(`Failed to fetch duas for category ${categoryId}:`, response.problem)
      return []
    }

    const duas = response.data?.duas || []

    // Cache the result and individual duas
    this.duasByCategoryCache.set(categoryId, duas)
    duas.forEach(dua => this.duaCache.set(dua.id, dua))

    return duas
  }

  /**
   * Get a specific Dua
   */
  async getDua(duaId: string): Promise<Dua | undefined> {
    // Return cached data if available
    if (this.duaCache.has(duaId)) {
      console.log("📦 Using cached dua:", duaId)
      return this.duaCache.get(duaId)
    }

    const response = await this.api.get<Dua>(`/api/duas/${duaId}`)
    if (!response.ok) {
      console.error(`Failed to fetch dua ${duaId}:`, response.problem)
      return undefined
    }

    // Cache the result
    if (response.data) {
      this.duaCache.set(duaId, response.data)
    }

    return response.data
  }

  /**
   * Search Duas
   */
  async searchDuas(query: string, categoryId?: string): Promise<Dua[]> {
    const params: any = { q: query }
    if (categoryId) params.categoryId = categoryId

    const response = await this.api.get<Dua[]>("/api/duas/search", params)
    if (!response.ok) {
      console.error("Failed to search duas:", response.problem)
      return []
    }
    return response.data || []
  }

  /**
   * Get random Dua (Dua of the Day)
   */
  async getRandomDua(): Promise<Dua | null> {
    const response = await this.api.get<Dua>("/api/duas/random")
    if (!response.ok) {
      console.error("Failed to fetch random dua:", response.problem)
      return null
    }
    return response.data || null
  }

  /**
   * Fallback categories (in case backend is unavailable)
   */
  private getFallbackCategories(): DuaCategory[] {
    return [
      {
        id: "morning",
        name: "Morning Adhkar",
        arabicName: "أذكار الصباح",
        description: "Supplications to be recited in the morning",
        icon: "bell",
        duasCount: 15,
      },
      {
        id: "evening",
        name: "Evening Adhkar",
        arabicName: "أذكار المساء",
        description: "Supplications to be recited in the evening",
        icon: "moon",
        duasCount: 15,
      },
      {
        id: "daily",
        name: "Daily Duas",
        arabicName: "الأدعية اليومية",
        description: "Everyday supplications for various occasions",
        icon: "heart",
        duasCount: 25,
      },
      {
        id: "prayer",
        name: "Prayer Duas",
        arabicName: "أدعية الصلاة",
        description: "Supplications related to prayer",
        icon: "components",
        duasCount: 12,
      },
      {
        id: "quran",
        name: "Quranic Duas",
        arabicName: "الأدعية القرآنية",
        description: "Supplications from the Quran",
        icon: "book",
        duasCount: 20,
      },
      {
        id: "prophetic",
        name: "Prophetic Duas",
        arabicName: "الأدعية النبوية",
        description: "Supplications from the Prophet's traditions",
        icon: "star",
        duasCount: 30,
      },
    ]
  }
}

// Export singleton instance
export const duasApi = new DuasApi()
