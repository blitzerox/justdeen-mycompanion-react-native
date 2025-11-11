/**
 * Hadith API Service
 * Provides access to authentic Hadith collections
 *
 * Note: For production, this should integrate with a proper Hadith API
 * like sunnah.com API or a local database with full Hadith collections
 */

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

// Hadith Collections
export const HADITH_COLLECTIONS: HadithCollection[] = [
  {
    id: "bukhari",
    name: "Sahih al-Bukhari",
    arabicName: "صحيح البخاري",
    description: "The most authentic hadith collection, compiled by Imam Muhammad al-Bukhari",
    totalHadith: 7563,
    books: 97,
  },
  {
    id: "muslim",
    name: "Sahih Muslim",
    arabicName: "صحيح مسلم",
    description: "The second most authentic hadith collection, compiled by Imam Muslim ibn al-Hajjaj",
    totalHadith: 7190,
    books: 56,
  },
  {
    id: "abudawud",
    name: "Sunan Abu Dawud",
    arabicName: "سنن أبي داود",
    description: "A collection of hadith compiled by Imam Abu Dawud",
    totalHadith: 5274,
    books: 43,
  },
  {
    id: "tirmidhi",
    name: "Jami' at-Tirmidhi",
    arabicName: "جامع الترمذي",
    description: "A collection of hadith compiled by Imam at-Tirmidhi",
    totalHadith: 3956,
    books: 46,
  },
  {
    id: "nasai",
    name: "Sunan an-Nasa'i",
    arabicName: "سنن النسائي",
    description: "A collection of hadith compiled by Imam an-Nasa'i",
    totalHadith: 5758,
    books: 51,
  },
  {
    id: "ibnmajah",
    name: "Sunan Ibn Majah",
    arabicName: "سنن ابن ماجه",
    description: "A collection of hadith compiled by Imam Ibn Majah",
    totalHadith: 4341,
    books: 37,
  },
]

// Sample Hadith Books for Sahih Bukhari
const BUKHARI_BOOKS: HadithBook[] = [
  {
    id: "bukhari_1",
    collectionId: "bukhari",
    number: 1,
    name: "Revelation",
    arabicName: "كتاب بدء الوحي",
    hadithStart: 1,
    hadithEnd: 7,
    totalHadith: 7,
  },
  {
    id: "bukhari_2",
    collectionId: "bukhari",
    number: 2,
    name: "Belief",
    arabicName: "كتاب الإيمان",
    hadithStart: 8,
    hadithEnd: 58,
    totalHadith: 51,
  },
  {
    id: "bukhari_3",
    collectionId: "bukhari",
    number: 3,
    name: "Knowledge",
    arabicName: "كتاب العلم",
    hadithStart: 59,
    hadithEnd: 134,
    totalHadith: 76,
  },
  {
    id: "bukhari_4",
    collectionId: "bukhari",
    number: 4,
    name: "Ablution",
    arabicName: "كتاب الوضوء",
    hadithStart: 135,
    hadithEnd: 247,
    totalHadith: 113,
  },
  {
    id: "bukhari_5",
    collectionId: "bukhari",
    number: 5,
    name: "Bathing",
    arabicName: "كتاب الغسل",
    hadithStart: 248,
    hadithEnd: 293,
    totalHadith: 46,
  },
]

// Sample Hadith Books for Sahih Muslim
const MUSLIM_BOOKS: HadithBook[] = [
  {
    id: "muslim_1",
    collectionId: "muslim",
    number: 1,
    name: "Faith",
    arabicName: "كتاب الإيمان",
    hadithStart: 1,
    hadithEnd: 380,
    totalHadith: 380,
  },
  {
    id: "muslim_2",
    collectionId: "muslim",
    number: 2,
    name: "Purification",
    arabicName: "كتاب الطهارة",
    hadithStart: 381,
    hadithEnd: 690,
    totalHadith: 310,
  },
  {
    id: "muslim_3",
    collectionId: "muslim",
    number: 3,
    name: "Menstruation",
    arabicName: "كتاب الحيض",
    hadithStart: 691,
    hadithEnd: 784,
    totalHadith: 94,
  },
]

