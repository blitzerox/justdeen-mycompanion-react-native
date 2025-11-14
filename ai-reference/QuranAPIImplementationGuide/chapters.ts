// lib/quran-api/chapters.ts
// Fetch and cache Quran chapters (surahs) metadata

import { makeQuranAPIRequest } from './auth';

export interface Chapter {
  id: number;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  translated_name: string;
  verses_count: number;
  revelation_place: 'makkah' | 'madinah';
  revelation_order: number;
  bismillah_pre: boolean;
  pages: [number, number];
}

interface ChaptersResponse {
  chapters: Array<{
    id: number;
    name_simple: string;
    name_complex: string;
    name_arabic: string;
    translated_name: {
      name: string;
      language_name: string;
    };
    verses_count: number;
    revelation_place: string;
    revelation_order: number;
    bismillah_pre: boolean;
    pages: [number, number];
  }>;
}

/**
 * Fetch and cache all 114 Quran chapters metadata
 * This only needs to run once - data never changes
 */
export async function fetchAndCacheChapters(db: D1Database): Promise<void> {
  // Check if already cached
  const status = await db
    .prepare('SELECT is_populated FROM quran_cache_status WHERE cache_type = ?')
    .bind('chapters')
    .first<{ is_populated: number }>();

  if (status?.is_populated === 1) {
    console.log('✅ Chapters already cached');
    return;
  }

  console.log('🔄 Fetching all Quran chapters...');

  const data = await makeQuranAPIRequest<ChaptersResponse>(db, '/chapters?language=en');

  console.log(`📖 Caching ${data.chapters.length} chapters...`);

  // Batch insert all chapters
  const stmt = db.prepare(`
    INSERT INTO quran_chapters (
      id, name_simple, name_complex, name_arabic, translated_name,
      verses_count, revelation_place, revelation_order,
      bismillah_pre, pages
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const chapter of data.chapters) {
    await stmt
      .bind(
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
      .run();
  }

  // Update cache status
  await db
    .prepare(
      'UPDATE quran_cache_status SET is_populated = 1, last_updated = datetime("now"), total_records = ? WHERE cache_type = ?'
    )
    .bind(data.chapters.length, 'chapters')
    .run();

  console.log(`✅ Cached ${data.chapters.length} chapters successfully`);
}

/**
 * Get all chapters from cache
 */
export async function getAllChapters(db: D1Database): Promise<Chapter[]> {
  // Ensure chapters are cached
  await fetchAndCacheChapters(db);

  const result = await db.prepare('SELECT * FROM quran_chapters ORDER BY id').all();

  return result.results.map((row: any) => ({
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
  }));
}

/**
 * Get a single chapter by ID (1-114)
 */
export async function getChapterById(db: D1Database, id: number): Promise<Chapter | null> {
  // Ensure chapters are cached
  await fetchAndCacheChapters(db);

  const row = await db.prepare('SELECT * FROM quran_chapters WHERE id = ?').bind(id).first();

  if (!row) return null;

  return {
    id: row.id as number,
    name_simple: row.name_simple as string,
    name_complex: row.name_complex as string,
    name_arabic: row.name_arabic as string,
    translated_name: row.translated_name as string,
    verses_count: row.verses_count as number,
    revelation_place: row.revelation_place as 'makkah' | 'madinah',
    revelation_order: row.revelation_order as number,
    bismillah_pre: (row.bismillah_pre as number) === 1,
    pages: JSON.parse(row.pages as string),
  };
}

/**
 * Fetch and cache chapter info (description/context)
 */
export async function fetchAndCacheChapterInfo(db: D1Database, chapterId: number): Promise<void> {
  // Check if already cached
  const existing = await db
    .prepare('SELECT id FROM quran_chapter_info WHERE chapter_id = ?')
    .bind(chapterId)
    .first();

  if (existing) {
    console.log(`✅ Chapter ${chapterId} info already cached`);
    return;
  }

  console.log(`🔄 Fetching info for chapter ${chapterId}...`);

  const data = await makeQuranAPIRequest<any>(db, `/chapters/${chapterId}/info`);

  await db
    .prepare(
      'INSERT INTO quran_chapter_info (chapter_id, short_text, text, source, language_name) VALUES (?, ?, ?, ?, ?)'
    )
    .bind(chapterId, data.short_text, data.text, data.source, data.language_name)
    .run();

  console.log(`✅ Cached info for chapter ${chapterId}`);
}

/**
 * Get chapter info from cache
 */
export async function getChapterInfo(
  db: D1Database,
  chapterId: number
): Promise<{
  chapter_id: number;
  short_text: string;
  text: string;
  source: string;
  language_name: string;
} | null> {
  // Try to get from cache
  const cached = await db
    .prepare('SELECT * FROM quran_chapter_info WHERE chapter_id = ?')
    .bind(chapterId)
    .first();

  if (!cached) {
    // Fetch and cache if not available
    await fetchAndCacheChapterInfo(db, chapterId);
    return getChapterInfo(db, chapterId);
  }

  return cached as any;
}
