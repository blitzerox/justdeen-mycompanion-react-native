/**
 * Quran Foundation API - Verses Service
 * Fetch and cache Quran verses with translations and word-by-word data
 * Adapted from D1 to expo-sqlite
 */

import { getDatabase } from './database'
import { makeQuranAPIRequest } from './auth'

export interface Translation {
  resource_id: number
  text: string
  resource_name?: string
}

export interface Word {
  id: number
  position: number
  text_uthmani?: string
  text_imlaei?: string
  audio_url?: string
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
  verse_key: string
  chapter_id: number
  verse_number: number
  page_number: number
  juz_number: number
  hizb_number: number
  text_uthmani: string
  text_imlaei?: string
  text_indopak?: string
  translations: Translation[]
  words?: Word[]
}

interface VersesResponse {
  verses: Array<{
    id: number
    verse_key: string
    verse_number: number
    page_number: number
    juz_number: number
    hizb_number: number
    rub_el_hizb_number: number
    text_uthmani: string
    text_imlaei?: string
    text_indopak?: string
    words?: any[]
    translations?: any[]
  }>
  pagination?: {
    per_page: number
    current_page: number
    next_page: number | null
    total_pages: number
    total_records: number
  }
}

/**
 * Fetch and cache all verses for a specific chapter
 * Uses separate API calls for verses and translations as per Quran Foundation API v4
 */
