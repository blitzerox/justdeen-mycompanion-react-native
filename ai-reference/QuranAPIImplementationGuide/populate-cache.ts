// lib/quran-api/populate-cache.ts
// Comprehensive script to populate all Quran data in cache

import { fetchAndCacheChapters } from './chapters';
import { fetchAndCacheChapterVerses } from './verses';
import { fetchAndCacheChapterTafsir, TAFSIR_RESOURCES } from './tafsir';

/**
 * Populate all Quran data in cache
 * This is a one-time operation (can be run as background job)
 */
export async function populateAllQuranData(
  db: D1Database,
  options: {
    includeTafsir?: boolean; // Default true
    concurrentChapters?: number; // Number of chapters to process in parallel, default 5
    onProgress?: (completed: number, total: number, message: string) => void;
  } = {}
): Promise<void> {
  const { includeTafsir = true, concurrentChapters = 5, onProgress } = options;

  console.log('🚀 Starting Quran data cache population...');
  console.log('⏱️  This may take 10-20 minutes depending on network speed');

  const startTime = Date.now();

  // Step 1: Cache all chapters metadata (fast, ~5 seconds)
  console.log('\n📖 Step 1/3: Caching chapters metadata...');
  await fetchAndCacheChapters(db);
  onProgress?.(1, 3, 'Chapters metadata cached');

  // Step 2: Cache all verses (slower, ~5-10 minutes)
  console.log('\n📚 Step 2/3: Caching all verses with translations...');
  console.log(`   Processing ${concurrentChapters} chapters at a time...`);

  for (let startChapter = 1; startChapter <= 114; startChapter += concurrentChapters) {
    const endChapter = Math.min(startChapter + concurrentChapters - 1, 114);
    const batch = [];

    for (let chapter = startChapter; chapter <= endChapter; chapter++) {
      batch.push(fetchAndCacheChapterVerses(db, chapter));
    }

    await Promise.all(batch);

    const progress = Math.round((endChapter / 114) * 100);
    console.log(`   ✅ Cached chapters ${startChapter}-${endChapter} (${progress}% complete)`);
    onProgress?.(1.5 + progress / 100, 3, `Verses: ${endChapter}/114 chapters`);
  }

  // Step 3: Cache tafsir (optional, slower, ~5-10 minutes)
  if (includeTafsir) {
    console.log('\n📝 Step 3/3: Caching tafsir (Ibn Kathir)...');
    console.log(`   Processing ${concurrentChapters} chapters at a time...`);

    for (let startChapter = 1; startChapter <= 114; startChapter += concurrentChapters) {
      const endChapter = Math.min(startChapter + concurrentChapters - 1, 114);
      const batch = [];

      for (let chapter = startChapter; chapter <= endChapter; chapter++) {
        batch.push(fetchAndCacheChapterTafsir(db, chapter, TAFSIR_RESOURCES.IBN_KATHIR_EN));
      }

      await Promise.all(batch);

      const progress = Math.round((endChapter / 114) * 100);
      console.log(`   ✅ Cached tafsir ${startChapter}-${endChapter} (${progress}% complete)`);
      onProgress?.(2 + progress / 100, 3, `Tafsir: ${endChapter}/114 chapters`);
    }
  } else {
    console.log('\n⏭️  Step 3/3: Skipping tafsir (not requested)');
  }

  // Update final cache status
  await db
    .prepare(
      'UPDATE quran_cache_status SET is_populated = 1, last_updated = datetime("now") WHERE cache_type IN (?, ?)'
    )
    .bind('verses', 'tafsirs')
    .run();

  const duration = Math.round((Date.now() - startTime) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  console.log('\n✅ Cache population complete!');
  console.log(`⏱️  Total time: ${minutes}m ${seconds}s`);
  console.log('🎉 All Quran data is now cached and ready for instant access!');

  onProgress?.(3, 3, 'Complete! All data cached');
}

/**
 * Populate only the most popular/frequently read chapters
 * Much faster (~2-3 minutes) for quick setup
 */
export async function populatePopularChapters(db: D1Database): Promise<void> {
  console.log('🚀 Caching popular Quran chapters...');

  // Cache metadata first
  await fetchAndCacheChapters(db);

  // Most read chapters (from Islamic tradition and analytics)
  const popularChapters = [
    1, // Al-Fatihah (The Opener) - recited in every prayer
    2, // Al-Baqarah (The Cow) - longest surah
    18, // Al-Kahf (The Cave) - Friday recommendation
    36, // Ya-Sin (Ya-Sin) - "Heart of the Quran"
    55, // Ar-Rahman (The Most Merciful) - highly recited
    56, // Al-Waqi'ah (The Event)
    67, // Al-Mulk (The Sovereignty)
    78, // An-Naba (The Tidings)
    112, // Al-Ikhlas (The Sincerity) - equals 1/3 of Quran
    113, // Al-Falaq (The Daybreak) - protection
    114, // An-Nas (Mankind) - protection
  ];

  console.log(`📖 Caching ${popularChapters.length} popular chapters...`);

  for (const chapter of popularChapters) {
    await fetchAndCacheChapterVerses(db, chapter);
    await fetchAndCacheChapterTafsir(db, chapter);
    console.log(`   ✅ Cached chapter ${chapter}`);
  }

  console.log('✅ Popular chapters cached! Users can now read instantly.');
  console.log('💡 Run populateAllQuranData() to cache remaining chapters in background.');
}

/**
 * Cache specific Juz (for Ramadan, daily reading plans)
 */
export async function cacheJuz(db: D1Database, juzNumber: number): Promise<void> {
  console.log(`🔄 Caching Juz ${juzNumber}...`);

  // Juz spans multiple chapters, we need to find which chapters
  // This is a simplified version - you might want to fetch from API
  const juzToChapters: { [key: number]: number[] } = {
    1: [1, 2], // Juz 1 contains Al-Fatihah and part of Al-Baqarah
    2: [2],
    30: [78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114], // Juz Amma
    // Add more mappings as needed
  };

  const chapters = juzToChapters[juzNumber] || [];

  for (const chapter of chapters) {
    await fetchAndCacheChapterVerses(db, chapter);
    console.log(`   ✅ Cached chapter ${chapter}`);
  }

  console.log(`✅ Juz ${juzNumber} cached!`);
}

/**
 * Check cache population status
 */
export async function getCacheStatus(db: D1Database): Promise<{
  chapters: { populated: boolean; total: number };
  verses: { populated: boolean; total: number };
  tafsirs: { populated: boolean; total: number };
}> {
  const chapters = await db
    .prepare('SELECT is_populated, total_records FROM quran_cache_status WHERE cache_type = ?')
    .bind('chapters')
    .first<{ is_populated: number; total_records: number }>();

  const verses = await db
    .prepare('SELECT COUNT(*) as count FROM quran_verses')
    .first<{ count: number }>();

  const tafsirs = await db
    .prepare('SELECT COUNT(*) as count FROM quran_tafsirs')
    .first<{ count: number }>();

  return {
    chapters: {
      populated: (chapters?.is_populated ?? 0) === 1,
      total: chapters?.total_records ?? 0,
    },
    verses: {
      populated: (verses?.count ?? 0) > 6000, // Quran has 6236 verses
      total: verses?.count ?? 0,
    },
    tafsirs: {
      populated: (tafsirs?.count ?? 0) > 6000,
      total: tafsirs?.count ?? 0,
    },
  };
}

/**
 * Clear all cached Quran data (for re-population or testing)
 */
export async function clearQuranCache(db: D1Database): Promise<void> {
  console.log('🗑️  Clearing Quran cache...');

  await db.prepare('DELETE FROM quran_verses').run();
  await db.prepare('DELETE FROM quran_tafsirs').run();
  await db.prepare('DELETE FROM quran_chapters').run();
  await db.prepare('DELETE FROM quran_chapter_info').run();
  await db.prepare('DELETE FROM quran_access_tokens').run();

  await db
    .prepare('UPDATE quran_cache_status SET is_populated = 0, total_records = 0')
    .run();

  console.log('✅ Cache cleared!');
}