// Sample Hadiths (Famous ones from Bukhari)
const SAMPLE_HADITHS: Hadith[] = [
  {
    id: "bukhari_1_1",
    collectionId: "bukhari",
    bookId: "bukhari_1",
    hadithNumber: 1,
    narrator: "Umar bin Al-Khattab",
    arabicText: "عَنْ أَمِيرِ الْمُؤْمِنِينَ أَبِي حَفْصٍ عُمَرَ بْنِ الْخَطَّابِ رضي الله عنه قَالَ: سَمِعْت رَسُولَ اللَّهِ صلى الله عليه وسلم يَقُولُ: إنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    englishText: "I heard the Messenger of Allah (ﷺ) say: \"Actions are according to intentions, and everyone will get what was intended.\"",
    grade: "Sahih",
    reference: "Sahih al-Bukhari 1",
  },
  {
    id: "bukhari_2_8",
    collectionId: "bukhari",
    bookId: "bukhari_2",
    hadithNumber: 8,
    narrator: "Abdullah bin Umar",
    arabicText: "عَنْ عَبْدِ اللَّهِ بْنِ عُمَرَ رَضِيَ اللَّهُ عَنْهُمَا قَالَ: قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم: بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ",
    englishText: "The Prophet (ﷺ) said: \"Islam is based on five (principles): To testify that none has the right to be worshipped but Allah and Muhammad is Allah's Messenger, to offer prayers perfectly, to pay Zakat, to perform Hajj, and to observe fast during Ramadan.\"",
    grade: "Sahih",
    reference: "Sahih al-Bukhari 8",
  },
  {
    id: "bukhari_3_59",
    collectionId: "bukhari",
    bookId: "bukhari_3",
    hadithNumber: 59,
    narrator: "Abdullah bin Amr",
    arabicText: "عَنْ عَبْدِ اللَّهِ بْنِ عَمْرٍو رضي الله عنهما قَالَ: قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم: بَلِّغُوا عَنِّي وَلَوْ آيَةً",
    englishText: "The Prophet (ﷺ) said: \"Convey (my teachings) to the people even if it were a single sentence.\"",
    grade: "Sahih",
    reference: "Sahih al-Bukhari 3461",
  },
]

/**
 * Hadith API Service
 * For production, integrate with sunnah.com API or local database
 */
export class HadithApi {
  /**
   * Get all Hadith collections
   */
  getCollections(): HadithCollection[] {
    return HADITH_COLLECTIONS
  }

  /**
   * Get a specific collection
   */
  getCollection(collectionId: string): HadithCollection | undefined {
    return HADITH_COLLECTIONS.find((c) => c.id === collectionId)
  }

  /**
   * Get books for a collection
   */
  getBooks(collectionId: string): HadithBook[] {
    if (collectionId === "bukhari") {
      return BUKHARI_BOOKS
    } else if (collectionId === "muslim") {
      return MUSLIM_BOOKS
    }
    return []
  }

  /**
   * Get a specific book
   */
  getBook(bookId: string): HadithBook | undefined {
    const allBooks = [...BUKHARI_BOOKS, ...MUSLIM_BOOKS]
    return allBooks.find((b) => b.id === bookId)
  }

  /**
   * Get Hadiths from a book
   * In production, this would fetch from API or database
   */
  async getHadithsFromBook(bookId: string): Promise<Hadith[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Return sample hadiths for the book
    return SAMPLE_HADITHS.filter((h) => h.bookId === bookId)
  }

  /**
   * Get a specific Hadith
   */
  async getHadith(hadithId: string): Promise<Hadith | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return SAMPLE_HADITHS.find((h) => h.id === hadithId)
  }

  /**
   * Search Hadiths
   * In production, this would use full-text search
   */
  async searchHadiths(query: string, collectionId?: string): Promise<Hadith[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const lowerQuery = query.toLowerCase()
    let results = SAMPLE_HADITHS.filter((h) => {
      const matchesQuery =
        h.englishText.toLowerCase().includes(lowerQuery) ||
        h.narrator.toLowerCase().includes(lowerQuery)
      const matchesCollection = !collectionId || h.collectionId === collectionId
      return matchesQuery && matchesCollection
    })

    return results
  }

  /**
   * Get random Hadith (Hadith of the Day)
   */
  async getRandomHadith(): Promise<Hadith> {
    const randomIndex = Math.floor(Math.random() * SAMPLE_HADITHS.length)
    return SAMPLE_HADITHS[randomIndex]
  }
}

// Export singleton instance
export const hadithApi = new HadithApi()
