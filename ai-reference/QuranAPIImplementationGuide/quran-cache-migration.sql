-- Migration: Create Quran Cache Tables
-- Database: justdeen-mosques (or create separate justdeen-quran database)
-- Run this on: Cloudflare D1

-- ===========================================================================
-- 1. OAuth2 Access Token Storage
-- ===========================================================================
-- Stores Quran API access tokens (1-hour validity)
CREATE TABLE IF NOT EXISTS quran_access_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    access_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quran_token_expires ON quran_access_tokens(expires_at);

-- ===========================================================================
-- 2. Quran Chapters (Surahs) Metadata
-- ===========================================================================
-- Stores information about all 114 chapters
-- This data NEVER changes
CREATE TABLE IF NOT EXISTS quran_chapters (
    id INTEGER PRIMARY KEY,                    -- Chapter number (1-114)
    name_simple TEXT NOT NULL,                 -- Al-Fatihah
    name_complex TEXT NOT NULL,                -- Al-Fātiĥah
    name_arabic TEXT NOT NULL,                 -- الفاتحة
    translated_name TEXT NOT NULL,             -- The Opener
    verses_count INTEGER NOT NULL,             -- Number of verses in chapter
    revelation_place TEXT NOT NULL,            -- makkah or madinah
    revelation_order INTEGER NOT NULL,         -- Order of revelation (1-114)
    bismillah_pre INTEGER DEFAULT 0,           -- Has Bismillah (0 or 1)
    pages TEXT NOT NULL,                       -- JSON: [start_page, end_page]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================================================
-- 3. Quran Verses with Translations
-- ===========================================================================
-- Stores all 6,236 verses with translations and word-by-word data
-- This data NEVER changes
CREATE TABLE IF NOT EXISTS quran_verses (
    id INTEGER PRIMARY KEY,                    -- Unique verse ID from API
    verse_key TEXT UNIQUE NOT NULL,            -- "1:1", "2:255", etc.
    chapter_id INTEGER NOT NULL,               -- Chapter number (1-114)
    verse_number INTEGER NOT NULL,             -- Verse number within chapter
    page_number INTEGER NOT NULL,              -- Mushaf page number (1-604)
    juz_number INTEGER NOT NULL,               -- Juz number (1-30)
    hizb_number INTEGER NOT NULL,              -- Hizb number
    
    -- Arabic Text
    text_uthmani TEXT NOT NULL,                -- Uthmani script (classical)
    text_imlaei TEXT,                          -- Imlaei script (modern)
    
    -- Translations (JSON array)
    -- Format: [{"resource_id": 131, "text": "...", "resource_name": "Clear Quran"}]
    translations TEXT NOT NULL,
    
    -- Word-by-word data (JSON array)
    -- Format: [{id, position, text, translation, transliteration, audio_url}]
    words TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chapter_id) REFERENCES quran_chapters(id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_verse_key ON quran_verses(verse_key);
CREATE INDEX IF NOT EXISTS idx_verse_chapter ON quran_verses(chapter_id);
CREATE INDEX IF NOT EXISTS idx_verse_juz ON quran_verses(juz_number);
CREATE INDEX IF NOT EXISTS idx_verse_page ON quran_verses(page_number);
CREATE INDEX IF NOT EXISTS idx_verse_number ON quran_verses(chapter_id, verse_number);

-- Full-text search index for Arabic and translations
CREATE INDEX IF NOT EXISTS idx_verse_text_search ON quran_verses(text_uthmani);

-- ===========================================================================
-- 4. Quran Tafsir (Commentary)
-- ===========================================================================
-- Stores tafsir text for each verse
-- Separated from verses table due to large HTML content
CREATE TABLE IF NOT EXISTS quran_tafsirs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    verse_key TEXT NOT NULL,                   -- "1:1", references quran_verses
    tafsir_resource_id INTEGER NOT NULL,       -- 169 = Ibn Kathir, 93 = Maarif-ul-Quran
    tafsir_name TEXT NOT NULL,                 -- "Tafsir Ibn Kathir"
    language_name TEXT NOT NULL,               -- "english", "arabic", etc.
    text TEXT NOT NULL,                        -- Full HTML content
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(verse_key, tafsir_resource_id)      -- One tafsir per verse per resource
);

-- Indexes for tafsir lookups
CREATE INDEX IF NOT EXISTS idx_tafsir_verse ON quran_tafsirs(verse_key);
CREATE INDEX IF NOT EXISTS idx_tafsir_resource ON quran_tafsirs(tafsir_resource_id);

-- ===========================================================================
-- 5. Chapter Info (Descriptions)
-- ===========================================================================
-- Stores contextual information about each chapter
CREATE TABLE IF NOT EXISTS quran_chapter_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chapter_id INTEGER UNIQUE NOT NULL,        -- Chapter number (1-114)
    short_text TEXT NOT NULL,                  -- Brief description
    text TEXT NOT NULL,                        -- Full description
    source TEXT,                               -- Attribution
    language_name TEXT DEFAULT 'english',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chapter_id) REFERENCES quran_chapters(id)
);

