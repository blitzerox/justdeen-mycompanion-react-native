/**
 * Hadith Download Service
 * Manages downloading and storing hadith collections for offline use
 */

import { load, save, remove } from "@/utils/storage"
import { hadithApi, HadithCollection, HadithBook, Hadith } from "./hadithApi"

// Storage keys
const DOWNLOADED_COLLECTIONS_KEY = "hadith_downloaded_collections"
const COLLECTION_BOOKS_KEY = (id: string) => `hadith_collection_books_${id}`
const BOOK_HADITHS_KEY = (id: string) => `hadith_book_hadiths_${id}`

export interface DownloadProgress {
  collectionId: string
  status: "idle" | "downloading" | "completed" | "error"
  progress: number // 0-100
  currentBook?: number
  totalBooks?: number
  error?: string
}

export interface DownloadedCollectionInfo {
  collectionId: string
  downloadedAt: number
  totalBooks: number
  totalHadiths: number
}

class HadithDownloadService {
  private downloadProgress: Map<string, DownloadProgress> = new Map()
  private listeners: Map<string, Set<(progress: DownloadProgress) => void>> = new Map()

  /**
   * Get list of downloaded collections
   */
  getDownloadedCollections(): DownloadedCollectionInfo[] {
    return load<DownloadedCollectionInfo[]>(DOWNLOADED_COLLECTIONS_KEY) || []
  }

  /**
   * Check if a collection is downloaded
   */
  isCollectionDownloaded(collectionId: string): boolean {
    const downloaded = this.getDownloadedCollections()
    return downloaded.some(d => d.collectionId === collectionId)
  }

  /**
   * Get download progress for a collection
   */
  getDownloadProgress(collectionId: string): DownloadProgress {
    return this.downloadProgress.get(collectionId) || {
      collectionId,
      status: this.isCollectionDownloaded(collectionId) ? "completed" : "idle",
      progress: this.isCollectionDownloaded(collectionId) ? 100 : 0,
    }
  }

  /**
   * Subscribe to download progress updates
   */
  subscribe(collectionId: string, callback: (progress: DownloadProgress) => void): () => void {
    if (!this.listeners.has(collectionId)) {
      this.listeners.set(collectionId, new Set())
    }
    this.listeners.get(collectionId)!.add(callback)

    // Return unsubscribe function
    return () => {
      this.listeners.get(collectionId)?.delete(callback)
    }
  }

  /**
   * Notify listeners of progress update
   */
  private notifyListeners(collectionId: string, progress: DownloadProgress) {
    this.downloadProgress.set(collectionId, progress)
    this.listeners.get(collectionId)?.forEach(callback => callback(progress))
  }

  /**
   * Download a complete hadith collection
   */
  async downloadCollection(collectionId: string): Promise<boolean> {
    // Check if already downloading
    const currentProgress = this.downloadProgress.get(collectionId)
    if (currentProgress?.status === "downloading") {
      console.log("Collection already downloading:", collectionId)
      return false
    }

    try {
      // Initialize progress
      this.notifyListeners(collectionId, {
        collectionId,
        status: "downloading",
        progress: 0,
        currentBook: 0,
        totalBooks: 0,
      })

      // Step 1: Get all books for this collection
      console.log("📥 Downloading collection:", collectionId)
      const books = await hadithApi.getBooks(collectionId)

      if (books.length === 0) {
        throw new Error("No books found for collection")
      }

      const totalBooks = books.length
      let totalHadiths = 0
      const allBookHadiths: Map<string, Hadith[]> = new Map()

      // Step 2: Download hadiths for each book
      for (let i = 0; i < books.length; i++) {
        const book = books[i]
        const progress = Math.round(((i + 1) / totalBooks) * 100)

        this.notifyListeners(collectionId, {
          collectionId,
          status: "downloading",
          progress,
          currentBook: i + 1,
          totalBooks,
        })

        console.log(`📥 Downloading book ${i + 1}/${totalBooks}: ${book.name}`)
        const hadiths = await hadithApi.getHadithsFromBook(book.id)
        allBookHadiths.set(book.id, hadiths)
        totalHadiths += hadiths.length

        // Small delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Step 3: Save everything to storage
      console.log("💾 Saving collection to storage...")

      // Save books
      save(COLLECTION_BOOKS_KEY(collectionId), books)

      // Save hadiths for each book
      allBookHadiths.forEach((hadiths, bookId) => {
        save(BOOK_HADITHS_KEY(bookId), hadiths)
      })

      // Update downloaded collections list
      const downloaded = this.getDownloadedCollections()
      const existingIndex = downloaded.findIndex(d => d.collectionId === collectionId)
      const info: DownloadedCollectionInfo = {
        collectionId,
        downloadedAt: Date.now(),
        totalBooks,
        totalHadiths,
      }

      if (existingIndex >= 0) {
        downloaded[existingIndex] = info
      } else {
        downloaded.push(info)
      }
      save(DOWNLOADED_COLLECTIONS_KEY, downloaded)

      // Mark as completed
      this.notifyListeners(collectionId, {
        collectionId,
        status: "completed",
        progress: 100,
        totalBooks,
      })

      console.log(`✅ Downloaded collection ${collectionId}: ${totalBooks} books, ${totalHadiths} hadiths`)
      return true
    } catch (error) {
      console.error("Failed to download collection:", error)
      this.notifyListeners(collectionId, {
        collectionId,
        status: "error",
        progress: 0,
        error: error instanceof Error ? error.message : "Download failed",
      })
      return false
    }
  }

  /**
   * Delete a downloaded collection
   */
  deleteCollection(collectionId: string): void {
    // Get books for this collection from storage
    const books = load<HadithBook[]>(COLLECTION_BOOKS_KEY(collectionId)) || []

    // Delete hadiths for each book
    books.forEach(book => {
      remove(BOOK_HADITHS_KEY(book.id))
    })

    // Delete books
    remove(COLLECTION_BOOKS_KEY(collectionId))

    // Update downloaded collections list
    const downloaded = this.getDownloadedCollections()
    const filtered = downloaded.filter(d => d.collectionId !== collectionId)
    save(DOWNLOADED_COLLECTIONS_KEY, filtered)

    // Reset progress
    this.notifyListeners(collectionId, {
      collectionId,
      status: "idle",
      progress: 0,
    })

    console.log("🗑️ Deleted collection:", collectionId)
  }

  /**
   * Get downloaded books for a collection
   */
  getDownloadedBooks(collectionId: string): HadithBook[] | null {
    if (!this.isCollectionDownloaded(collectionId)) {
      return null
    }
    return load<HadithBook[]>(COLLECTION_BOOKS_KEY(collectionId))
  }

  /**
   * Get downloaded hadiths for a book
   */
  getDownloadedHadiths(bookId: string): Hadith[] | null {
    return load<Hadith[]>(BOOK_HADITHS_KEY(bookId))
  }
}

// Export singleton instance
export const hadithDownloadService = new HadithDownloadService()
