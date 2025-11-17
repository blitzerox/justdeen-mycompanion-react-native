/**
 * Quran Foundation API - Translations Service
 * Fetch available translations and languages
 */

import { getDatabase } from './database'
import { makeQuranAPIRequest } from './auth'

export interface Language {
  id: number
  name: string
  iso_code: string
  native_name: string
  direction: 'ltr' | 'rtl'
  translations_count: number
}

export interface TranslationResource {
  id: number
  name: string
  author_name: string
  slug: string
  language_name: string
}

interface LanguagesResponse {
  languages: Array<{
    id: number
    name: string
    iso_code: string
    native_name: string
    direction: string
    translations_count: number
  }>
}

interface TranslationsResponse {
  translations: Array<{
    id: number
    name: string
    author_name: string
    slug: string
    language_name: string
  }>
}

/**
 * Fetch and cache all available languages
 */
export async function fetchAndCacheLanguages(): Promise<void> {
  const db = await getDatabase()

  // Check if already cached
  const existing = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM quran_languages'
  )

  if (existing && existing.count > 0) {
    console.log('✅ Languages already cached')
    return
  }

  console.log('🔄 Fetching available languages...')

  const data = await makeQuranAPIRequest<LanguagesResponse>('/resources/languages')

  console.log(`📖 Caching ${data.languages.length} languages...`)

  // Insert all languages
  for (const language of data.languages) {
    await db.runAsync(
      `INSERT INTO quran_languages (
        id, name, iso_code, native_name, direction, translations_count
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      language.id,
      language.name,
      language.iso_code,
      language.native_name,
      language.direction,
      language.translations_count
    )
  }

  console.log(`✅ Cached ${data.languages.length} languages successfully`)
}

/**
 * Get all languages from cache
 */
export async function getAllLanguages(): Promise<Language[]> {
  const db = await getDatabase()

  // Ensure languages are cached
  await fetchAndCacheLanguages()

  const result = await db.getAllAsync<any>(
    'SELECT * FROM quran_languages ORDER BY name'
  )

  return result.map((row) => ({
    id: row.id,
    name: row.name,
    iso_code: row.iso_code,
    native_name: row.native_name,
    direction: row.direction as 'ltr' | 'rtl',
    translations_count: row.translations_count,
  }))
}

/**
 * Fetch and cache all available translations
 */
export async function fetchAndCacheTranslations(): Promise<void> {
  const db = await getDatabase()

  // Check if already cached
  const existing = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM quran_translations'
  )

  if (existing && existing.count > 0) {
    console.log('✅ Translations already cached')
    return
  }

  console.log('🔄 Fetching available translations...')

  const data = await makeQuranAPIRequest<TranslationsResponse>('/resources/translations')

  console.log(`📖 Caching ${data.translations.length} translations...`)

  // Debug: Log first translation to see structure
  if (data.translations.length > 0) {
    console.log('🔍 Sample translation:', JSON.stringify(data.translations[0], null, 2))
  }

  // Insert all translations
  for (const translation of data.translations) {
    await db.runAsync(
      `INSERT INTO quran_translations (
        id, name, author_name, slug, language_name
      ) VALUES (?, ?, ?, ?, ?)`,
      translation.id,
      translation.name,
      translation.author_name,
      translation.slug || null,
      translation.language_name
    )
  }

  console.log(`✅ Cached ${data.translations.length} translations successfully`)
}

/**
 * Get all translations from cache
 */
export async function getAllTranslations(): Promise<TranslationResource[]> {
  const db = await getDatabase()

  // Ensure translations are cached
  await fetchAndCacheTranslations()

  const result = await db.getAllAsync<any>(
    'SELECT * FROM quran_translations ORDER BY language_name, name'
  )

  return result.map((row) => ({
    id: row.id,
    name: row.name,
    author_name: row.author_name,
    slug: row.slug,
    language_name: row.language_name,
  }))
}

/**
 * Get translations for a specific language
 */
export async function getTranslationsByLanguage(languageName: string): Promise<TranslationResource[]> {
  const db = await getDatabase()

  // Ensure translations are cached
  await fetchAndCacheTranslations()

  const result = await db.getAllAsync<any>(
    'SELECT * FROM quran_translations WHERE language_name = ? ORDER BY name',
    languageName
  )

  return result.map((row) => ({
    id: row.id,
    name: row.name,
    author_name: row.author_name,
    slug: row.slug,
    language_name: row.language_name,
  }))
}

/**
 * Get popular English translations
 */
export async function getPopularEnglishTranslations(): Promise<TranslationResource[]> {
  const db = await getDatabase()

  // Ensure translations are cached
  await fetchAndCacheTranslations()

  const result = await db.getAllAsync<any>(
    'SELECT * FROM quran_translations WHERE language_name = ? ORDER BY name LIMIT 10',
    'english'
  )

  return result.map((row) => ({
    id: row.id,
    name: row.name,
    author_name: row.author_name,
    slug: row.slug,
    language_name: row.language_name,
  }))
}