CREATE INDEX IF NOT EXISTS idx_chapter_info ON quran_chapter_info(chapter_id);

-- ===========================================================================
-- 6. Cache Population Status Tracker
-- ===========================================================================
-- Tracks which parts of the Quran have been cached
CREATE TABLE IF NOT EXISTS quran_cache_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_type TEXT UNIQUE NOT NULL,           -- 'chapters', 'verses', 'tafsirs'
    is_populated INTEGER DEFAULT 0,            -- 0 = not populated, 1 = populated
    last_updated TIMESTAMP,
    total_records INTEGER DEFAULT 0
);

-- Insert initial status records
INSERT OR IGNORE INTO quran_cache_status (cache_type) VALUES 
    ('chapters'),
    ('verses'),
    ('tafsirs');

-- ===========================================================================
-- OPTIONAL: User Bookmarks & Reading Progress Tables
-- ===========================================================================
-- These are separate from the core cache and store user-specific data

-- User Quran bookmarks
CREATE TABLE IF NOT EXISTS user_quran_bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,                  -- References users table
    verse_key TEXT NOT NULL,                   -- "1:1"
    note TEXT,                                 -- User's personal note
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bookmark_user ON user_quran_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmark_verse ON user_quran_bookmarks(verse_key);

-- User reading progress
CREATE TABLE IF NOT EXISTS user_quran_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,                  -- References users table
    last_verse_key TEXT NOT NULL,              -- Last verse read
    last_chapter_id INTEGER NOT NULL,
    last_page_number INTEGER,
    last_juz_number INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_progress_user ON user_quran_progress(user_id);

-- ===========================================================================
-- Data Verification Queries
-- ===========================================================================
-- After running migration, use these to verify:

-- Check if tables exist:
-- SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'quran%';

-- Check cache status:
-- SELECT * FROM quran_cache_status;

-- Count verses after population:
-- SELECT COUNT(*) FROM quran_verses; -- Should be 6236

-- Count chapters after population:
-- SELECT COUNT(*) FROM quran_chapters; -- Should be 114

-- Get a sample verse:
-- SELECT * FROM quran_verses WHERE verse_key = '1:1';

-- Get Ayat Al-Kursi (2:255):
-- SELECT verse_key, text_uthmani, translations FROM quran_verses WHERE verse_key = '2:255';

-- ===========================================================================
-- Migration Complete
-- ===========================================================================
-- Next steps:
-- 1. Run this migration: wrangler d1 execute justdeen-mosques --file=quran-cache-migration.sql
-- 2. Implement the TypeScript modules in your app
-- 3. Run the cache population: populateAllQuranData() or populatePopularChapters()
-- 4. Test with a sample chapter to verify everything works
