/**
 * Quran API Service
 * Now uses Quran Foundation API with local SQLite caching
 * Maintains backward compatibility with existing interface
 */

import { getAllChapters, getChapterById } from './chapters-api'
import { getChapterVerses, searchVerses } from './verses-api'
import { getVerseTafsir, TAFSIR_RESOURCES } from './tafsir-api'
import { getAllTranslations } from './translations-api'

export interface Surah {
  id: number
  name: string // Arabic name
  transliteration: string // English transliteration
  translation: string // English translation
  type: "meccan" | "medinan"
  totalVerses: number
  revelationOrder: number
}

export interface Word {
  id: number
  position: number
  text_uthmani?: string
  char_type_name: string
  translation?: {
    text: string
    language_name: string
  }
  transliteration?: {
    text: string
    language_name: string
  }
}

export interface Verse {
  id: number
  verseNumber: number
  verseKey: string // e.g., "1:1"
  textUthmani: string // Uthmani Arabic text
  textImlaei?: string // Imlaei Arabic text
  textIndopak?: string // Indo-Pak Arabic text
  translations: Translation[]
  words?: Word[] // Word-by-word data with transliteration
  audio?: string // Audio URL
  juzNumber?: number
  hizbNumber?: number
  pageNumber?: number
}

export interface Translation {
  id: number
  languageCode: string
  text: string
  translatorName: string
}

export interface Juz {
  id: number
  number: number
  verseMapping: {
    [surahNumber: string]: string // "1": "1-7"
  }
}

