/**
 * WatermelonDB Schema for JustDeen MyCompanion
 * Offline storage for Quran, Hadith, and Duas
 */

import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const schema = appSchema({
  version: 1,
  tables: [
    // ============================================
    // QURAN TABLES
    // ============================================

    /**
     * Surahs (114 chapters)
     */
    tableSchema({
      name: 'surahs',
      columns: [
        { name: 'surah_number', type: 'number', isIndexed: true },
        { name: 'name_arabic', type: 'string' },
        { name: 'name_transliteration', type: 'string' },
        { name: 'name_translation', type: 'string' },
        { name: 'revelation_place', type: 'string' }, // 'Makkah' or 'Madinah'
        { name: 'total_verses', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),

    /**
     * Ayahs (6,236 verses)
     */
    tableSchema({
      name: 'ayahs',
      columns: [
        { name: 'surah_number', type: 'number', isIndexed: true },
        { name: 'ayah_number', type: 'number', isIndexed: true },
        { name: 'text_arabic', type: 'string' },
        { name: 'text_uthmani', type: 'string' }, // Uthmani script
        { name: 'juz', type: 'number', isIndexed: true },
        { name: 'page', type: 'number', isIndexed: true },
        { name: 'manzil', type: 'number' },
        { name: 'ruku', type: 'number' },
        { name: 'hizb', type: 'number' },
        { name: 'sajda', type: 'boolean' },
        { name: 'created_at', type: 'number' },
      ],
    }),

    /**
     * Translations (multiple languages)
     */
    tableSchema({
      name: 'translations',
      columns: [
        { name: 'surah_number', type: 'number', isIndexed: true },
        { name: 'ayah_number', type: 'number', isIndexed: true },
        { name: 'language', type: 'string', isIndexed: true },
        { name: 'translator_id', type: 'string', isIndexed: true },
        { name: 'text', type: 'string' },
        { name: 'footnotes', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
      ],
    }),

    /**
     * Translators
     */
    tableSchema({
      name: 'translators',
      columns: [
        { name: 'translator_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'language', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
      ],
    }),

    /**
     * Tafsir (Quran commentary)
     */
    tableSchema({
      name: 'tafsir',
      columns: [
        { name: 'surah_number', type: 'number', isIndexed: true },
        { name: 'ayah_number', type: 'number', isIndexed: true },
        { name: 'tafsir_id', type: 'string', isIndexed: true },
        { name: 'text', type: 'string' },
        { name: 'language', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),

    // ============================================
    // HADITH TABLES
    // ============================================

    /**
     * Hadith Collections (Bukhari, Muslim, etc.)
     */
    tableSchema({
      name: 'hadith_collections',
      columns: [
        { name: 'collection_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'name_arabic', type: 'string' },
        { name: 'total_hadiths', type: 'number' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
      ],
    }),

    /**
     * Hadith Books (within collections)
     */
    tableSchema({
      name: 'hadith_books',
      columns: [
        { name: 'collection_id', type: 'string', isIndexed: true },
        { name: 'book_number', type: 'number', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'name_arabic', type: 'string' },
        { name: 'total_hadiths', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),

    /**
     * Hadiths
     */
    tableSchema({
      name: 'hadiths',
      columns: [
        { name: 'hadith_id', type: 'string', isIndexed: true },
        { name: 'collection_id', type: 'string', isIndexed: true },
        { name: 'book_number', type: 'number', isIndexed: true },
        { name: 'hadith_number', type: 'number', isIndexed: true },
        { name: 'text_arabic', type: 'string' },
        { name: 'text_english', type: 'string' },
        { name: 'narrator', type: 'string', isOptional: true },
        { name: 'grade', type: 'string', isOptional: true }, // Sahih, Hasan, Daif
        { name: 'created_at', type: 'number' },
      ],
    }),

    // ============================================
    // DUAS TABLES
    // ============================================

    /**
     * Duas (Supplications)
     */
    tableSchema({
      name: 'duas',
      columns: [
        { name: 'dua_id', type: 'string', isIndexed: true },
        { name: 'title', type: 'string' },
        { name: 'title_arabic', type: 'string' },
        { name: 'category', type: 'string', isIndexed: true },
        { name: 'text_arabic', type: 'string' },
        { name: 'text_transliteration', type: 'string' },
        { name: 'text_translation', type: 'string' },
        { name: 'reference', type: 'string', isOptional: true },
        { name: 'audio_url', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
      ],
    }),

    // ============================================
    // USER DATA TABLES (Offline)
    // ============================================

    /**
     * Reading History (Offline tracking)
     */
    tableSchema({
      name: 'reading_history',
      columns: [
        { name: 'content_type', type: 'string', isIndexed: true }, // 'quran', 'hadith', 'dua'
        { name: 'content_id', type: 'string', isIndexed: true },
        { name: 'last_read_at', type: 'number', isIndexed: true },
        { name: 'read_count', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),

    /**
     * Offline Bookmarks (sync with Cloudflare D1)
     */
    tableSchema({
      name: 'offline_bookmarks',
      columns: [
        { name: 'bookmark_id', type: 'string', isIndexed: true },
        { name: 'content_type', type: 'string', isIndexed: true },
        { name: 'content_id', type: 'string', isIndexed: true },
        { name: 'note', type: 'string', isOptional: true },
        { name: 'tags', type: 'string', isOptional: true }, // JSON array
        { name: 'synced', type: 'boolean' }, // Has been synced to cloud?
        { name: 'created_at', type: 'number' },
      ],
    }),

    /**
     * Downloaded Audio Files
     */
    tableSchema({
      name: 'audio_downloads',
      columns: [
        { name: 'surah_number', type: 'number', isIndexed: true },
        { name: 'reciter_id', type: 'string', isIndexed: true },
        { name: 'file_path', type: 'string' },
        { name: 'file_size', type: 'number' },
        { name: 'downloaded_at', type: 'number' },
      ],
    }),
  ],
})
