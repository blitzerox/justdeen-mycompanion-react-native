# JustDeen Quran API Integration Guide

**API Provider:** Quran Foundation  
**Base URL:** `https://apis-prelive.quran.foundation/content/api/v4`  
**OAuth2 URL:** `https://oauth2.quran.foundation/oauth2/token`  
**Authentication:** OAuth2 Client Credentials Flow  
**Token Validity:** 1 hour (3600 seconds)

---

## 🔑 Your Credentials

```typescript
const QURAN_API_CONFIG = {
  clientId: 'f0a9dc38-2ba0-4386-9dbc-00ce81a197db',
  clientSecret: 'miilaATs0vtm5WD1NN8alt3OGz',
  oauthUrl: 'https://oauth2.quran.foundation/oauth2/token',
  baseUrl: 'https://apis-prelive.quran.foundation/content/api/v4',
  scope: 'content'
};
```

---

## 📚 Available API Endpoints

### 1. **Chapters (Surahs)**
- `GET /chapters` - All 114 chapters with metadata
- `GET /chapters/{id}` - Specific chapter (1-114)
- `GET /chapters/{id}/info` - Chapter description/context

### 2. **Verses (Ayahs)**
- `GET /verses/by_chapter/{chapter_number}` - All verses in a chapter
- `GET /verses/by_key/{verse_key}` - Single verse (e.g., "1:1")
- `GET /verses/by_juz/{juz_number}` - Verses by Juz (1-30)
- `GET /verses/by_page/{page_number}` - Verses by page (1-604)

### 3. **Translations**
- Available as query param: `?translations=131,20,19`
- Resource ID 131 = "Dr. Mustafa Khattab, the Clear Quran" (English)
- Multiple translations can be fetched together

### 4. **Tafsir (Commentary)**
- Available as query param: `?tafsirs=169`
- Resource ID 169 = "Tafsir Ibn Kathir" (English)
- Can fetch multiple tafsirs together

### 5. **Resources**
- `GET /tafsirs` - List all available tafsirs
- `GET /translations` - List all available translations
- `GET /languages` - List supported languages

---

## 🎯 Recommended Data Combinations

### For Quran Reading Page:

```typescript
GET /verses/by_chapter/{chapter}?language=en&translations=131&words=true&per_page=50

// This fetches:
// - Arabic text (Uthmani script)
// - English translation (Clear Quran)
// - Word-by-word breakdown
// - Transliteration
// - Audio URLs
```

### For Tafsir Page:

```typescript
GET /verses/by_chapter/{chapter}?language=en&tafsirs=169&per_page=50

// This fetches:
// - Arabic text
// - Tafsir Ibn Kathir (English)
// - HTML formatted commentary
```

### Combined (Both Pages):

```typescript
GET /verses/by_chapter/{chapter}?language=en&translations=131&tafsirs=169&words=true&per_page=50

// This fetches EVERYTHING - cache this!
```

---

## 💾 Caching Strategy

### Why Cache?
- ✅ Quran text **NEVER changes** (1400+ years old)
- ✅ Translations/Tafsirs are static
- ✅ Reduce API calls (even though no rate limits)
- ✅ Instant page loads
- ✅ Offline capability

### What to Cache?
**Cache FOREVER (no expiration):**
1. All 114 chapters metadata
2. All verses with translations
3. All tafsirs
4. Chapter info/descriptions

**Don't Cache:**
- OAuth2 access tokens (1 hour expiry)
- User bookmarks/notes (use User APIs)

---

## 🗄️ Database Schema

### Create Quran Cache Tables in D1

