/**
 * Quran Audio Caching Service
 * Downloads and caches audio files locally for offline playback
 */

import * as FileSystem from 'expo-file-system'
import { getDatabase } from './database'

const AUDIO_CACHE_DIR = `${FileSystem.documentDirectory}quran_audio/`

/**
 * Ensure audio cache directory exists
 */
async function ensureAudioCacheDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(AUDIO_CACHE_DIR)
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(AUDIO_CACHE_DIR, { intermediates: true })
    console.log('✅ Created audio cache directory')
  }
}

/**
 * Get reciter slug for CDN URL
 */
function getReciterSlug(reciterId: number): string {
  const reciterMap: Record<number, string> = {
    1: 'Abdul_Basit_Murattal_192kbps',
    2: 'Husary_128kbps',
    3: 'Minshawy_Murattal_128kbps',
    4: 'Hani_Rifai_192kbps',
    5: 'Ghamadi_40kbps',
    6: 'abu_bakr_ash-shaatree_128kbps',
    7: 'Alafasy_128kbps',
    8: 'Abdurrahmaan_As-Sudais_192kbps',
    9: 'Abdullah_Basfar_192kbps',
    10: 'Ahmed_ibn_Ali_al-Ajamy_128kbps',
  }
  return reciterMap[reciterId] || 'Alafasy_128kbps'
}

/**
 * Get remote audio URL for a verse
 */
export function getVerseAudioUrl(verseKey: string, reciterId: number): string {
  const reciterSlug = getReciterSlug(reciterId)
  const [chapter, verse] = verseKey.split(':')
  const paddedChapter = chapter.padStart(3, '0')
  const paddedVerse = verse.padStart(3, '0')
  return `https://everyayah.com/data/${reciterSlug}/${paddedChapter}${paddedVerse}.mp3`
}

/**
 * Get local file path for cached audio
 */
function getLocalAudioPath(verseKey: string, reciterId: number): string {
  const sanitizedKey = verseKey.replace(':', '_')
  return `${AUDIO_CACHE_DIR}${reciterId}_${sanitizedKey}.mp3`
}

/**
 * Check if audio is cached locally
 */
export async function isAudioCached(verseKey: string, reciterId: number): Promise<string | null> {
  try {
    const db = await getDatabase()
    const cached = await db.getFirstAsync<{ audio_file_path: string }>(
      'SELECT audio_file_path FROM quran_audio_cache WHERE verse_key = ? AND reciter_id = ?',
      verseKey,
      reciterId
    )

    if (cached) {
      const fileInfo = await FileSystem.getInfoAsync(cached.audio_file_path)
      if (fileInfo.exists) {
        return cached.audio_file_path
      } else {
        // File was deleted, remove from database
        await db.runAsync(
          'DELETE FROM quran_audio_cache WHERE verse_key = ? AND reciter_id = ?',
          verseKey,
          reciterId
        )
      }
    }

    return null
  } catch (error) {
    console.warn('⚠️ Error checking audio cache:', error)
    return null
  }
}

/**
 * Download and cache audio file
 */
export async function cacheAudioFile(verseKey: string, reciterId: number): Promise<string | null> {
  try {
    await ensureAudioCacheDir()

    const remoteUrl = getVerseAudioUrl(verseKey, reciterId)
    const localPath = getLocalAudioPath(verseKey, reciterId)

    // Download file
    const downloadResult = await FileSystem.downloadAsync(remoteUrl, localPath)

    if (downloadResult.status === 200) {
      // Save to database
      const db = await getDatabase()
      await db.runAsync(
        `INSERT OR REPLACE INTO quran_audio_cache (verse_key, reciter_id, audio_file_path)
         VALUES (?, ?, ?)`,
        verseKey,
        reciterId,
        localPath
      )

      console.log(`✅ Cached audio for ${verseKey} (reciter ${reciterId})`)
      return localPath
    } else {
      console.warn(`⚠️ Failed to download audio for ${verseKey}: HTTP ${downloadResult.status}`)
      return null
    }
  } catch (error) {
    console.warn(`⚠️ Error caching audio for ${verseKey}:`, error)
    return null
  }
}

/**
 * Get audio URI (cached or remote)
 */
export async function getAudioUri(verseKey: string, reciterId: number): Promise<string> {
  // Check cache first
  const cachedPath = await isAudioCached(verseKey, reciterId)
  if (cachedPath) {
    console.log(`🎵 Using cached audio for ${verseKey}`)
    return cachedPath
  }

  // Return remote URL if not cached
  console.log(`🌐 Using remote audio for ${verseKey}`)
  return getVerseAudioUrl(verseKey, reciterId)
}

/**
 * Preload audio for multiple verses in background
 */
export async function preloadAudioForVerses(
  verseKeys: string[],
  reciterId: number
): Promise<void> {
  console.log(`📥 Starting background audio cache for ${verseKeys.length} verses...`)

  // Download files one at a time to avoid overwhelming the network
  for (const verseKey of verseKeys) {
    const cached = await isAudioCached(verseKey, reciterId)
    if (!cached) {
      await cacheAudioFile(verseKey, reciterId)
      // Small delay between downloads to be respectful
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  console.log(`✅ Background audio caching complete`)
}

/**
 * Clear all cached audio files
 */
export async function clearAudioCache(): Promise<void> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(AUDIO_CACHE_DIR)
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(AUDIO_CACHE_DIR, { idempotent: true })
      console.log('✅ Cleared audio cache directory')
    }

    const db = await getDatabase()
    await db.runAsync('DELETE FROM quran_audio_cache')
    console.log('✅ Cleared audio cache database')
  } catch (error) {
    console.warn('⚠️ Error clearing audio cache:', error)
  }
}

/**
 * Get cache statistics
 */
export async function getAudioCacheStats(): Promise<{
  totalFiles: number
  totalSizeMB: number
}> {
  try {
    const db = await getDatabase()
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM quran_audio_cache'
    )

    const dirInfo = await FileSystem.getInfoAsync(AUDIO_CACHE_DIR)
    let totalSize = 0

    if (dirInfo.exists && dirInfo.isDirectory) {
      const files = await FileSystem.readDirectoryAsync(AUDIO_CACHE_DIR)
      for (const file of files) {
        const fileInfo = await FileSystem.getInfoAsync(`${AUDIO_CACHE_DIR}${file}`)
        if (fileInfo.exists && !fileInfo.isDirectory) {
          totalSize += fileInfo.size || 0
        }
      }
    }

    return {
      totalFiles: result?.count || 0,
      totalSizeMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100,
    }
  } catch (error) {
    console.warn('⚠️ Error getting audio cache stats:', error)
    return { totalFiles: 0, totalSizeMB: 0 }
  }
}
