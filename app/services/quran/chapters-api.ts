/**
 * Quran Foundation API - Chapters Service
 * Fetch and cache all 114 Quran chapters metadata
 * Adapted from D1 to expo-sqlite
 */

import { getDatabase } from './database'
import { makeQuranAPIRequest } from './auth'

export interface Chapter {
  id: number
  name_simple: string
  name_complex: string
  name_arabic: string
  translated_name: string
  verses_count: number
  revelation_place: 'makkah' | 'madinah'
  revelation_order: number
  bismillah_pre: boolean
  pages: [number, number]
}

interface ChaptersResponse {
  chapters: Array<{
    id: number
    name_simple: string
    name_complex: string
    name_arabic: string
    translated_name: {
      name: string
      language_name: string
    }
    verses_count: number
    revelation_place: string
    revelation_order: number
    bismillah_pre: boolean
    pages: [number, number]
  }>
}

/**
 * Fetch and cache all 114 Quran chapters metadata
 * This only needs to run once - data never changes
 */
export async function fetchAndCacheChapters(): Promise<void> {
  const db = await getDatabase()

  // Check if already cached
  const status = await db.getFirstAsync<{ is_populated: number }>(
    'SELECT is_populated FROM quran_cache_status WHERE cache_type = ?',
    'chapters'
  )

  if (status?.is_populated === 1) {
    console.log('✅ Chapters already cached')
    return
  }

  console.log('🔄 Fetching all Quran chapters...')

  const data = await makeQuranAPIRequest<ChaptersResponse>('/chapters?language=en')

  console.log(`📖 Caching ${data.chapters.length} chapters...`)

  // Insert all chapters
  for (const chapter of data.chapters) {
    await db.runAsync(
      `INSERT INTO quran_chapters (
        id, name_simple, name_complex, name_arabic, translated_name,
        verses_count, revelation_place, revelation_order,
        bismillah_pre, pages
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      chapter.id,
      chapter.name_simple,
      chapter.name_complex,
      chapter.name_arabic,
      chapter.translated_name.name,
      chapter.verses_count,
      chapter.revelation_place,
      chapter.revelation_order,
      chapter.bismillah_pre ? 1 : 0,
      JSON.stringify(chapter.pages)
    )
  }

  // Update cache status
  await db.runAsync(
    'UPDATE quran_cache_status SET is_populated = 1, last_updated = datetime("now"), total_records = ? WHERE cache_type = ?',
    data.chapters.length,
    'chapters'
  )

  console.log(`✅ Cached ${data.chapters.length} chapters successfully`)
}

/**
 * Get all chapters from cache
 */
export async function getAllChapters(): Promise<Chapter[]> {
  const db = await getDatabase()

  // Ensure chapters are cached
  await fetchAndCacheChapters()

  const result = await db.getAllAsync<any>('SELECT * FROM quran_chapters ORDER BY id')

  return result.map((row) => ({
    id: row.id,
    name_simple: row.name_simple,
    name_complex: row.name_complex,
    name_arabic: row.name_arabic,
    translated_name: row.translated_name,
    verses_count: row.verses_count,
    revelation_place: row.revelation_place as 'makkah' | 'madinah',
    revelation_order: row.revelation_order,
    bismillah_pre: row.bismillah_pre === 1,
    pages: JSON.parse(row.pages),
  }))
}

/**
 * Get a single chapter by ID (1-114)
 */
export async function getChapterById(id: number): Promise<Chapter | null> {
  const db = await getDatabase()

  // Ensure chapters are cached
  await fetchAndCacheChapters()

  const row = await db.getFirstAsync<any>('SELECT * FROM quran_chapters WHERE id = ?', id)

  if (!row) return null

  return {
    id: row.id,
    name_simple: row.name_simple,
    name_complex: row.name_complex,
    name_arabic: row.name_arabic,
    translated_name: row.translated_name,
    verses_count: row.verses_count,
    revelation_place: row.revelation_place as 'makkah' | 'madinah',
    revelation_order: row.revelation_order,
    bismillah_pre: row.bismillah_pre === 1,
    pages: JSON.parse(row.pages),
  }
}

/**
 * Fetch and cache chapter info (description/context)
 */
export async function fetchAndCacheChapterInfo(chapterId: number): Promise<void> {
  const db = await getDatabase()

  // Check if already cached
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM quran_chapter_info WHERE chapter_id = ?',
    chapterId
  )

  if (existing) {
    console.log(`✅ Chapter ${chapterId} info already cached`)
    return
  }

  console.log(`🔄 Fetching info for chapter ${chapterId}...`)

  const response = await makeQuranAPIRequest<{
    chapter_info: {
      id: number
      chapter_id: number
      short_text: string
      text: string
      source: string
      language_name: string
    }
  }>(`/chapters/${chapterId}/info`)

  const info = response.chapter_info

  await db.runAsync(
    'INSERT INTO quran_chapter_info (chapter_id, short_text, text, source, language_name) VALUES (?, ?, ?, ?, ?)',
    chapterId,
    info.short_text || '',
    info.text || '',
    info.source || 'Unknown',
    info.language_name || 'english'
  )

  console.log(`✅ Cached info for chapter ${chapterId}`)
}

/**
 * Get chapter info from cache
 */
export async function getChapterInfo(chapterId: number): Promise<{
  chapter_id: number
  short_text: string
  text: string
  source: string
  language_name: string
} | null> {
  const db = await getDatabase()

  // Try to get from cache
  const cached = await db.getFirstAsync<any>(
    'SELECT * FROM quran_chapter_info WHERE chapter_id = ?',
    chapterId
  )

  if (!cached) {
    // Fetch and cache if not available
    await fetchAndCacheChapterInfo(chapterId)
    return getChapterInfo(chapterId)
  }

  return cached
}