```sql
-- Migration: Create Quran Cache Tables
-- Database: justdeen-mosques (or create separate justdeen-quran database)

-- 1. Store OAuth2 Access Token
CREATE TABLE quran_access_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    access_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Cache Chapters Metadata
CREATE TABLE quran_chapters (
    id INTEGER PRIMARY KEY,                    -- Chapter number (1-114)
    name_simple TEXT NOT NULL,                 -- Al-Fatihah
    name_complex TEXT NOT NULL,                -- Al-Fātiĥah
    name_arabic TEXT NOT NULL,                 -- الفاتحة
    translated_name TEXT NOT NULL,             -- The Opener
    verses_count INTEGER NOT NULL,
    revelation_place TEXT NOT NULL,            -- makkah/madinah
    revelation_order INTEGER NOT NULL,
    bismillah_pre INTEGER DEFAULT 0,
    pages TEXT NOT NULL,                       -- JSON: [1, 1]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Cache Verses with Translations
CREATE TABLE quran_verses (
    id INTEGER PRIMARY KEY,                    -- Unique verse ID
    verse_key TEXT UNIQUE NOT NULL,            -- "1:1", "2:255"
    chapter_id INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    page_number INTEGER NOT NULL,
    juz_number INTEGER NOT NULL,
    hizb_number INTEGER NOT NULL,
    text_uthmani TEXT NOT NULL,                -- Arabic Uthmani script
    text_imlaei TEXT,                          -- Modern Arabic script
    
    -- Translations (JSON arrays)
    translations TEXT NOT NULL,                -- JSON: [{"resource_id": 131, "text": "..."}]
    
    -- Word-by-word data (JSON)
    words TEXT,                                -- JSON: [{id, position, translation, transliteration}]
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chapter_id) REFERENCES quran_chapters(id)
);

CREATE INDEX idx_verse_key ON quran_verses(verse_key);
CREATE INDEX idx_chapter_id ON quran_verses(chapter_id);
CREATE INDEX idx_juz_number ON quran_verses(juz_number);

-- 4. Cache Tafsirs Separately (large HTML content)
CREATE TABLE quran_tafsirs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    verse_key TEXT NOT NULL,                   -- "1:1"
    tafsir_resource_id INTEGER NOT NULL,       -- 169 = Ibn Kathir
    tafsir_name TEXT NOT NULL,                 -- "Tafsir Ibn Kathir"
    language_name TEXT NOT NULL,               -- "english"
    text TEXT NOT NULL,                        -- Full HTML content
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(verse_key, tafsir_resource_id)
);

CREATE INDEX idx_tafsir_verse ON quran_tafsirs(verse_key);

-- 5. Cache Chapter Info/Descriptions
CREATE TABLE quran_chapter_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chapter_id INTEGER UNIQUE NOT NULL,
    short_text TEXT NOT NULL,                  -- Brief description
    text TEXT NOT NULL,                        -- Full description
    source TEXT,                               -- Attribution
    language_name TEXT DEFAULT 'english',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chapter_id) REFERENCES quran_chapters(id)
);

-- 6. Track Cache Population Status
CREATE TABLE quran_cache_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_type TEXT UNIQUE NOT NULL,           -- 'chapters', 'verses', 'tafsirs'
    is_populated INTEGER DEFAULT 0,
    last_updated TIMESTAMP,
    total_records INTEGER DEFAULT 0
);

INSERT INTO quran_cache_status (cache_type) VALUES 
    ('chapters'),
    ('verses'),
    ('tafsirs');
```

---

## 🔐 OAuth2 Token Management

### Implementation