export async function fetchAndCacheChapterVerses(
  chapterNumber: number,
  options: {
    translations?: number[] // Array of translation IDs, default [131] (Clear Quran)
    includeWords?: boolean // Include word-by-word data, default true
  } = {}
): Promise<void> {
  const { translations = [131], includeWords = true } = options
  const db = await getDatabase()

  // Check if already cached
  const existing = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM quran_verses WHERE chapter_id = ?',
    chapterNumber
  )

  if (existing && existing.count > 0) {
    console.log(`✅ Chapter ${chapterNumber} verses already cached`)
    return
  }

  console.log(`🔄 Fetching verses for chapter ${chapterNumber}...`)

  // Step 1: Fetch Arabic text (Uthmani/Imlaei) and metadata
  const versesParams = new URLSearchParams({
    language: 'en',
    per_page: '300',
    fields: 'text_uthmani,text_imlaei',
  })

  if (includeWords) {
    versesParams.append('words', 'true')
  }

  const versesData = await makeQuranAPIRequest<VersesResponse>(
    `/verses/by_chapter/${chapterNumber}?${versesParams.toString()}`
  )

  console.log(`📖 Fetched ${versesData.verses.length} verses for chapter ${chapterNumber}`)

  // Step 2: Fetch Indo-Pak script verses
  const indopakData = await makeQuranAPIRequest<VersesResponse>(
    `/quran/verses/indopak?chapter_number=${chapterNumber}`
  )

  console.log(`📖 Fetched ${indopakData.verses.length} Indo-Pak verses for chapter ${chapterNumber}`)

  // Create a map of Indo-Pak text by verse_key
  const indopakMap = new Map<string, string>()
  indopakData.verses.forEach(v => {
    indopakMap.set(v.verse_key, v.text_indopak || '')
  })

  // Step 3: Fetch translations using the correct v4 endpoint
  const translationData = await makeQuranAPIRequest<{
    translations: Array<{
      resource_id: number
      text: string
      resource_name?: string
      verse_key: string
      verse_number: number
    }>
  }>(`/quran/translations/${translations[0]}?chapter_number=${chapterNumber}`)

  console.log(`📖 Fetched ${translationData.translations.length} translations for chapter ${chapterNumber}`)

  // Create a map of translations by verse_key for easy lookup
  const translationsMap = new Map<string, Array<{
    resource_id: number
    text: string
    resource_name?: string
  }>>()

  translationData.translations.forEach(t => {
    const existing = translationsMap.get(t.verse_key) || []
    existing.push({
      resource_id: t.resource_id,
      text: t.text,
      resource_name: t.resource_name
    })
    translationsMap.set(t.verse_key, existing)
  })

  // Insert all verses with their translations
  for (const verse of versesData.verses) {
    const verseTranslations = translationsMap.get(verse.verse_key) || []
    const indopakText = indopakMap.get(verse.verse_key) || null

    await db.runAsync(
      `INSERT INTO quran_verses (
        id, verse_key, chapter_id, verse_number, page_number,
        juz_number, hizb_number, text_uthmani, text_imlaei, text_indopak,
        translations, words
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      verse.id,
      verse.verse_key,
      chapterNumber,
      verse.verse_number,
      verse.page_number,
      verse.juz_number,
      verse.hizb_number,
      verse.text_uthmani,
      verse.text_imlaei || null,
      indopakText,
      JSON.stringify(verseTranslations),
      JSON.stringify(verse.words || [])
    )
  }

  console.log(`✅ Cached ${versesData.verses.length} verses with translations for chapter ${chapterNumber}`)
}

/**
 * Get all verses for a chapter from cache
 * Optionally fetch a specific translation dynamically
 */
export async function getChapterVerses(
  chapterNumber: number,
  translationId: number = 131
): Promise<Verse[]> {
  const db = await getDatabase()

  // Ensure verses are cached (with default translation)
  await fetchAndCacheChapterVerses(chapterNumber)

  const result = await db.getAllAsync<any>(
    'SELECT * FROM quran_verses WHERE chapter_id = ? ORDER BY verse_number',
    chapterNumber
  )

  // If requesting a different translation than the default (131),
  // fetch it from the API and merge with cached verses
  let dynamicTranslations: Map<string, Translation> = new Map()

  if (translationId !== 131) {
    try {
      const translationData = await makeQuranAPIRequest<{
        translations: Array<{
          resource_id: number
          text: string
          resource_name?: string
          verse_key: string
        }>
      }>(`/quran/translations/${translationId}?chapter_number=${chapterNumber}`)

      translationData.translations.forEach(t => {
        dynamicTranslations.set(t.verse_key, {
          resource_id: t.resource_id,
          text: t.text,
          resource_name: t.resource_name
        })
      })

      console.log(`📖 Fetched ${translationData.translations.length} dynamic translations for chapter ${chapterNumber}`)
    } catch (err) {
      console.error(`Failed to fetch translation ${translationId}:`, err)
    }
  }

  return result.map((row) => {
    const cachedTranslations = JSON.parse(row.translations)

    // If we have a dynamic translation for this verse, use it instead of cached one
    const translations = dynamicTranslations.has(row.verse_key)
      ? [dynamicTranslations.get(row.verse_key)!]
      : cachedTranslations

    return {
      id: row.id,
      verse_key: row.verse_key,
      chapter_id: row.chapter_id,
      verse_number: row.verse_number,
      page_number: row.page_number,
      juz_number: row.juz_number,
      hizb_number: row.hizb_number,
      text_uthmani: row.text_uthmani,
      text_imlaei: row.text_imlaei,
      text_indopak: row.text_indopak,
      translations,
      words: row.words ? JSON.parse(row.words) : undefined,
    }
  })
}

/**
 * Get a single verse by verse key (e.g., "1:1", "2:255")
 */
export async function getVerseByKey(verseKey: string): Promise<Verse | null> {
  const db = await getDatabase()

  // Parse chapter number from verse key
  const [chapterStr] = verseKey.split(':')
  const chapterNumber = parseInt(chapterStr)

  // Ensure chapter is cached
  await fetchAndCacheChapterVerses(chapterNumber)

  const row = await db.getFirstAsync<any>(
    'SELECT * FROM quran_verses WHERE verse_key = ?',
    verseKey
  )

  if (!row) return null

  return {
    id: row.id,
    verse_key: row.verse_key,
    chapter_id: row.chapter_id,
    verse_number: row.verse_number,
    page_number: row.page_number,
    juz_number: row.juz_number,
    hizb_number: row.hizb_number,
    text_uthmani: row.text_uthmani,
    text_imlaei: row.text_imlaei,
    translations: JSON.parse(row.translations),
    words: row.words ? JSON.parse(row.words) : undefined,
  }
}

/**
 * Get verses by Juz number (1-30)
 */
export async function getVersesByJuz(juzNumber: number): Promise<Verse[]> {
  const db = await getDatabase()

  // Check if juz data exists in cache
  const existing = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM quran_verses WHERE juz_number = ?',
    juzNumber
  )

  // If not cached, we need to fetch all 114 chapters to ensure juz data is complete
  if (!existing || existing.count === 0) {
    console.log(`📚 Juz ${juzNumber} not cached, fetching all chapters...`)
    // Fetch all chapters (this will populate the database with all verses including juz numbers)
    for (let i = 1; i <= 114; i++) {
      await fetchAndCacheChapterVerses(i)
    }
  }

  const result = await db.getAllAsync<any>(
    'SELECT * FROM quran_verses WHERE juz_number = ? ORDER BY id',
    juzNumber
  )

  return result.map((row) => ({
    id: row.id,
    verse_key: row.verse_key,
    chapter_id: row.chapter_id,
    verse_number: row.verse_number,
    page_number: row.page_number,
    juz_number: row.juz_number,
    hizb_number: row.hizb_number,
    text_uthmani: row.text_uthmani,
    text_imlaei: row.text_imlaei,
    text_indopak: row.text_indopak,
    translations: JSON.parse(row.translations),
    words: row.words ? JSON.parse(row.words) : undefined,
  }))
}

/**
 * Get verses by page number (1-604)
 */
export async function getVersesByPage(pageNumber: number): Promise<Verse[]> {
  const db = await getDatabase()

  // Check if page data exists in cache
  const existing = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM quran_verses WHERE page_number = ?',
    pageNumber
  )

  // If not cached, we need to fetch all 114 chapters to ensure page data is complete
  if (!existing || existing.count === 0) {
    console.log(`📚 Page ${pageNumber} not cached, fetching all chapters...`)
    // Fetch all chapters (this will populate the database with all verses including page numbers)
    for (let i = 1; i <= 114; i++) {
      await fetchAndCacheChapterVerses(i)
    }
  }

  const result = await db.getAllAsync<any>(
    'SELECT * FROM quran_verses WHERE page_number = ? ORDER BY id',
    pageNumber
  )

  return result.map((row) => ({
    id: row.id,
    verse_key: row.verse_key,
    chapter_id: row.chapter_id,
    verse_number: row.verse_number,
    page_number: row.page_number,
    juz_number: row.juz_number,
    hizb_number: row.hizb_number,
    text_uthmani: row.text_uthmani,
    text_imlaei: row.text_imlaei,
    text_indopak: row.text_indopak,
    translations: JSON.parse(row.translations),
    words: row.words ? JSON.parse(row.words) : undefined,
  }))
}

/**
 * Search verses by Arabic text or translation
 */
export async function searchVerses(query: string, limit: number = 50): Promise<Verse[]> {
  const db = await getDatabase()

  const result = await db.getAllAsync<any>(
    `SELECT * FROM quran_verses
     WHERE text_uthmani LIKE ? OR translations LIKE ?
     ORDER BY id
     LIMIT ?`,
    `%${query}%`,
    `%${query}%`,
    limit
  )

  return result.map((row) => ({
    id: row.id,
    verse_key: row.verse_key,
    chapter_id: row.chapter_id,
    verse_number: row.verse_number,
    page_number: row.page_number,
    juz_number: row.juz_number,
    hizb_number: row.hizb_number,
    text_uthmani: row.text_uthmani,
    text_imlaei: row.text_imlaei,
    text_indopak: row.text_indopak,
    translations: JSON.parse(row.translations),
    words: row.words ? JSON.parse(row.words) : undefined,
  }))
}

/**
 * Clear cached verses for a specific chapter
 * Useful for forcing a re-fetch with updated data
 */
export async function clearChapterCache(chapterNumber: number): Promise<void> {
  const db = await getDatabase()
  await db.runAsync('DELETE FROM quran_verses WHERE chapter_id = ?', chapterNumber)
  console.log(`✅ Cleared cache for chapter ${chapterNumber}`)
}

/**
 * Force refresh verses for a chapter (clear cache and re-fetch)
 */
export async function refreshChapterVerses(chapterNumber: number): Promise<void> {
  await clearChapterCache(chapterNumber)
  await fetchAndCacheChapterVerses(chapterNumber)
}
