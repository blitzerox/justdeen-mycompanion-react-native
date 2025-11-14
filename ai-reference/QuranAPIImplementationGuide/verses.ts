// lib/quran-api/verses.ts
// Fetch and cache Quran verses with translations and word-by-word data

import { makeQuranAPIRequest } from './auth';

export interface Translation {
  resource_id: number;
  text: string;
  resource_name?: string;
}

export interface Word {
  id: number;
  position: number;
  text_uthmani?: string;
  text_imlaei?: string;
  audio_url?: string;
  char_type_name: string;
  translation?: {
    text: string;
    language_name: string;
  };
  transliteration?: {
    text: string;
    language_name: string;
  };
}

export interface Verse {
  id: number;
  verse_key: string;
  chapter_id: number;
  verse_number: number;
  page_number: number;
  juz_number: number;
  hizb_number: number;
  text_uthmani: string;
  text_imlaei?: string;
  translations: Translation[];
  words?: Word[];
}

interface VersesResponse {
  verses: Array<{
    id: number;
    verse_key: string;
    verse_number: number;
    page_number: number;
    juz_number: number;
    hizb_number: number;
    rub_el_hizb_number: number;
    text_uthmani: string;
    text_imlaei?: string;
    words?: any[];
    translations?: any[];
  }>;
  pagination?: {
    per_page: number;
    current_page: number;
    next_page: number | null;
    total_pages: number;
    total_records: number;
  };
}

/**
 * Fetch and cache all verses for a specific chapter
 * Includes translations and word-by-word data
 */
export async function fetchAndCacheChapterVerses(
  db: D1Database,
  chapterNumber: number,
  options: {
    translations?: number[]; // Array of translation IDs, default [131] (Clear Quran)
    includeWords?: boolean; // Include word-by-word data, default true
  } = {}
): Promise<void> {
  const { translations = [131], includeWords = true } = options;

  // Check if already cached
  const existing = await db
    .prepare('SELECT COUNT(*) as count FROM quran_verses WHERE chapter_id = ?')
    .bind(chapterNumber)
    .first<{ count: number }>();

  if (existing && existing.count > 0) {
    console.log(`✅ Chapter ${chapterNumber} verses already cached`);
    return;
  }

  console.log(`🔄 Fetching verses for chapter ${chapterNumber}...`);

  // Build query parameters
  const params = new URLSearchParams({
    language: 'en',
    translations: translations.join(','),
    per_page: '300', // Max verses per chapter is 286
  });

  if (includeWords) {
    params.append('words', 'true');
  }

  const data = await makeQuranAPIRequest<VersesResponse>(
    db,
    `/verses/by_chapter/${chapterNumber}?${params.toString()}`
  );

  console.log(`📖 Caching ${data.verses.length} verses for chapter ${chapterNumber}...`);

  // Insert all verses
  const stmt = db.prepare(`
    INSERT INTO quran_verses (
      id, verse_key, chapter_id, verse_number, page_number,
      juz_number, hizb_number, text_uthmani, text_imlaei,
      translations, words
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const verse of data.verses) {
    await stmt
      .bind(
        verse.id,
        verse.verse_key,
        chapterNumber,
        verse.verse_number,
        verse.page_number,
        verse.juz_number,
        verse.hizb_number,
        verse.text_uthmani,
        verse.text_imlaei || null,
        JSON.stringify(verse.translations || []),
        JSON.stringify(verse.words || [])
      )
      .run();
  }

  console.log(`✅ Cached ${data.verses.length} verses for chapter ${chapterNumber}`);
}

/**
 * Get all verses for a chapter from cache
 */
export async function getChapterVerses(db: D1Database, chapterNumber: number): Promise<Verse[]> {
  // Ensure verses are cached
  await fetchAndCacheChapterVerses(db, chapterNumber);

  const result = await db
    .prepare('SELECT * FROM quran_verses WHERE chapter_id = ? ORDER BY verse_number')
    .bind(chapterNumber)
    .all();

  return result.results.map((row: any) => ({
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
  }));
}

/**
 * Get a single verse by verse key (e.g., "1:1", "2:255")
 */
export async function getVerseByKey(db: D1Database, verseKey: string): Promise<Verse | null> {
  // Parse chapter number from verse key
  const [chapterStr] = verseKey.split(':');
  const chapterNumber = parseInt(chapterStr);

  // Ensure chapter is cached
  await fetchAndCacheChapterVerses(db, chapterNumber);

  const row = await db
    .prepare('SELECT * FROM quran_verses WHERE verse_key = ?')
    .bind(verseKey)
    .first();

  if (!row) return null;

  return {
    id: row.id as number,
    verse_key: row.verse_key as string,
    chapter_id: row.chapter_id as number,
    verse_number: row.verse_number as number,
    page_number: row.page_number as number,
    juz_number: row.juz_number as number,
    hizb_number: row.hizb_number as number,
    text_uthmani: row.text_uthmani as string,
    text_imlaei: row.text_imlaei as string | undefined,
    translations: JSON.parse(row.translations as string),
    words: row.words ? JSON.parse(row.words as string) : undefined,
  };
}

/**
 * Get verses by Juz number (1-30)
 */
export async function getVersesByJuz(db: D1Database, juzNumber: number): Promise<Verse[]> {
  // For first access, we need to ensure relevant chapters are cached
  // This is a more complex query, you might want to cache juz data separately

  const result = await db
    .prepare('SELECT * FROM quran_verses WHERE juz_number = ? ORDER BY id')
    .bind(juzNumber)
    .all();

  return result.results.map((row: any) => ({
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
  }));
}

/**
 * Get verses by page number (1-604)
 */
export async function getVersesByPage(db: D1Database, pageNumber: number): Promise<Verse[]> {
  const result = await db
    .prepare('SELECT * FROM quran_verses WHERE page_number = ? ORDER BY id')
    .bind(pageNumber)
    .all();

  return result.results.map((row: any) => ({
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
  }));
}

/**
 * Search verses by Arabic text or translation
 */
export async function searchVerses(
  db: D1Database,
  query: string,
  limit: number = 50
): Promise<Verse[]> {
  const result = await db
    .prepare(
      `
    SELECT * FROM quran_verses 
    WHERE text_uthmani LIKE ? OR translations LIKE ?
    ORDER BY id
    LIMIT ?
  `
    )
    .bind(`%${query}%`, `%${query}%`, limit)
    .all();

  return result.results.map((row: any) => ({
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
  }));
}
