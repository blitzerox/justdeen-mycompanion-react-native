/**
 * WatermelonDB Database Configuration
 * Offline-first database for Quran, Hadith, and Duas
 */

import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { schema } from './schema'
import { Surah } from './models/Surah'
import { Ayah } from './models/Ayah'
import { Translation } from './models/Translation'
import { Translator } from './models/Translator'
import { Tafsir } from './models/Tafsir'
import { HadithCollection } from './models/HadithCollection'
import { HadithBook } from './models/HadithBook'
import { Hadith } from './models/Hadith'
import { Dua } from './models/Dua'
import { ReadingHistory } from './models/ReadingHistory'
import { OfflineBookmark } from './models/OfflineBookmark'
import { AudioDownload } from './models/AudioDownload'

// SQLite adapter configuration
const adapter = new SQLiteAdapter({
  schema,
  // Optional: migrations for schema updates
  // migrations,
  jsi: true, // Use JSI (faster)
  onSetUpError: (error) => {
    console.error('WatermelonDB setup error:', error)
  },
})

// Initialize database
export const database = new Database({
  adapter,
  modelClasses: [
    Surah,
    Ayah,
    Translation,
    Translator,
    Tafsir,
    HadithCollection,
    HadithBook,
    Hadith,
    Dua,
    ReadingHistory,
    OfflineBookmark,
    AudioDownload,
  ],
})

export default database
