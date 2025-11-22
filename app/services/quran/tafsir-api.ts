/**
 * Quran Foundation API - Tafsir Service
 * Fetch and cache Quran tafsir (commentary)
 * Adapted from D1 to expo-sqlite
 */

import { getDatabase } from './database'
import { makeQuranAPIRequest } from './auth'

export interface Tafsir {
  verse_key: string
  tafsir_resource_id: number
  tafsir_name: string
  language_name: string
  text: string // HTML content
  author_name?: string
}

interface TafsirVersesResponse {
  tafsirs: Array<{
    verse_key: string
    text: string
    verse_id?: number
    language_id?: number
    resource_name?: string
  }>
  meta?: {
    tafsir_name: string
    author_name?: string
    filters?: {
      chapter_number: string
    }
  }
}

interface TafsirsListResponse {
  tafsirs: Array<{
    id: number
    name: string
    author_name: string
    slug: string
    language_name: string
    translated_name: {
      name: string
      language_name: string
    }
  }>
}

/**
 * Popular Tafsir Resource IDs
 */
export const TAFSIR_RESOURCES = {
  IBN_KATHIR_EN: 169, // Tafsir Ibn Kathir (English)
  MAARIF_UL_QURAN_EN: 93, // Maarif-ul-Quran (English)
  // Add more as needed
} as const

/**
 * Fetch and cache tafsir for a specific chapter
 * Default is Tafsir Ibn Kathir (English)
 */
