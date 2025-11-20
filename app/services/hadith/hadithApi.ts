/**
 * Hadith API Service
 * Fetches Hadith data from Cloudflare D1 backend
 */

import { ApisauceInstance, create } from "apisauce"
import Config from "../../config"

export interface HadithCollection {
  id: string
  name: string
  arabicName: string
  description: string
  totalHadith: number
  books: number
}

export interface HadithBook {
  id: string
  collectionId: string
  number: number
  name: string
  arabicName: string
  hadithStart: number
  hadithEnd: number
  totalHadith: number
}

export interface Hadith {
  id: string
  collectionId: string
  bookId: string
  hadithNumber: number
  arabicText: string
  englishText: string
  narrator: string
  grade?: string // Sahih, Hassan, Daif
  reference: string
}

/**
 * Hadith API Service
 * Connects to Cloudflare Workers backend with D1 database
 */
export class HadithApi {
  private api: ApisauceInstance

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
   * Get all Hadith collections
   */
  async getCollections(): Promise<HadithCollection[]> {
    const response = await this.api.get<HadithCollection[]>("/api/hadith/collections")
    if (!response.ok) {
      console.error("Failed to fetch hadith collections:", response.problem)
      // Return fallback data
      return this.getFallbackCollections()
    }
    return response.data || []
  }

  /**
   * Get a specific collection
   */
  async getCollection(collectionId: string): Promise<HadithCollection | undefined> {
    const collections = await this.getCollections()
    return collections.find((c) => c.id === collectionId)
  }

  /**
   * Get books for a collection
   */
  async getBooks(collectionId: string): Promise<HadithBook[]> {
    const response = await this.api.get<HadithBook[]>(`/api/hadith/collections/${collectionId}/books`)
    if (!response.ok) {
      console.error(`Failed to fetch books for collection ${collectionId}:`, response.problem)
      return []
    }
    return response.data || []
  }

  /**
   * Get a specific book
   */
  async getBook(bookId: string): Promise<HadithBook | undefined> {
    const response = await this.api.get<HadithBook>(`/api/hadith/books/${bookId}`)
    if (!response.ok) {
      console.error(`Failed to fetch book ${bookId}:`, response.problem)
      return undefined
    }
    return response.data
  }

  /**
   * Get Hadiths from a book
   */
  async getHadithsFromBook(bookId: string): Promise<Hadith[]> {
    const response = await this.api.get<Hadith[]>(`/api/hadith/books/${bookId}/hadiths`)
    if (!response.ok) {
      console.error(`Failed to fetch hadiths for book ${bookId}:`, response.problem)
      return []
    }
    return response.data || []
  }

  /**
   * Get a specific Hadith
   */
  async getHadith(hadithId: string): Promise<Hadith | undefined> {
    const response = await this.api.get<Hadith>(`/api/hadith/${hadithId}`)
    if (!response.ok) {
      console.error(`Failed to fetch hadith ${hadithId}:`, response.problem)
      return undefined
    }
    return response.data
  }

  /**
   * Search Hadiths
   */
  async searchHadiths(query: string, collectionId?: string): Promise<Hadith[]> {
    const params: any = { q: query }
    if (collectionId) params.collectionId = collectionId

    const response = await this.api.get<Hadith[]>("/api/hadith/search", params)
    if (!response.ok) {
      console.error("Failed to search hadiths:", response.problem)
      return []
    }
    return response.data || []
  }

  /**
   * Get random Hadith (Hadith of the Day)
   */
  async getRandomHadith(): Promise<Hadith | null> {
    const response = await this.api.get<Hadith>("/api/hadith/random")
    if (!response.ok) {
      console.error("Failed to fetch random hadith:", response.problem)
      return null
    }
    return response.data || null
  }

  /**
   * Fallback collections (in case backend is unavailable)
   */
  private getFallbackCollections(): HadithCollection[] {
    return [
      {
        id: "bukhari",
        name: "Sahih al-Bukhari",
        arabicName: "صحيح البخاري",
        description: "The most authentic hadith collection",
        totalHadith: 7563,
        books: 97,
      },
      {
        id: "muslim",
        name: "Sahih Muslim",
        arabicName: "صحيح مسلم",
        description: "The second most authentic collection",
        totalHadith: 7190,
        books: 56,
      },
      {
        id: "abudawud",
        name: "Sunan Abu Dawud",
        arabicName: "سنن أبي داود",
        description: "Collection by Imam Abu Dawud",
        totalHadith: 5274,
        books: 43,
      },
      {
        id: "tirmidhi",
        name: "Jami' at-Tirmidhi",
        arabicName: "جامع الترمذي",
        description: "Collection by Imam at-Tirmidhi",
        totalHadith: 3956,
        books: 46,
      },
      {
        id: "nasai",
        name: "Sunan an-Nasa'i",
        arabicName: "سنن النسائي",
        description: "Collection by Imam an-Nasa'i",
        totalHadith: 5758,
        books: 51,
      },
      {
        id: "ibnmajah",
        name: "Sunan Ibn Majah",
        arabicName: "سنن ابن ماجه",
        description: "Collection by Imam Ibn Majah",
        totalHadith: 4341,
        books: 37,
      },
    ]
  }
}

// Export singleton instance
export const hadithApi = new HadithApi()