// List of 114 Surahs
export const SURAHS: Surah[] = [
  { id: 1, name: "الفاتحة", transliteration: "Al-Fatihah", translation: "The Opening", type: "meccan", totalVerses: 7, revelationOrder: 5 },
  { id: 2, name: "البقرة", transliteration: "Al-Baqarah", translation: "The Cow", type: "medinan", totalVerses: 286, revelationOrder: 87 },
  { id: 3, name: "آل عمران", transliteration: "Ali 'Imran", translation: "Family of Imran", type: "medinan", totalVerses: 200, revelationOrder: 89 },
  { id: 4, name: "النساء", transliteration: "An-Nisa", translation: "The Women", type: "medinan", totalVerses: 176, revelationOrder: 92 },
  { id: 5, name: "المائدة", transliteration: "Al-Ma'idah", translation: "The Table Spread", type: "medinan", totalVerses: 120, revelationOrder: 112 },
  { id: 6, name: "الأنعام", transliteration: "Al-An'am", translation: "The Cattle", type: "meccan", totalVerses: 165, revelationOrder: 55 },
  { id: 7, name: "الأعراف", transliteration: "Al-A'raf", translation: "The Heights", type: "meccan", totalVerses: 206, revelationOrder: 39 },
  { id: 8, name: "الأنفال", transliteration: "Al-Anfal", translation: "The Spoils of War", type: "medinan", totalVerses: 75, revelationOrder: 88 },
  { id: 9, name: "التوبة", transliteration: "At-Tawbah", translation: "The Repentance", type: "medinan", totalVerses: 129, revelationOrder: 113 },
  { id: 10, name: "يونس", transliteration: "Yunus", translation: "Jonah", type: "meccan", totalVerses: 109, revelationOrder: 51 },
  { id: 11, name: "هود", transliteration: "Hud", translation: "Hud", type: "meccan", totalVerses: 123, revelationOrder: 52 },
  { id: 12, name: "يوسف", transliteration: "Yusuf", translation: "Joseph", type: "meccan", totalVerses: 111, revelationOrder: 53 },
  { id: 13, name: "الرعد", transliteration: "Ar-Ra'd", translation: "The Thunder", type: "medinan", totalVerses: 43, revelationOrder: 96 },
  { id: 14, name: "إبراهيم", transliteration: "Ibrahim", translation: "Abraham", type: "meccan", totalVerses: 52, revelationOrder: 72 },
  { id: 15, name: "الحجر", transliteration: "Al-Hijr", translation: "The Rocky Tract", type: "meccan", totalVerses: 99, revelationOrder: 54 },
  { id: 16, name: "النحل", transliteration: "An-Nahl", translation: "The Bee", type: "meccan", totalVerses: 128, revelationOrder: 70 },
  { id: 17, name: "الإسراء", transliteration: "Al-Isra", translation: "The Night Journey", type: "meccan", totalVerses: 111, revelationOrder: 50 },
  { id: 18, name: "الكهف", transliteration: "Al-Kahf", translation: "The Cave", type: "meccan", totalVerses: 110, revelationOrder: 69 },
  { id: 19, name: "مريم", transliteration: "Maryam", translation: "Mary", type: "meccan", totalVerses: 98, revelationOrder: 44 },
  { id: 20, name: "طه", transliteration: "Taha", translation: "Ta-Ha", type: "meccan", totalVerses: 135, revelationOrder: 45 },
  { id: 21, name: "الأنبياء", transliteration: "Al-Anbya", translation: "The Prophets", type: "meccan", totalVerses: 112, revelationOrder: 73 },
  { id: 22, name: "الحج", transliteration: "Al-Hajj", translation: "The Pilgrimage", type: "medinan", totalVerses: 78, revelationOrder: 103 },
  { id: 23, name: "المؤمنون", transliteration: "Al-Mu'minun", translation: "The Believers", type: "meccan", totalVerses: 118, revelationOrder: 74 },
  { id: 24, name: "النور", transliteration: "An-Nur", translation: "The Light", type: "medinan", totalVerses: 64, revelationOrder: 102 },
  { id: 25, name: "الفرقان", transliteration: "Al-Furqan", translation: "The Criterion", type: "meccan", totalVerses: 77, revelationOrder: 42 },
  { id: 26, name: "الشعراء", transliteration: "Ash-Shu'ara", translation: "The Poets", type: "meccan", totalVerses: 227, revelationOrder: 47 },
  { id: 27, name: "النمل", transliteration: "An-Naml", translation: "The Ant", type: "meccan", totalVerses: 93, revelationOrder: 48 },
  { id: 28, name: "القصص", transliteration: "Al-Qasas", translation: "The Stories", type: "meccan", totalVerses: 88, revelationOrder: 49 },
  { id: 29, name: "العنكبوت", transliteration: "Al-'Ankabut", translation: "The Spider", type: "meccan", totalVerses: 69, revelationOrder: 85 },
  { id: 30, name: "الروم", transliteration: "Ar-Rum", translation: "The Romans", type: "meccan", totalVerses: 60, revelationOrder: 84 },
  { id: 31, name: "لقمان", transliteration: "Luqman", translation: "Luqman", type: "meccan", totalVerses: 34, revelationOrder: 57 },
  { id: 32, name: "السجدة", transliteration: "As-Sajdah", translation: "The Prostration", type: "meccan", totalVerses: 30, revelationOrder: 75 },
  { id: 33, name: "الأحزاب", transliteration: "Al-Ahzab", translation: "The Combined Forces", type: "medinan", totalVerses: 73, revelationOrder: 90 },
  { id: 34, name: "سبإ", transliteration: "Saba", translation: "Sheba", type: "meccan", totalVerses: 54, revelationOrder: 58 },
  { id: 35, name: "فاطر", transliteration: "Fatir", translation: "Originator", type: "meccan", totalVerses: 45, revelationOrder: 43 },
  { id: 36, name: "يس", transliteration: "Ya-Sin", translation: "Ya Sin", type: "meccan", totalVerses: 83, revelationOrder: 41 },
  { id: 37, name: "الصافات", transliteration: "As-Saffat", translation: "Those who set the Ranks", type: "meccan", totalVerses: 182, revelationOrder: 56 },
  { id: 38, name: "ص", transliteration: "Sad", translation: "The Letter 'Saad'", type: "meccan", totalVerses: 88, revelationOrder: 38 },
  { id: 39, name: "الزمر", transliteration: "Az-Zumar", translation: "The Troops", type: "meccan", totalVerses: 75, revelationOrder: 59 },
  { id: 40, name: "غافر", transliteration: "Ghafir", translation: "The Forgiver", type: "meccan", totalVerses: 85, revelationOrder: 60 },
  { id: 41, name: "فصلت", transliteration: "Fussilat", translation: "Explained in Detail", type: "meccan", totalVerses: 54, revelationOrder: 61 },
  { id: 42, name: "الشورى", transliteration: "Ash-Shuraa", translation: "The Consultation", type: "meccan", totalVerses: 53, revelationOrder: 62 },
  { id: 43, name: "الزخرف", transliteration: "Az-Zukhruf", translation: "The Ornaments of Gold", type: "meccan", totalVerses: 89, revelationOrder: 63 },
  { id: 44, name: "الدخان", transliteration: "Ad-Dukhan", translation: "The Smoke", type: "meccan", totalVerses: 59, revelationOrder: 64 },
  { id: 45, name: "الجاثية", transliteration: "Al-Jathiyah", translation: "The Crouching", type: "meccan", totalVerses: 37, revelationOrder: 65 },
  { id: 46, name: "الأحقاف", transliteration: "Al-Ahqaf", translation: "The Wind-Curved Sandhills", type: "meccan", totalVerses: 35, revelationOrder: 66 },
  { id: 47, name: "محمد", transliteration: "Muhammad", translation: "Muhammad", type: "medinan", totalVerses: 38, revelationOrder: 95 },
  { id: 48, name: "الفتح", transliteration: "Al-Fath", translation: "The Victory", type: "medinan", totalVerses: 29, revelationOrder: 111 },
  { id: 49, name: "الحجرات", transliteration: "Al-Hujurat", translation: "The Rooms", type: "medinan", totalVerses: 18, revelationOrder: 106 },
  { id: 50, name: "ق", transliteration: "Qaf", translation: "The Letter 'Qaf'", type: "meccan", totalVerses: 45, revelationOrder: 34 },
  { id: 51, name: "الذاريات", transliteration: "Adh-Dhariyat", translation: "The Winnowing Winds", type: "meccan", totalVerses: 60, revelationOrder: 67 },
  { id: 52, name: "الطور", transliteration: "At-Tur", translation: "The Mount", type: "meccan", totalVerses: 49, revelationOrder: 76 },
  { id: 53, name: "النجم", transliteration: "An-Najm", translation: "The Star", type: "meccan", totalVerses: 62, revelationOrder: 23 },
  { id: 54, name: "القمر", transliteration: "Al-Qamar", translation: "The Moon", type: "meccan", totalVerses: 55, revelationOrder: 37 },
  { id: 55, name: "الرحمن", transliteration: "Ar-Rahman", translation: "The Beneficent", type: "medinan", totalVerses: 78, revelationOrder: 97 },
  { id: 56, name: "الواقعة", transliteration: "Al-Waqi'ah", translation: "The Inevitable", type: "meccan", totalVerses: 96, revelationOrder: 46 },
  { id: 57, name: "الحديد", transliteration: "Al-Hadid", translation: "The Iron", type: "medinan", totalVerses: 29, revelationOrder: 94 },
  { id: 58, name: "المجادلة", transliteration: "Al-Mujadila", translation: "The Pleading Woman", type: "medinan", totalVerses: 22, revelationOrder: 105 },
  { id: 59, name: "الحشر", transliteration: "Al-Hashr", translation: "The Exile", type: "medinan", totalVerses: 24, revelationOrder: 101 },
  { id: 60, name: "الممتحنة", transliteration: "Al-Mumtahanah", translation: "She that is to be examined", type: "medinan", totalVerses: 13, revelationOrder: 91 },
  { id: 61, name: "الصف", transliteration: "As-Saf", translation: "The Ranks", type: "medinan", totalVerses: 14, revelationOrder: 109 },
  { id: 62, name: "الجمعة", transliteration: "Al-Jumu'ah", translation: "The Congregation", type: "medinan", totalVerses: 11, revelationOrder: 110 },
  { id: 63, name: "المنافقون", transliteration: "Al-Munafiqun", translation: "The Hypocrites", type: "medinan", totalVerses: 11, revelationOrder: 104 },
  { id: 64, name: "التغابن", transliteration: "At-Taghabun", translation: "The Mutual Disillusion", type: "medinan", totalVerses: 18, revelationOrder: 108 },
  { id: 65, name: "الطلاق", transliteration: "At-Talaq", translation: "The Divorce", type: "medinan", totalVerses: 12, revelationOrder: 99 },
  { id: 66, name: "التحريم", transliteration: "At-Tahrim", translation: "The Prohibition", type: "medinan", totalVerses: 12, revelationOrder: 107 },
  { id: 67, name: "الملك", transliteration: "Al-Mulk", translation: "The Sovereignty", type: "meccan", totalVerses: 30, revelationOrder: 77 },
  { id: 68, name: "القلم", transliteration: "Al-Qalam", translation: "The Pen", type: "meccan", totalVerses: 52, revelationOrder: 2 },
  { id: 69, name: "الحاقة", transliteration: "Al-Haqqah", translation: "The Reality", type: "meccan", totalVerses: 52, revelationOrder: 78 },
  { id: 70, name: "المعارج", transliteration: "Al-Ma'arij", translation: "The Ascending Stairways", type: "meccan", totalVerses: 44, revelationOrder: 79 },
  { id: 71, name: "نوح", transliteration: "Nuh", translation: "Noah", type: "meccan", totalVerses: 28, revelationOrder: 71 },
  { id: 72, name: "الجن", transliteration: "Al-Jinn", translation: "The Jinn", type: "meccan", totalVerses: 28, revelationOrder: 40 },
  { id: 73, name: "المزمل", transliteration: "Al-Muzzammil", translation: "The Enshrouded One", type: "meccan", totalVerses: 20, revelationOrder: 3 },
  { id: 74, name: "المدثر", transliteration: "Al-Muddaththir", translation: "The Cloaked One", type: "meccan", totalVerses: 56, revelationOrder: 4 },
  { id: 75, name: "القيامة", transliteration: "Al-Qiyamah", translation: "The Resurrection", type: "meccan", totalVerses: 40, revelationOrder: 31 },
  { id: 76, name: "الإنسان", transliteration: "Al-Insan", translation: "The Man", type: "medinan", totalVerses: 31, revelationOrder: 98 },
  { id: 77, name: "المرسلات", transliteration: "Al-Mursalat", translation: "The Emissaries", type: "meccan", totalVerses: 50, revelationOrder: 33 },
  { id: 78, name: "النبإ", transliteration: "An-Naba", translation: "The Tidings", type: "meccan", totalVerses: 40, revelationOrder: 80 },
  { id: 79, name: "النازعات", transliteration: "An-Nazi'at", translation: "Those who drag forth", type: "meccan", totalVerses: 46, revelationOrder: 81 },
  { id: 80, name: "عبس", transliteration: "'Abasa", translation: "He Frowned", type: "meccan", totalVerses: 42, revelationOrder: 24 },
  { id: 81, name: "التكوير", transliteration: "At-Takwir", translation: "The Overthrowing", type: "meccan", totalVerses: 29, revelationOrder: 7 },
  { id: 82, name: "الإنفطار", transliteration: "Al-Infitar", translation: "The Cleaving", type: "meccan", totalVerses: 19, revelationOrder: 82 },
  { id: 83, name: "المطففين", transliteration: "Al-Mutaffifin", translation: "The Defrauding", type: "meccan", totalVerses: 36, revelationOrder: 86 },
  { id: 84, name: "الإنشقاق", transliteration: "Al-Inshiqaq", translation: "The Sundering", type: "meccan", totalVerses: 25, revelationOrder: 83 },
  { id: 85, name: "البروج", transliteration: "Al-Buruj", translation: "The Mansions of the Stars", type: "meccan", totalVerses: 22, revelationOrder: 27 },
  { id: 86, name: "الطارق", transliteration: "At-Tariq", translation: "The Nightcomer", type: "meccan", totalVerses: 17, revelationOrder: 36 },
  { id: 87, name: "الأعلى", transliteration: "Al-A'la", translation: "The Most High", type: "meccan", totalVerses: 19, revelationOrder: 8 },
  { id: 88, name: "الغاشية", transliteration: "Al-Ghashiyah", translation: "The Overwhelming", type: "meccan", totalVerses: 26, revelationOrder: 68 },
  { id: 89, name: "الفجر", transliteration: "Al-Fajr", translation: "The Dawn", type: "meccan", totalVerses: 30, revelationOrder: 10 },
  { id: 90, name: "البلد", transliteration: "Al-Balad", translation: "The City", type: "meccan", totalVerses: 20, revelationOrder: 35 },
  { id: 91, name: "الشمس", transliteration: "Ash-Shams", translation: "The Sun", type: "meccan", totalVerses: 15, revelationOrder: 26 },
  { id: 92, name: "الليل", transliteration: "Al-Layl", translation: "The Night", type: "meccan", totalVerses: 21, revelationOrder: 9 },
  { id: 93, name: "الضحى", transliteration: "Ad-Duhaa", translation: "The Morning Hours", type: "meccan", totalVerses: 11, revelationOrder: 11 },
  { id: 94, name: "الشرح", transliteration: "Ash-Sharh", translation: "The Relief", type: "meccan", totalVerses: 8, revelationOrder: 12 },
  { id: 95, name: "التين", transliteration: "At-Tin", translation: "The Fig", type: "meccan", totalVerses: 8, revelationOrder: 28 },
  { id: 96, name: "العلق", transliteration: "Al-'Alaq", translation: "The Clot", type: "meccan", totalVerses: 19, revelationOrder: 1 },
  { id: 97, name: "القدر", transliteration: "Al-Qadr", translation: "The Power", type: "meccan", totalVerses: 5, revelationOrder: 25 },
  { id: 98, name: "البينة", transliteration: "Al-Bayyinah", translation: "The Clear Proof", type: "medinan", totalVerses: 8, revelationOrder: 100 },
  { id: 99, name: "الزلزلة", transliteration: "Az-Zalzalah", translation: "The Earthquake", type: "medinan", totalVerses: 8, revelationOrder: 93 },
  { id: 100, name: "العاديات", transliteration: "Al-'Adiyat", translation: "The Courser", type: "meccan", totalVerses: 11, revelationOrder: 14 },
  { id: 101, name: "القارعة", transliteration: "Al-Qari'ah", translation: "The Calamity", type: "meccan", totalVerses: 11, revelationOrder: 30 },
  { id: 102, name: "التكاثر", transliteration: "At-Takathur", translation: "The Rivalry in world increase", type: "meccan", totalVerses: 8, revelationOrder: 16 },
  { id: 103, name: "العصر", transliteration: "Al-'Asr", translation: "The Declining Day", type: "meccan", totalVerses: 3, revelationOrder: 13 },
  { id: 104, name: "الهمزة", transliteration: "Al-Humazah", translation: "The Traducer", type: "meccan", totalVerses: 9, revelationOrder: 32 },
  { id: 105, name: "الفيل", transliteration: "Al-Fil", translation: "The Elephant", type: "meccan", totalVerses: 5, revelationOrder: 19 },
  { id: 106, name: "قريش", transliteration: "Quraysh", translation: "Quraysh", type: "meccan", totalVerses: 4, revelationOrder: 29 },
  { id: 107, name: "الماعون", transliteration: "Al-Ma'un", translation: "The Small kindnesses", type: "meccan", totalVerses: 7, revelationOrder: 17 },
  { id: 108, name: "الكوثر", transliteration: "Al-Kawthar", translation: "The Abundance", type: "meccan", totalVerses: 3, revelationOrder: 15 },
  { id: 109, name: "الكافرون", transliteration: "Al-Kafirun", translation: "The Disbelievers", type: "meccan", totalVerses: 6, revelationOrder: 18 },
  { id: 110, name: "النصر", transliteration: "An-Nasr", translation: "The Divine Support", type: "medinan", totalVerses: 3, revelationOrder: 114 },
  { id: 111, name: "المسد", transliteration: "Al-Masad", translation: "The Palm Fiber", type: "meccan", totalVerses: 5, revelationOrder: 6 },
  { id: 112, name: "الإخلاص", transliteration: "Al-Ikhlas", translation: "The Sincerity", type: "meccan", totalVerses: 4, revelationOrder: 22 },
  { id: 113, name: "الفلق", transliteration: "Al-Falaq", translation: "The Daybreak", type: "meccan", totalVerses: 5, revelationOrder: 20 },
  { id: 114, name: "الناس", transliteration: "An-Nas", translation: "Mankind", type: "meccan", totalVerses: 6, revelationOrder: 21 },
]

