/**
 * Quran SQLite Database Service
 * Manages local caching of Quran data from Quran Foundation API
 */

import * as SQLite from 'expo-sqlite'

const DB_NAME = 'justdeen_quran.db'

let db: SQLite.SQLiteDatabase | null = null

/**
 * Initialize and return the database instance
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db

  db = await SQLite.openDatabaseAsync(DB_NAME)
  await initializeSchema(db)
  return db
}

/**
 * Create all tables for Quran caching
 */
async function initializeSchema(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    -- 1. OAuth2 Access Tokens
    CREATE TABLE IF NOT EXISTS quran_access_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      access_token TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Chapters Metadata
    CREATE TABLE IF NOT EXISTS quran_chapters (
      id INTEGER PRIMARY KEY,
      name_simple TEXT NOT NULL,
      name_complex TEXT NOT NULL,
      name_arabic TEXT NOT NULL,
      translated_name TEXT NOT NULL,
      verses_count INTEGER NOT NULL,
      revelation_place TEXT NOT NULL,
      revelation_order INTEGER NOT NULL,
      bismillah_pre INTEGER DEFAULT 0,
      pages TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Verses with Translations
    CREATE TABLE IF NOT EXISTS quran_verses (
      id INTEGER PRIMARY KEY,
      verse_key TEXT UNIQUE NOT NULL,
      chapter_id INTEGER NOT NULL,
      verse_number INTEGER NOT NULL,
      page_number INTEGER NOT NULL,
      juz_number INTEGER NOT NULL,
      hizb_number INTEGER NOT NULL,
      text_uthmani TEXT NOT NULL,
      text_imlaei TEXT,
      translations TEXT NOT NULL,
      words TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chapter_id) REFERENCES quran_chapters(id)
    );

    CREATE INDEX IF NOT EXISTS idx_verse_key ON quran_verses(verse_key);
    CREATE INDEX IF NOT EXISTS idx_chapter_id ON quran_verses(chapter_id);
    CREATE INDEX IF NOT EXISTS idx_juz_number ON quran_verses(juz_number);
    CREATE INDEX IF NOT EXISTS idx_page_number ON quran_verses(page_number);

    -- 4. Tafsirs (Commentary)
    CREATE TABLE IF NOT EXISTS quran_tafsirs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      verse_key TEXT NOT NULL,
      tafsir_resource_id INTEGER NOT NULL,
      tafsir_name TEXT NOT NULL,
      language_name TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(verse_key, tafsir_resource_id)
    );

    CREATE INDEX IF NOT EXISTS idx_tafsir_verse ON quran_tafsirs(verse_key);

    -- 5. Chapter Info/Descriptions
    CREATE TABLE IF NOT EXISTS quran_chapter_info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_id INTEGER UNIQUE NOT NULL,
      short_text TEXT NOT NULL,
      text TEXT NOT NULL,
      source TEXT,
      language_name TEXT DEFAULT 'english',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chapter_id) REFERENCES quran_chapters(id)
    );

    -- 6. Cache Population Status
    CREATE TABLE IF NOT EXISTS quran_cache_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cache_type TEXT UNIQUE NOT NULL,
      is_populated INTEGER DEFAULT 0,
      last_updated TEXT,
      total_records INTEGER DEFAULT 0
    );

    -- Insert cache status types if they don't exist
    INSERT OR IGNORE INTO quran_cache_status (cache_type) VALUES
      ('chapters'),
      ('verses'),
      ('tafsirs');
  `)

  console.log('✅ Quran database schema initialized')
}

/**
 * Clear all Quran data (for testing/reset)
 */
export async function clearQuranCache(): Promise<void> {
  const database = await getDatabase()

  await database.execAsync(`
    DELETE FROM quran_verses;
    DELETE FROM quran_chapters;
    DELETE FROM quran_tafsirs;
    DELETE FROM quran_chapter_info;
    DELETE FROM quran_access_tokens;
    UPDATE quran_cache_status SET is_populated = 0, total_records = 0, last_updated = NULL;
  `)

  console.log('✅ Quran cache cleared')
}

/**
 * Get cache status
 */
export async function getCacheStatus(): Promise<{
  chapters: { populated: boolean; total: number }
  verses: { populated: boolean; total: number }
  tafsirs: { populated: boolean; total: number }
}> {
  const database = await getDatabase()

  const chapters = await database.getFirstAsync<{
    is_populated: number
    total_records: number
  }>('SELECT is_populated, total_records FROM quran_cache_status WHERE cache_type = ?', 'chapters')

  const verses = await database.getFirstAsync<{
    is_populated: number
    total_records: number
  }>('SELECT is_populated, total_records FROM quran_cache_status WHERE cache_type = ?', 'verses')

  const tafsirs = await database.getFirstAsync<{
    is_populated: number
    total_records: number
  }>('SELECT is_populated, total_records FROM quran_cache_status WHERE cache_type = ?', 'tafsirs')

  return {
    chapters: {
      populated: chapters?.is_populated === 1,
      total: chapters?.total_records || 0,
    },
    verses: {
      populated: verses?.is_populated === 1,
      total: verses?.total_records || 0,
    },
    tafsirs: {
      populated: tafsirs?.is_populated === 1,
      total: tafsirs?.total_records || 0,
    },
  }
}
