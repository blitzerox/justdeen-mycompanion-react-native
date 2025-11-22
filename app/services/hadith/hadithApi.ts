/**
 * Hadith API Service
 * Fetches Hadith data from Cloudflare D1 backend
 */

import { ApisauceInstance, create } from "apisauce"
import Config from "../../config"
import { load } from "@/utils/storage"

// Storage keys for downloaded data
const COLLECTION_BOOKS_KEY = (id: string) => `hadith_collection_books_${id}`
const BOOK_HADITHS_KEY = (id: string) => `hadith_book_hadiths_${id}`

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

  // Cache storage
  private collectionsCache: HadithCollection[] | null = null
  private booksByCollectionCache: Map<string, HadithBook[]> = new Map()
  private bookCache: Map<string, HadithBook> = new Map()
  private hadithsByBookCache: Map<string, Hadith[]> = new Map()
  private hadithCache: Map<string, Hadith> = new Map()

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
    this.collectionsCache = null
    this.booksByCollectionCache.clear()
    this.bookCache.clear()
    this.hadithsByBookCache.clear()
    this.hadithCache.clear()
  }

  /**
   * Get all Hadith collections
   */
  async getCollections(): Promise<HadithCollection[]> {
    // Return cached data if available
    if (this.collectionsCache) {
      console.log("📦 Using cached hadith collections")
      return this.collectionsCache
    }

    console.log("📡 Fetching hadith collections from:", this.api.getBaseURL())
    const response = await this.api.get<HadithCollection[]>("/api/hadith/collections")
    console.log("📡 Response status:", response.status, "ok:", response.ok, "problem:", response.problem)
    if (!response.ok) {
      console.error("Failed to fetch hadith collections:", response.problem, response.originalError)
      // Return fallback data
      return this.getFallbackCollections()
    }
    console.log("✅ Fetched", response.data?.length, "hadith collections")

    // Cache the result
    this.collectionsCache = response.data || []
    return this.collectionsCache
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
    // Return cached data if available
    if (this.booksByCollectionCache.has(collectionId)) {
      console.log("📦 Using cached books for collection:", collectionId)
      return this.booksByCollectionCache.get(collectionId)!
    }

    // Check for downloaded data first
    const downloadedBooks = load<HadithBook[]>(COLLECTION_BOOKS_KEY(collectionId))
    if (downloadedBooks && downloadedBooks.length > 0) {
      console.log("💾 Using downloaded books for collection:", collectionId)
      this.booksByCollectionCache.set(collectionId, downloadedBooks)
      downloadedBooks.forEach(book => this.bookCache.set(book.id, book))
      return downloadedBooks
    }

    const response = await this.api.get<HadithBook[]>(`/api/hadith/collections/${collectionId}/books`)
    if (!response.ok) {
      console.error(`Failed to fetch books for collection ${collectionId}:`, response.problem)
      return []
    }

    const books = response.data || []

    // Cache the result and individual books
    this.booksByCollectionCache.set(collectionId, books)
    books.forEach(book => this.bookCache.set(book.id, book))

    return books
  }

  /**
   * Get a specific book
   */
  async getBook(bookId: string): Promise<HadithBook | undefined> {
    // Return cached data if available
    if (this.bookCache.has(bookId)) {
      console.log("📦 Using cached book:", bookId)
      return this.bookCache.get(bookId)
    }

    const response = await this.api.get<HadithBook>(`/api/hadith/books/${bookId}`)
    if (!response.ok) {
      console.error(`Failed to fetch book ${bookId}:`, response.problem)
      return undefined
    }

    // Cache the result
    if (response.data) {
      this.bookCache.set(bookId, response.data)
    }

    return response.data
  }

  /**
   * Get Hadiths from a book
   */
  async getHadithsFromBook(bookId: string): Promise<Hadith[]> {
    // Return cached data if available
    if (this.hadithsByBookCache.has(bookId)) {
      console.log("📦 Using cached hadiths for book:", bookId)
      return this.hadithsByBookCache.get(bookId)!
    }

    // Check for downloaded data first
    const downloadedHadiths = load<Hadith[]>(BOOK_HADITHS_KEY(bookId))
    if (downloadedHadiths && downloadedHadiths.length > 0) {
      console.log("💾 Using downloaded hadiths for book:", bookId)
      this.hadithsByBookCache.set(bookId, downloadedHadiths)
      downloadedHadiths.forEach(hadith => this.hadithCache.set(hadith.id, hadith))
      return downloadedHadiths
    }

    const response = await this.api.get<{ hadiths: Hadith[]; total: number }>(`/api/hadith/books/${bookId}/hadiths`)
    if (!response.ok) {
      console.error(`Failed to fetch hadiths for book ${bookId}:`, response.problem)
      return []
    }

    let hadiths = response.data?.hadiths || []

    // Fetch complete data for hadiths with empty content
    const enrichedHadiths = await Promise.all(
      hadiths.map(async (hadith) => {
        const hasContent = hadith.arabicText || hadith.englishText
        if (!hasContent && hadith.id) {
          console.log(`📡 Fetching complete hadith data for: ${hadith.id}`)
          const fullHadith = await this.getHadith(hadith.id)
          return fullHadith || hadith
        }
        return hadith
      })
    )

    hadiths = enrichedHadiths.filter((h): h is Hadith => h !== undefined)

    // Cache the result and individual hadiths
    this.hadithsByBookCache.set(bookId, hadiths)
    hadiths.forEach(hadith => this.hadithCache.set(hadith.id, hadith))

    return hadiths
  }

  /**
   * Get a specific Hadith
   */
  async getHadith(hadithId: string): Promise<Hadith | undefined> {
    // Return cached data if available
    if (this.hadithCache.has(hadithId)) {
      console.log("📦 Using cached hadith:", hadithId)
      return this.hadithCache.get(hadithId)
    }

    const response = await this.api.get<Hadith>(`/api/hadith/${hadithId}`)
    if (!response.ok) {
      console.error(`Failed to fetch hadith ${hadithId}:`, response.problem)
      return undefined
    }

    // Cache the result
    if (response.data) {
      this.hadithCache.set(hadithId, response.data)
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
        name: "The Authentic Collection of al-Bukhari",
        arabicName: "صحيح البخاري",
        description: "Sahih al-Bukhari",
        totalHadith: 7563,
        books: 98,
      },
      {
        id: "muslim",
        name: "The Authentic Collection of Muslim",
        arabicName: "صحيح مسلم",
        description: "Sahih Muslim",
        totalHadith: 7190,
        books: 57,
      },
      {
        id: "abudawud",
        name: "The Sunan of Abu Dawud",
        arabicName: "سنن أبي داود",
        description: "Sunan Abu Dawud",
        totalHadith: 5274,
        books: 43,
      },
      {
        id: "tirmidhi",
        name: "The Collection of at-Tirmidhi",
        arabicName: "جامع الترمذي",
        description: "Jami' at-Tirmidhi",
        totalHadith: 3956,
        books: 49,
      },
      {
        id: "nasai",
        name: "The Sunan of an-Nasa'i",
        arabicName: "سنن النسائي",
        description: "Sunan an-Nasa'i",
        totalHadith: 5758,
        books: 52,
      },
      {
        id: "majah",
        name: "The Sunan of Ibn Majah",
        arabicName: "سنن ابن ماجه",
        description: "Sunan Ibn Majah",
        totalHadith: 4341,
        books: 38,
      },
    ]
  }
}

// Export singleton instance
export const hadithApi = new HadithApi()