/**
 * Quran API Client
 * Now uses Quran Foundation API with local SQLite caching
 */
export class QuranApi {
  /**
   * Get list of all Surahs
   */
  async getSurahs(): Promise<Surah[]> {
    const chapters = await getAllChapters()

    // Map to existing interface
    return chapters.map((chapter) => ({
      id: chapter.id,
      name: chapter.name_arabic,
      transliteration: chapter.name_simple,
      translation: chapter.translated_name,
      type: chapter.revelation_place === 'makkah' ? 'meccan' : 'medinan',
      totalVerses: chapter.verses_count,
      revelationOrder: chapter.revelation_order,
    }))
  }

  /**
   * Get Surah by ID
   */
  async getSurah(surahId: number): Promise<Surah | undefined> {
    const chapter = await getChapterById(surahId)

    if (!chapter) return undefined

    return {
      id: chapter.id,
      name: chapter.name_arabic,
      transliteration: chapter.name_simple,
      translation: chapter.translated_name,
      type: chapter.revelation_place === 'makkah' ? 'meccan' : 'medinan',
      totalVerses: chapter.verses_count,
      revelationOrder: chapter.revelation_order,
    }
  }

  /**
   * Get verses for a Surah
   * Now fetches from Quran Foundation API with caching
   */
  async getVerses(surahNumber: number, translationId: number = 85): Promise<Verse[]> {
    const verses = await getChapterVerses(surahNumber, translationId)

    // Look up translator name from translations cache
    let translatorName = 'Abdel Haleem'
    try {
      const allTranslations = await getAllTranslations()
      const translation = allTranslations.find(t => t.id === translationId)
      if (translation) {
        translatorName = translation.author_name || translation.name
      }
    } catch (err) {
      console.error('Failed to look up translator name:', err)
    }

    // Map to existing interface
    return verses.map((verse) => ({
      id: verse.id,
      verseNumber: verse.verse_number,
      verseKey: verse.verse_key,
      textUthmani: verse.text_uthmani,
      textImlaei: verse.text_imlaei,
      textIndopak: verse.text_indopak,
      translations: verse.translations.map((t) => ({
        id: t.resource_id,
        languageCode: 'en',
        text: t.text,
        translatorName: translatorName,
      })),
      words: verse.words,
      juzNumber: verse.juz_number,
      hizbNumber: verse.hizb_number,
      pageNumber: verse.page_number,
    }))
  }

