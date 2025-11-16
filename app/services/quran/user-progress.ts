/**
 * Quran User Progress Service
 * Tracks user reading progress, bookmarks, and statistics
 */

import { getDatabase } from './database'

export interface UserProgress {
  verseKey: string
  chapterId: number
  verseNumber: number
  pageNumber: number
  isRead: boolean
  isBookmarked: boolean
  readAt?: string
  bookmarkedAt?: string
}

export interface ReadingStats {
  totalVersesRead: number
  totalPagesRead: number
  totalBookmarks: number
  lastReadVerse?: {
    verseKey: string
    chapterId: number
    verseNumber: number
    readAt: string
  }
  lastBookmarkedVerse?: {
    verseKey: string
    chapterId: number
    verseNumber: number
    bookmarkedAt: string
  }
}

/**
 * Mark a verse as read
 */
export async function markVerseAsRead(
  verseKey: string,
  chapterId: number,
  verseNumber: number,
  pageNumber: number
): Promise<void> {
  const db = await getDatabase()

  await db.runAsync(
    `INSERT INTO quran_user_progress (verse_key, chapter_id, verse_number, page_number, is_read, read_at, updated_at)
     VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON CONFLICT(verse_key) DO UPDATE SET
       is_read = 1,
       read_at = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP`,
    verseKey,
    chapterId,
    verseNumber,
    pageNumber
  )

  console.log(`✅ Marked verse ${verseKey} as read`)
}

/**
 * Toggle bookmark for a verse
 */
export async function toggleBookmark(
  verseKey: string,
  chapterId: number,
  verseNumber: number,
  pageNumber: number
): Promise<boolean> {
  const db = await getDatabase()

  // Check current bookmark status
  const current = await db.getFirstAsync<{ is_bookmarked: number }>(
    'SELECT is_bookmarked FROM quran_user_progress WHERE verse_key = ?',
    verseKey
  )

  const newBookmarkStatus = current?.is_bookmarked === 1 ? 0 : 1

  await db.runAsync(
    `INSERT INTO quran_user_progress (verse_key, chapter_id, verse_number, page_number, is_bookmarked, bookmarked_at, updated_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON CONFLICT(verse_key) DO UPDATE SET
       is_bookmarked = ?,
       bookmarked_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE bookmarked_at END,
       updated_at = CURRENT_TIMESTAMP`,
    verseKey,
    chapterId,
    verseNumber,
    pageNumber,
    newBookmarkStatus,
    newBookmarkStatus,
    newBookmarkStatus
  )

  console.log(`✅ ${newBookmarkStatus === 1 ? 'Bookmarked' : 'Removed bookmark from'} verse ${verseKey}`)
  return newBookmarkStatus === 1
}

/**
 * Get progress for a specific verse
 */
export async function getVerseProgress(verseKey: string): Promise<UserProgress | null> {
  const db = await getDatabase()

  const result = await db.getFirstAsync<any>(
    `SELECT verse_key, chapter_id, verse_number, page_number, is_read, is_bookmarked, read_at, bookmarked_at
     FROM quran_user_progress
     WHERE verse_key = ?`,
    verseKey
  )

  if (!result) return null

  return {
    verseKey: result.verse_key,
    chapterId: result.chapter_id,
    verseNumber: result.verse_number,
    pageNumber: result.page_number,
    isRead: result.is_read === 1,
    isBookmarked: result.is_bookmarked === 1,
    readAt: result.read_at,
    bookmarkedAt: result.bookmarked_at,
  }
}

/**
 * Get progress for multiple verses (bulk)
 */
export async function getVersesProgress(verseKeys: string[]): Promise<Map<string, UserProgress>> {
  const db = await getDatabase()
  const progressMap = new Map<string, UserProgress>()

  if (verseKeys.length === 0) return progressMap

  // Use IN clause for bulk fetch
  const placeholders = verseKeys.map(() => '?').join(',')
  const results = await db.getAllAsync<any>(
    `SELECT verse_key, chapter_id, verse_number, page_number, is_read, is_bookmarked, read_at, bookmarked_at
     FROM quran_user_progress
     WHERE verse_key IN (${placeholders})`,
    ...verseKeys
  )

  results.forEach((row) => {
    progressMap.set(row.verse_key, {
      verseKey: row.verse_key,
      chapterId: row.chapter_id,
      verseNumber: row.verse_number,
      pageNumber: row.page_number,
      isRead: row.is_read === 1,
      isBookmarked: row.is_bookmarked === 1,
      readAt: row.read_at,
      bookmarkedAt: row.bookmarked_at,
    })
  })

  return progressMap
}

