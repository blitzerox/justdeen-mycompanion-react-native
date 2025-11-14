// lib/quran-api/index.ts
// Centralized exports for Quran API modules

// Authentication
export {
  getQuranAccessToken,
  makeQuranAPIRequest,
  QURAN_API_CONFIG,
} from './auth';

// Chapters
export {
  fetchAndCacheChapters,
  getAllChapters,
  getChapterById,
  fetchAndCacheChapterInfo,
  getChapterInfo,
} from './chapters';

export type { Chapter } from './chapters';

// Verses
export {
  fetchAndCacheChapterVerses,
  getChapterVerses,
  getVerseByKey,
  getVersesByJuz,
  getVersesByPage,
  searchVerses,
} from './verses';

export type { Verse, Translation, Word } from './verses';

// Tafsir
export {
  fetchAndCacheChapterTafsir,
  getChapterTafsir,
  getVerseTafsir,
  getChapterWithTafsir,
  getAvailableTafsirs,
  cacheAllTafsirsForChapter,
  TAFSIR_RESOURCES,
} from './tafsir';

export type { Tafsir } from './tafsir';

// Cache Population
export {
  populateAllQuranData,
  populatePopularChapters,
  cacheJuz,
  getCacheStatus,
  clearQuranCache,
} from './populate-cache';