export async function fetchAndCacheChapterTafsir(
  chapterNumber: number,
  tafsirId: number = TAFSIR_RESOURCES.IBN_KATHIR_EN
): Promise<void> {
  const db = await getDatabase()

  // Check if already cached with actual text content
  const existing = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM quran_tafsirs t
     INNER JOIN quran_verses v ON t.verse_key = v.verse_key
     WHERE v.chapter_id = ? AND t.tafsir_resource_id = ? AND t.text IS NOT NULL AND t.text != ''`,
    chapterNumber,
    tafsirId
  )

  if (existing && existing.count > 0) {
    console.log(`✅ Chapter ${chapterNumber} tafsir already cached (${existing.count} verses)`)
    return
  }

  // Clear any incomplete/bad cache entries for this chapter
  await db.runAsync(
    `DELETE FROM quran_tafsirs WHERE verse_key LIKE ? AND tafsir_resource_id = ?`,
    `${chapterNumber}:%`,
    tafsirId
  )

  console.log(`🔄 Fetching tafsir for chapter ${chapterNumber}...`)

  // Fetch tafsir using the correct endpoint
  const data = await makeQuranAPIRequest<TafsirVersesResponse>(
    `/tafsirs/${tafsirId}/by_chapter/${chapterNumber}`
  )

  console.log(`📚 Caching tafsir for ${data.tafsirs.length} verses...`)

  // Insert tafsirs
  const tafsirName = data.meta?.tafsir_name || 'Tafsir Ibn Kathir'

  for (const tafsir of data.tafsirs) {
    await db.runAsync(
      `INSERT OR REPLACE INTO quran_tafsirs (
        verse_key, tafsir_resource_id, tafsir_name, language_name, text
      ) VALUES (?, ?, ?, ?, ?)`,
      tafsir.verse_key,
      tafsirId,
      tafsirName,
      'english',
      tafsir.text
    )
  }

  console.log(`✅ Cached tafsir for chapter ${chapterNumber}`)
}

/**
 * Get tafsir for all verses in a chapter
 */
export async function getChapterTafsir(
  chapterNumber: number,
  tafsirId: number = TAFSIR_RESOURCES.IBN_KATHIR_EN
): Promise<Tafsir[]> {
  const db = await getDatabase()

  // Ensure tafsir is cached
  await fetchAndCacheChapterTafsir(chapterNumber, tafsirId)

  const result = await db.getAllAsync<any>(
    `SELECT t.*
     FROM quran_tafsirs t
     INNER JOIN quran_verses v ON t.verse_key = v.verse_key
     WHERE v.chapter_id = ? AND t.tafsir_resource_id = ?
     ORDER BY v.verse_number`,
    chapterNumber,
    tafsirId
  )

  return result.map((row) => ({
    verse_key: row.verse_key,
    tafsir_resource_id: row.tafsir_resource_id,
    tafsir_name: row.tafsir_name,
    language_name: row.language_name,
    text: row.text,
  }))
}

/**
 * Get tafsir for a specific verse
 */
export async function getVerseTafsir(
  verseKey: string,
  tafsirId: number = TAFSIR_RESOURCES.IBN_KATHIR_EN
): Promise<Tafsir | null> {
  const db = await getDatabase()

  // Parse chapter number from verse key
  const [chapterStr] = verseKey.split(':')
  const chapterNumber = parseInt(chapterStr)

  // Ensure tafsir is cached for this chapter
  await fetchAndCacheChapterTafsir(chapterNumber, tafsirId)

  const row = await db.getFirstAsync<any>(
    'SELECT * FROM quran_tafsirs WHERE verse_key = ? AND tafsir_resource_id = ?',
    verseKey,
    tafsirId
  )

  if (!row) return null

  return {
    verse_key: row.verse_key,
    tafsir_resource_id: row.tafsir_resource_id,
    tafsir_name: row.tafsir_name,
    language_name: row.language_name,
    text: row.text,
  }
}

/**
 * Get verses with tafsir for a chapter
 * Returns combined data for easier rendering
 */
export async function getChapterWithTafsir(
  chapterNumber: number,
  tafsirId: number = TAFSIR_RESOURCES.IBN_KATHIR_EN
): Promise<
  Array<{
    verse_key: string
    verse_number: number
    text_uthmani: string
    translations: any[]
    tafsir_text: string
    tafsir_name: string
  }>
> {
  const db = await getDatabase()

  // Ensure both verses and tafsir are cached
  await fetchAndCacheChapterTafsir(chapterNumber, tafsirId)

  const result = await db.getAllAsync<any>(
    `SELECT
       v.verse_key,
       v.verse_number,
       v.text_uthmani,
       v.translations,
       t.text as tafsir_text,
       t.tafsir_name
     FROM quran_verses v
     LEFT JOIN quran_tafsirs t ON v.verse_key = t.verse_key AND t.tafsir_resource_id = ?
     WHERE v.chapter_id = ?
     ORDER BY v.verse_number`,
    tafsirId,
    chapterNumber
  )

  return result.map((row) => ({
    verse_key: row.verse_key,
    verse_number: row.verse_number,
    text_uthmani: row.text_uthmani,
    translations: JSON.parse(row.translations),
    tafsir_text: row.tafsir_text,
    tafsir_name: row.tafsir_name,
  }))
}

/**
 * Get list of available tafsirs
 * Fetches from API, caches locally if needed
 */
export async function getAvailableTafsirs(
  language: string = 'en'
): Promise<TafsirsListResponse['tafsirs']> {
  const data = await makeQuranAPIRequest<TafsirsListResponse>(`/tafsirs?language=${language}`)

  return data.tafsirs
}

/**
 * Cache all popular tafsirs for a chapter
 */
export async function cacheAllTafsirsForChapter(chapterNumber: number): Promise<void> {
  console.log(`🔄 Caching all popular tafsirs for chapter ${chapterNumber}...`)

  // Cache Ibn Kathir (most popular)
  await fetchAndCacheChapterTafsir(chapterNumber, TAFSIR_RESOURCES.IBN_KATHIR_EN)

  // Cache Maarif-ul-Quran
  await fetchAndCacheChapterTafsir(chapterNumber, TAFSIR_RESOURCES.MAARIF_UL_QURAN_EN)

  console.log(`✅ Cached all tafsirs for chapter ${chapterNumber}`)
}