/**
 * Get overall reading statistics
 */
export async function getReadingStats(): Promise<ReadingStats> {
  const db = await getDatabase()

  // Get total verses read
  const versesRead = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(DISTINCT verse_key) as count FROM quran_user_progress WHERE is_read = 1'
  )

  // Get total pages read (count distinct pages where at least one verse is read)
  const pagesRead = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(DISTINCT page_number) as count FROM quran_user_progress WHERE is_read = 1'
  )

  // Get total bookmarks
  const bookmarks = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM quran_user_progress WHERE is_bookmarked = 1'
  )

  // Get last read verse
  const lastRead = await db.getFirstAsync<any>(
    `SELECT verse_key, chapter_id, verse_number, read_at
     FROM quran_user_progress
     WHERE is_read = 1 AND read_at IS NOT NULL
     ORDER BY read_at DESC
     LIMIT 1`
  )

  // Get last bookmarked verse
  const lastBookmarked = await db.getFirstAsync<any>(
    `SELECT verse_key, chapter_id, verse_number, bookmarked_at
     FROM quran_user_progress
     WHERE is_bookmarked = 1 AND bookmarked_at IS NOT NULL
     ORDER BY bookmarked_at DESC
     LIMIT 1`
  )

  return {
    totalVersesRead: versesRead?.count || 0,
    totalPagesRead: pagesRead?.count || 0,
    totalBookmarks: bookmarks?.count || 0,
    lastReadVerse: lastRead
      ? {
          verseKey: lastRead.verse_key,
          chapterId: lastRead.chapter_id,
          verseNumber: lastRead.verse_number,
          readAt: lastRead.read_at,
        }
      : undefined,
    lastBookmarkedVerse: lastBookmarked
      ? {
          verseKey: lastBookmarked.verse_key,
          chapterId: lastBookmarked.chapter_id,
          verseNumber: lastBookmarked.verse_number,
          bookmarkedAt: lastBookmarked.bookmarked_at,
        }
      : undefined,
  }
}

/**
 * Get bookmarked verses
 */
export async function getBookmarkedVerses(): Promise<UserProgress[]> {
  const db = await getDatabase()

  const results = await db.getAllAsync<any>(
    `SELECT verse_key, chapter_id, verse_number, page_number, is_read, is_bookmarked, read_at, bookmarked_at
     FROM quran_user_progress
     WHERE is_bookmarked = 1
     ORDER BY bookmarked_at DESC`
  )

  return results.map((row) => ({
    verseKey: row.verse_key,
    chapterId: row.chapter_id,
    verseNumber: row.verse_number,
    pageNumber: row.page_number,
    isRead: row.is_read === 1,
    isBookmarked: row.is_bookmarked === 1,
    readAt: row.read_at,
    bookmarkedAt: row.bookmarked_at,
  }))
}

/**
 * Get chapter reading progress
 */
export async function getChapterProgress(chapterId: number): Promise<{
  totalVerses: number
  versesRead: number
  percentageComplete: number
}> {
  const db = await getDatabase()

  // Get total verses in chapter from quran_verses table
  const total = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM quran_verses WHERE chapter_id = ?',
    chapterId
  )

  // Get verses read in this chapter
  const read = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM quran_user_progress WHERE chapter_id = ? AND is_read = 1',
    chapterId
  )

  const totalVerses = total?.count || 0
  const versesRead = read?.count || 0
  const percentageComplete = totalVerses > 0 ? Math.round((versesRead / totalVerses) * 100) : 0

  return {
    totalVerses,
    versesRead,
    percentageComplete,
  }
}

/**
 * Clear all user progress (for testing/reset)
 */
export async function clearUserProgress(): Promise<void> {
  const db = await getDatabase()
  await db.runAsync('DELETE FROM quran_user_progress')
  console.log('✅ User progress cleared')
}