```typescript
// lib/quran-api/auth.ts
interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  scope: string;
}

export async function getQuranAccessToken(db: D1Database): Promise<string> {
  // Check for valid cached token
  const cached = await db
    .prepare('SELECT access_token, expires_at FROM quran_access_tokens ORDER BY created_at DESC LIMIT 1')
    .first<{ access_token: string; expires_at: string }>();

  if (cached && new Date(cached.expires_at) > new Date()) {
    console.log('✅ Using cached Quran API token');
    return cached.access_token;
  }

  // Fetch new token
  console.log('🔄 Fetching new Quran API token...');
  
  const credentials = Buffer.from(
    `${QURAN_API_CONFIG.clientId}:${QURAN_API_CONFIG.clientSecret}`
  ).toString('base64');

  const response = await fetch(QURAN_API_CONFIG.oauthUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=content',
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`);
  }

  const data: TokenResponse = await response.json();
  
  // Calculate expiry (59 minutes to be safe)
  const expiresAt = new Date(Date.now() + (data.expires_in - 60) * 1000);

  // Store in cache
  await db
    .prepare('INSERT INTO quran_access_tokens (access_token, expires_at) VALUES (?, ?)')
    .bind(data.access_token, expiresAt.toISOString())
    .run();

  // Clean up old tokens
  await db
    .prepare('DELETE FROM quran_access_tokens WHERE expires_at < datetime("now")')
    .run();

  console.log('✅ New token cached, expires at:', expiresAt.toISOString());
  return data.access_token;
}
```

---

## 📖 Quran Data Fetching Functions

### 1. Fetch & Cache All Chapters

```typescript
// lib/quran-api/chapters.ts
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

  const token = await getQuranAccessToken(db);
  
  const response = await fetch(
    `${QURAN_API_CONFIG.baseUrl}/chapters?language=en`,
    {
      headers: {
        'x-auth-token': token,
        'x-client-id': QURAN_API_CONFIG.clientId,
      },
    }
  );

  const data = await response.json();
  
  // Batch insert all chapters
  const stmt = db.prepare(`
    INSERT INTO quran_chapters (
      id, name_simple, name_complex, name_arabic, translated_name,
      verses_count, revelation_place, revelation_order,
      bismillah_pre, pages
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const chapter of data.chapters) {
    await stmt.bind(
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
    ).run();
  }

  // Update cache status
  await db
    .prepare('UPDATE quran_cache_status SET is_populated = 1, last_updated = datetime("now"), total_records = ? WHERE cache_type = ?')
    .bind(data.chapters.length, 'chapters')
    .run();

  console.log(`✅ Cached ${data.chapters.length} chapters`);
}
```

### 2. Fetch & Cache Chapter Verses

```typescript
// lib/quran-api/verses.ts
export async function fetchAndCacheChapterVerses(
  db: D1Database,
  chapterNumber: number
): Promise<void> {
  // Check if already cached
  const existing = await db
    .prepare('SELECT COUNT(*) as count FROM quran_verses WHERE chapter_id = ?')
    .bind(chapterNumber)
    .first<{ count: number }>();

  if (existing && existing.count > 0) {
    console.log(`✅ Chapter ${chapterNumber} verses already cached`);
    return;
  }

  const token = await getQuranAccessToken(db);
  
  // Fetch with translations and word-by-word data
  const response = await fetch(
    `${QURAN_API_CONFIG.baseUrl}/verses/by_chapter/${chapterNumber}?` +
    `language=en&translations=131&words=true&per_page=300`,
    {
      headers: {
        'x-auth-token': token,
        'x-client-id': QURAN_API_CONFIG.clientId,
      },
    }
  );

  const data = await response.json();
  
  // Insert all verses
  const stmt = db.prepare(`
    INSERT INTO quran_verses (
      id, verse_key, chapter_id, verse_number, page_number,
      juz_number, hizb_number, text_uthmani, translations, words
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const verse of data.verses) {
    await stmt.bind(
      verse.id,
      verse.verse_key,
      chapterNumber,
      verse.verse_number,
      verse.page_number,
      verse.juz_number,
      verse.hizb_number,
      verse.text_uthmani,
      JSON.stringify(verse.translations),
      JSON.stringify(verse.words)
    ).run();
  }

  console.log(`✅ Cached ${data.verses.length} verses for chapter ${chapterNumber}`);
}
```

### 3. Fetch & Cache Chapter Tafsir

```typescript
// lib/quran-api/tafsir.ts
export async function fetchAndCacheChapterTafsir(
  db: D1Database,
  chapterNumber: number,
  tafsirId: number = 169 // Ibn Kathir by default
): Promise<void> {
  // Check if already cached
  const existing = await db
    .prepare(`
      SELECT COUNT(*) as count FROM quran_tafsirs t
      INNER JOIN quran_verses v ON t.verse_key = v.verse_key
      WHERE v.chapter_id = ? AND t.tafsir_resource_id = ?
    `)
    .bind(chapterNumber, tafsirId)
    .first<{ count: number }>();

  if (existing && existing.count > 0) {
    console.log(`✅ Chapter ${chapterNumber} tafsir already cached`);
    return;
  }

  const token = await getQuranAccessToken(db);
  
  // Fetch verses with tafsir
  const response = await fetch(
    `${QURAN_API_CONFIG.baseUrl}/verses/by_chapter/${chapterNumber}?` +
    `language=en&tafsirs=${tafsirId}&per_page=300`,
    {
      headers: {
        'x-auth-token': token,
        'x-client-id': QURAN_API_CONFIG.clientId,
      },
    }
  );

  const data = await response.json();
  
  // Insert tafsirs
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO quran_tafsirs (
      verse_key, tafsir_resource_id, tafsir_name, language_name, text
    ) VALUES (?, ?, ?, ?, ?)
  `);

  for (const verse of data.verses) {
    if (verse.tafsirs && verse.tafsirs.length > 0) {
      const tafsir = verse.tafsirs[0]; // First tafsir
      await stmt.bind(
        verse.verse_key,
        tafsirId,
        tafsir.name || 'Tafsir Ibn Kathir',
        tafsir.language_name || 'english',
        tafsir.text
      ).run();
    }
  }

  console.log(`✅ Cached tafsir for chapter ${chapterNumber}`);
}
```

---

## 🚀 Cache Population Strategy

### Option 1: Background Job (Recommended)

```typescript
// lib/quran-api/populate-cache.ts
export async function populateAllQuranData(db: D1Database): Promise<void> {
  console.log('🚀 Starting Quran data cache population...');
  
  // Step 1: Cache all chapters
  await fetchAndCacheChapters(db);
  
  // Step 2: Cache all verses (114 chapters)
  for (let chapter = 1; chapter <= 114; chapter++) {
    console.log(`📖 Caching chapter ${chapter}/114...`);
    await fetchAndCacheChapterVerses(db, chapter);
  }
  
  // Step 3: Cache all tafsirs
  for (let chapter = 1; chapter <= 114; chapter++) {
    console.log(`📚 Caching tafsir ${chapter}/114...`);
    await fetchAndCacheChapterTafsir(db, chapter);
  }
  
  // Update global cache status
  await db
    .prepare('UPDATE quran_cache_status SET is_populated = 1, last_updated = datetime("now") WHERE cache_type = ?')
    .bind('verses')
    .run();
  
  await db
    .prepare('UPDATE quran_cache_status SET is_populated = 1, last_updated = datetime("now") WHERE cache_type = ?')
    .bind('tafsirs')
    .run();
  
  console.log('✅ Complete! All Quran data cached.');
}
```

### Option 2: On-Demand Caching (Faster Initial Setup)

```typescript
// Cache data when user first accesses a chapter
export async function getChapterData(
  db: D1Database,
  chapterNumber: number
): Promise<ChapterData> {
  // Try to get from cache
  let verses = await db
    .prepare('SELECT * FROM quran_verses WHERE chapter_id = ? ORDER BY verse_number')
    .bind(chapterNumber)
    .all();

  // If not cached, fetch and cache now
  if (!verses.results || verses.results.length === 0) {
    await fetchAndCacheChapterVerses(db, chapterNumber);
    verses = await db
      .prepare('SELECT * FROM quran_verses WHERE chapter_id = ? ORDER BY verse_number')
      .bind(chapterNumber)
      .all();
  }

  return {
    verses: verses.results.map(v => ({
      ...v,
      translations: JSON.parse(v.translations as string),
      words: JSON.parse(v.words as string),
    })),
  };
}
```

---

## 📱 Frontend Implementation

### Quran Reading Page

```typescript
// app/quran/[chapter]/page.tsx
export default async function QuranChapterPage({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter } = await params;
  const chapterNumber = parseInt(chapter);

  // Get from cache (D1)
  const env = process.env as any;
  const db = env.MOSQUES_DB; // or QURAN_DB if separate

  // Ensure data is cached
  await fetchAndCacheChapterVerses(db, chapterNumber);

  // Fetch from cache
  const verses = await db
    .prepare('SELECT * FROM quran_verses WHERE chapter_id = ? ORDER BY verse_number')
    .bind(chapterNumber)
    .all();

  const chapterInfo = await db
    .prepare('SELECT * FROM quran_chapters WHERE id = ?')
    .bind(chapterNumber)
    .first();

  return (
    <div className="quran-reader">
      <h1>{chapterInfo.name_arabic} - {chapterInfo.name_simple}</h1>
      <p>{chapterInfo.translated_name}</p>
      
      {verses.results.map((verse: any) => {
        const translations = JSON.parse(verse.translations);
        const words = JSON.parse(verse.words);
        
        return (
          <div key={verse.verse_key} className="verse">
            <div className="arabic">{verse.text_uthmani}</div>
            <div className="translation">{translations[0].text}</div>
            
            {/* Word-by-word */}
            <div className="words">
              {words.map((word: any) => (
                <span key={word.id} className="word">
                  <span className="arabic">{word.text_uthmani}</span>
                  <span className="transliteration">{word.transliteration?.text}</span>
                  <span className="translation">{word.translation?.text}</span>
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### Tafsir Page

```typescript
// app/quran/[chapter]/tafsir/page.tsx
export default async function TafsirPage({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter } = await params;
  const chapterNumber = parseInt(chapter);

  const env = process.env as any;
  const db = env.MOSQUES_DB;

  // Ensure tafsir is cached
  await fetchAndCacheChapterTafsir(db, chapterNumber);

  // Fetch verses with tafsir
  const verses = await db
    .prepare(`
      SELECT v.*, t.text as tafsir_text, t.tafsir_name
      FROM quran_verses v
      LEFT JOIN quran_tafsirs t ON v.verse_key = t.verse_key
      WHERE v.chapter_id = ?
      ORDER BY v.verse_number
    `)
    .bind(chapterNumber)
    .all();

  return (
    <div className="tafsir-reader">
      {verses.results.map((verse: any) => (
        <div key={verse.verse_key} className="verse-tafsir">
          <div className="arabic">{verse.text_uthmani}</div>
          <div 
            className="tafsir" 
            dangerouslySetInnerHTML={{ __html: verse.tafsir_text }}
          />
        </div>
      ))}
    </div>
  );
}
```

---

## 🔧 API Route for Cache Population

```typescript
// app/api/admin/populate-quran-cache/route.ts
export const runtime = 'edge';

export async function POST(request: Request) {
  const env = process.env as any;
  const db = env.MOSQUES_DB;

  // Check admin auth here
  // ...

  try {
    await populateAllQuranData(db);
    
    return Response.json({
      success: true,
      message: 'Quran data cached successfully',
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
```

---

## 📊 Recommended Translation & Tafsir IDs

### Popular English Translations:
- **131** - Dr. Mustafa Khattab, the Clear Quran ⭐ (Most modern)
- **20** - Muhammad Asad
- **19** - Saheeh International
- **22** - Pickthall
- **85** - Abdullah Yusuf Ali

### English Tafsirs:
- **169** - Tafsir Ibn Kathir ⭐ (Most comprehensive)
- **93** - Maarif-ul-Quran

### Arabic Tafsirs:
- Multiple available - fetch from `/tafsirs?language=ar`

---

## ⚡ Performance Optimization

### 1. Batch Loading
```typescript
// Load multiple chapters at once
for (let chapter = 1; chapter <= 114; chapter += 10) {
  await Promise.all([
    fetchAndCacheChapterVerses(db, chapter),
    fetchAndCacheChapterVerses(db, chapter + 1),
    fetchAndCacheChapterVerses(db, chapter + 2),
    // ... up to 10 concurrent requests
  ]);
}
```

### 2. Progressive Enhancement
```typescript
// Cache most-read chapters first
const popularChapters = [1, 2, 18, 36, 55, 67, 78, 112, 113, 114];
for (const chapter of popularChapters) {
  await fetchAndCacheChapterVerses(db, chapter);
  await fetchAndCacheChapterTafsir(db, chapter);
}
```

---

## 🎯 Implementation Checklist

- [ ] Create database tables (run migration SQL)
- [ ] Implement OAuth2 token management
- [ ] Create chapter fetching function
- [ ] Create verse fetching function
- [ ] Create tafsir fetching function
- [ ] Build cache population script
- [ ] Create Quran reading page
- [ ] Create Tafsir reading page
- [ ] Add loading states
- [ ] Test with popular chapters first
- [ ] Run full cache population (background job)
- [ ] Verify cache is working (check D1 console)
- [ ] Deploy to production

---

## 📈 Cache Size Estimation

- **Chapters:** ~15 KB (114 chapters)
- **Verses (text + translation):** ~15 MB (6,236 verses)
- **Tafsir (Ibn Kathir):** ~50 MB (with HTML)
- **Total:** ~65-70 MB

**Cloudflare D1 Free Tier:** 500 MB storage ✅ (plenty of space!)

---

## 🔄 Cache Invalidation

Since Quran data never changes, you **never need to invalidate** the cache.

**Exception:** If you want to add new translations or tafsirs, just fetch and cache them alongside existing data.

---

## 🚨 Error Handling

```typescript
export async function safeGetQuranData(
  db: D1Database,
  chapterNumber: number
): Promise<ChapterData | null> {
  try {
    // Try cache first
    const cached = await getFromCache(db, chapterNumber);
    if (cached) return cached;

    // Fetch from API
    await fetchAndCacheChapterVerses(db, chapterNumber);
    return await getFromCache(db, chapterNumber);
  } catch (error) {
    console.error('Failed to get Quran data:', error);
    
    // Fallback: Try cache only
    const cached = await getFromCache(db, chapterNumber);
    if (cached) {
      console.log('Using stale cache as fallback');
      return cached;
    }
    
    return null;
  }
}
```

---

## 🎉 Summary

✅ **OAuth2 token managed automatically** (1-hour cache)  
✅ **All Quran data cached permanently** (never expires)  
✅ **Separate pages for Quran reading and Tafsir**  
✅ **Word-by-word translations available**  
✅ **Instant loading after initial cache**  
✅ **Offline-capable once cached**  
✅ **Scalable to millions of users**

**Next Steps:**
1. Run the database migration
2. Implement OAuth2 token management
3. Start with caching Chapter 1 (Al-Fatihah)
4. Test the reading page
5. Gradually populate all 114 chapters

---

**Created:** November 14, 2025  
**For:** JustDeen Quran Reading Feature  
**API Version:** v4.0.0
