/**
 * Quran Foundation API - Recitations Service
 * Handles fetching available reciters for audio playback
 */

import { getDatabase } from './database'
import { makeQuranAPIRequest } from './auth'

export interface Recitation {
  id: number
  reciter_name: string
  style: string | null
  translated_name: {
    name: string
    language_name: string
  }
}

interface RecitationsResponse {
  recitations: Recitation[]
}

/**
 * Hardcoded list of popular reciters (fallback)
 * These are the most commonly used reciters with verified audio availability
 */
const POPULAR_RECITATIONS: Recitation[] = [
  {
    id: 7,
    reciter_name: 'Mishary Rashid Alafasy',
    style: 'Murattal',
    translated_name: { name: 'Mishary Rashid Alafasy', language_name: 'english' }
  },
  {
    id: 1,
    reciter_name: 'AbdulBaset AbdulSamad',
    style: 'Murattal',
    translated_name: { name: 'AbdulBaset AbdulSamad', language_name: 'english' }
  },
  {
    id: 2,
    reciter_name: 'Mahmoud Khalil Al-Husary',
    style: 'Murattal',
    translated_name: { name: 'Mahmoud Khalil Al-Husary', language_name: 'english' }
  },
  {
    id: 9,
    reciter_name: 'Abdullah Basfar',
    style: 'Murattal',
    translated_name: { name: 'Abdullah Basfar', language_name: 'english' }
  },
  {
    id: 5,
    reciter_name: 'Saad Al-Ghamdi',
    style: 'Murattal',
    translated_name: { name: 'Saad Al-Ghamdi', language_name: 'english' }
  },
  {
    id: 3,
    reciter_name: 'Mohamed Siddiq al-Minshawi',
    style: 'Mujawwad',
    translated_name: { name: 'Mohamed Siddiq al-Minshawi', language_name: 'english' }
  },
  {
    id: 6,
    reciter_name: 'Abu Bakr al-Shatri',
    style: 'Murattal',
    translated_name: { name: 'Abu Bakr al-Shatri', language_name: 'english' }
  },
  {
    id: 10,
    reciter_name: 'Ahmed ibn Ali al-Ajamy',
    style: 'Murattal',
    translated_name: { name: 'Ahmed ibn Ali al-Ajamy', language_name: 'english' }
  },
  {
    id: 8,
    reciter_name: 'Abdurrahman as-Sudais',
    style: 'Murattal',
    translated_name: { name: 'Abdurrahman as-Sudais', language_name: 'english' }
  },
  {
    id: 4,
    reciter_name: 'Hani ar-Rifai',
    style: 'Murattal',
    translated_name: { name: 'Hani ar-Rifai', language_name: 'english' }
  },
]

/**
 * Fetch list of available recitations from API
 */
async function fetchRecitations(language: string = 'en'): Promise<Recitation[]> {
  try {
    const data = await makeQuranAPIRequest<RecitationsResponse>(
      `/resources/recitations?language=${language}`
    )
    return data.recitations
  } catch (error) {
    console.warn('⚠️ Failed to fetch recitations from API, using fallback list:', error)
    return POPULAR_RECITATIONS
  }
}

/**
 * Get list of available recitations from cache or API
 */
export async function getRecitations(language: string = 'en'): Promise<Recitation[]> {
  const db = await getDatabase()

  // Check if recitations are cached
  const cached = await db.getAllAsync<any>(
    'SELECT id, reciter_name, style, translated_name FROM quran_recitations WHERE language = ?',
    language
  )

  if (cached.length > 0) {
    console.log('✅ Using cached recitations')
    return cached.map(row => ({
      id: row.id,
      reciter_name: row.reciter_name,
      style: row.style,
      translated_name: typeof row.translated_name === 'string'
        ? JSON.parse(row.translated_name)
        : row.translated_name
    }))
  }

  // Fetch from API (with fallback to hardcoded list)
  console.log('📡 Fetching recitations from API...')
  const recitations = await fetchRecitations(language)

  // Cache recitations
  try {
    for (const recitation of recitations) {
      await db.runAsync(
        `INSERT OR REPLACE INTO quran_recitations (id, reciter_name, style, translated_name, language)
         VALUES (?, ?, ?, ?, ?)`,
        recitation.id,
        recitation.reciter_name,
        recitation.style,
        JSON.stringify(recitation.translated_name),
        language
      )
    }
    console.log(`✅ Cached ${recitations.length} recitations`)
  } catch (error) {
    console.warn('⚠️ Failed to cache recitations:', error)
  }

  return recitations
}

/**
 * Get audio URL for a specific verse with selected reciter
 * @param verseKey - Format: "1:1" (surah:verse)
 * @param reciterId - ID of the reciter (default: 7 = AbdulBaset AbdulSamad)
 */
export function getVerseAudioUrl(verseKey: string, reciterId: number = 7): string {
  // The Quran.com CDN uses this pattern for verse audio
  // Default reciter ID 7 is AbdulBaset AbdulSamad (Mujawwad)
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${verseKey.replace(':', '_')}.mp3`
}

/**
 * Popular reciters with their IDs
 */
export const POPULAR_RECITERS = {
  ALAFASY: 7, // Mishary Rashid Alafasy
  ABDULBASIT: 1, // AbdulBaset AbdulSamad (Mujawwad)
  HUSARY: 2, // Mahmoud Khalil Al-Husary
  SUDAIS: 9, // Abdurrahman as-Sudais
  MINSHAWI: 3, // Mohamed Siddiq al-Minshawi (Mujawwad)
}