  /**
   * Get a single verse
   */
  async getVerse(verseKey: string, translationId: number = 85): Promise<Verse> {
    const [chapterStr] = verseKey.split(':')
    const chapterNumber = parseInt(chapterStr)

    const verses = await this.getVerses(chapterNumber)
    const verse = verses.find((v) => v.verseKey === verseKey)

    if (!verse) {
      throw new Error(`Verse ${verseKey} not found`)
    }

    return verse
  }

  /**
   * Search Quran
   */
  async searchQuran(query: string, limit: number = 20): Promise<Verse[]> {
    const results = await searchVerses(query, limit)

    // Map to existing interface
    return results.map((verse) => ({
      id: verse.id,
      verseNumber: verse.verse_number,
      verseKey: verse.verse_key,
      textUthmani: verse.text_uthmani,
      textImlaei: verse.text_imlaei,
      translations: verse.translations.map((t) => ({
        id: t.resource_id,
        languageCode: 'en',
        text: t.text,
        translatorName: t.resource_name || 'Clear Quran',
      })),
      juzNumber: verse.juz_number,
      hizbNumber: verse.hizb_number,
      pageNumber: verse.page_number,
    }))
  }

  /**
   * Get tafsir for a verse (new feature)
   */
  async getVerseTafsir(
    verseKey: string,
    tafsirId: number = TAFSIR_RESOURCES.IBN_KATHIR_EN
  ): Promise<{ text: string; name: string } | null> {
    const tafsir = await getVerseTafsir(verseKey, tafsirId)

    if (!tafsir) return null

    return {
      text: tafsir.text,
      name: tafsir.tafsir_name,
    }
  }
}

// Export singleton instance
export const quranApi = new QuranApi()
