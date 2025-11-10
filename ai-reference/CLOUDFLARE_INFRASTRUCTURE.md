# Cloudflare Infrastructure Documentation

**Project:** JustDeen MyCompanion - React Native Migration
**Last Updated:** 2025-11-10

---

## Overview

JustDeen uses **Cloudflare Workers + D1 (SQLite at the edge)** for backend infrastructure, replacing AWS DynamoDB. This provides global edge computing with lower latency and costs.

**Architecture:**
```
React Native App
       ↓
  (HTTPS/REST)
       ↓
Cloudflare Workers (API)
       ↓
  Cloudflare D1 (Database)
```

---

## 1. Cloudflare D1 Database Schemas

### Database: `justdeen-production`

#### 1.1 Users Table

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,                    -- UUID
  email TEXT UNIQUE,                      -- User email (nullable for anonymous)
  display_name TEXT,                      -- Display name
  auth_provider TEXT NOT NULL,            -- 'google', 'apple', 'anonymous'
  auth_provider_id TEXT,                  -- Provider-specific user ID
  avatar_url TEXT,                        -- Profile picture URL
  is_premium BOOLEAN DEFAULT 0,           -- Premium subscription status
  premium_expires_at INTEGER,             -- Unix timestamp
  created_at INTEGER NOT NULL,            -- Unix timestamp
  updated_at INTEGER NOT NULL,            -- Unix timestamp
  last_login_at INTEGER,                  -- Unix timestamp
  UNIQUE(auth_provider, auth_provider_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_provider ON users(auth_provider, auth_provider_id);
```

#### 1.2 User Settings Table

```sql
CREATE TABLE user_settings (
  user_id TEXT PRIMARY KEY,               -- References users(id)
  theme TEXT DEFAULT 'auto',              -- 'light', 'dark', 'auto'
  language TEXT DEFAULT 'en',             -- 'en', 'ar', 'ur', etc.
  prayer_calculation_method INTEGER DEFAULT 2, -- AlAdhan method ID
  prayer_notification_offset INTEGER DEFAULT 10, -- Minutes before prayer
  prayer_notification_enabled BOOLEAN DEFAULT 1,
  quran_text_size INTEGER DEFAULT 18,     -- Font size
  quran_translation_id TEXT,              -- Default translation
  quran_reciter_id TEXT,                  -- Default reciter
  location_latitude REAL,                 -- Last known location
  location_longitude REAL,
  location_name TEXT,                     -- City, Country
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_settings_user ON user_settings(user_id);
```

#### 1.3 Bookmarks Table

```sql
CREATE TABLE bookmarks (
  id TEXT PRIMARY KEY,                    -- UUID
  user_id TEXT NOT NULL,                  -- References users(id)
  bookmark_type TEXT NOT NULL,            -- 'quran_verse', 'hadith', 'dua'
  reference_id TEXT NOT NULL,             -- Verse ID, Hadith ID, etc.
  note TEXT,                              -- User's personal note
  tags TEXT,                              -- JSON array of tags
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_type ON bookmarks(bookmark_type);
CREATE INDEX idx_bookmarks_reference ON bookmarks(reference_id);
```

#### 1.4 Reading Groups Table

```sql
CREATE TABLE reading_groups (
  id TEXT PRIMARY KEY,                    -- UUID
  name TEXT NOT NULL,                     -- Group name
  description TEXT,                       -- Group description
  invite_code TEXT UNIQUE NOT NULL,       -- 6-character invite code
  creator_id TEXT NOT NULL,               -- References users(id)
  reading_target TEXT NOT NULL,           -- 'quran_complete', 'juz_30', 'custom'
  target_date INTEGER,                    -- Unix timestamp (optional deadline)
  is_private BOOLEAN DEFAULT 0,           -- Private vs public group
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_reading_groups_invite_code ON reading_groups(invite_code);
CREATE INDEX idx_reading_groups_creator ON reading_groups(creator_id);
```

#### 1.5 Group Members Table

```sql
CREATE TABLE group_members (
  id TEXT PRIMARY KEY,                    -- UUID
  group_id TEXT NOT NULL,                 -- References reading_groups(id)
  user_id TEXT NOT NULL,                  -- References users(id)
  role TEXT DEFAULT 'member',             -- 'admin', 'moderator', 'member'
  joined_at INTEGER NOT NULL,
  last_active_at INTEGER,
  UNIQUE(group_id, user_id),
  FOREIGN KEY (group_id) REFERENCES reading_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
```

#### 1.6 Group Progress Table

```sql
CREATE TABLE group_progress (
  id TEXT PRIMARY KEY,                    -- UUID
  group_id TEXT NOT NULL,                 -- References reading_groups(id)
  user_id TEXT NOT NULL,                  -- References users(id)
  surah_number INTEGER NOT NULL,          -- 1-114
  verse_number INTEGER NOT NULL,          -- Verse within surah
  completed_at INTEGER NOT NULL,          -- Unix timestamp
  UNIQUE(group_id, user_id, surah_number, verse_number),
  FOREIGN KEY (group_id) REFERENCES reading_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_group_progress_group ON group_progress(group_id);
CREATE INDEX idx_group_progress_user ON group_progress(user_id);
CREATE INDEX idx_group_progress_completed ON group_progress(completed_at);
```

#### 1.7 Group Posts Table (Community Feed)

```sql
CREATE TABLE group_posts (
  id TEXT PRIMARY KEY,                    -- UUID
  group_id TEXT NOT NULL,                 -- References reading_groups(id)
  user_id TEXT NOT NULL,                  -- References users(id)
  content TEXT NOT NULL,                  -- Post content
  post_type TEXT DEFAULT 'update',        -- 'update', 'milestone', 'question'
  metadata TEXT,                          -- JSON metadata (e.g., milestone details)
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (group_id) REFERENCES reading_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_group_posts_group ON group_posts(group_id);
CREATE INDEX idx_group_posts_user ON group_posts(user_id);
CREATE INDEX idx_group_posts_created ON group_posts(created_at DESC);
```

#### 1.8 Group Reactions Table

```sql
CREATE TABLE group_reactions (
  id TEXT PRIMARY KEY,                    -- UUID
  post_id TEXT NOT NULL,                  -- References group_posts(id)
  user_id TEXT NOT NULL,                  -- References users(id)
  reaction_type TEXT NOT NULL,            -- 'like', 'encourage', 'pray'
  created_at INTEGER NOT NULL,
  UNIQUE(post_id, user_id, reaction_type),
  FOREIGN KEY (post_id) REFERENCES group_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_group_reactions_post ON group_reactions(post_id);
CREATE INDEX idx_group_reactions_user ON group_reactions(user_id);
```

#### 1.9 Prayer Logs Table (Optional - for analytics)

```sql
CREATE TABLE prayer_logs (
  id TEXT PRIMARY KEY,                    -- UUID
  user_id TEXT NOT NULL,                  -- References users(id)
  prayer_name TEXT NOT NULL,              -- 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha'
  prayer_date INTEGER NOT NULL,           -- Unix timestamp (date only)
  logged_at INTEGER NOT NULL,             -- Unix timestamp
  on_time BOOLEAN DEFAULT 1,              -- Prayed on time?
  UNIQUE(user_id, prayer_date, prayer_name),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_prayer_logs_user ON prayer_logs(user_id);
CREATE INDEX idx_prayer_logs_date ON prayer_logs(prayer_date DESC);
```

#### 1.10 Tasbih History Table (Optional - for analytics)

```sql
CREATE TABLE tasbih_history (
  id TEXT PRIMARY KEY,                    -- UUID
  user_id TEXT NOT NULL,                  -- References users(id)
  dhikr_type TEXT NOT NULL,               -- 'subhanallah', 'alhamdulillah', 'allahuakbar', 'custom'
  count INTEGER NOT NULL,                 -- Number of times counted
  logged_at INTEGER NOT NULL,             -- Unix timestamp
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_tasbih_history_user ON tasbih_history(user_id);
CREATE INDEX idx_tasbih_history_logged ON tasbih_history(logged_at DESC);
```

---

## 2. Cloudflare Workers API Endpoints

### Base URL: `https://api.justdeen.com` (or `justdeen-api.workers.dev`)

### 2.1 Authentication Endpoints

#### POST /auth/signin
**Description:** Sign in or register user with OAuth provider

**Request:**
```json
{
  "provider": "google" | "apple" | "anonymous",
  "token": "oauth_token_from_provider",
  "displayName": "John Doe" (optional),
  "email": "john@example.com" (optional),
  "avatarUrl": "https://..." (optional)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "token": "jwt_token",
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "displayName": "John Doe",
      "isPremium": false,
      "createdAt": 1699564800
    }
  }
}
```

#### POST /auth/refresh
**Description:** Refresh JWT token

**Request:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "expiresAt": 1699564800
  }
}
```

#### POST /auth/signout
**Description:** Sign out user (invalidate token)

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Signed out successfully"
}
```

---

### 2.2 User Settings Endpoints

#### GET /users/:userId/settings
**Description:** Get user settings

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "theme": "dark",
    "language": "en",
    "prayerCalculationMethod": 2,
    "prayerNotificationOffset": 10,
    "quranTextSize": 18,
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "name": "New York, USA"
    }
  }
}
```

#### PUT /users/:userId/settings
**Description:** Update user settings

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "theme": "dark",
  "language": "en",
  "prayerCalculationMethod": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings updated"
}
```

---

### 2.3 Bookmarks Endpoints

#### GET /users/:userId/bookmarks
**Description:** Get user's bookmarks

**Headers:** `Authorization: Bearer {token}`

**Query Params:**
- `type` (optional): Filter by bookmark_type
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "success": true,
  "data": {
    "bookmarks": [
      {
        "id": "uuid",
        "type": "quran_verse",
        "referenceId": "2:255",
        "note": "Ayatul Kursi - for protection",
        "tags": ["favorite", "daily"],
        "createdAt": 1699564800
      }
    ],
    "total": 42
  }
}
```

#### POST /users/:userId/bookmarks
**Description:** Create bookmark

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "type": "quran_verse",
  "referenceId": "2:255",
  "note": "Ayatul Kursi",
  "tags": ["favorite"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "createdAt": 1699564800
  }
}
```

#### PUT /users/:userId/bookmarks/:bookmarkId
**Description:** Update bookmark

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "note": "Updated note",
  "tags": ["favorite", "memorize"]
}
```

#### DELETE /users/:userId/bookmarks/:bookmarkId
**Description:** Delete bookmark

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Bookmark deleted"
}
```

---

### 2.4 Reading Groups Endpoints

#### GET /groups
**Description:** Get all public groups or user's groups

**Headers:** `Authorization: Bearer {token}` (optional)

**Query Params:**
- `userId` (optional): Get groups user is member of
- `public` (optional): Only public groups

**Response:**
```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": "uuid",
        "name": "Ramadan Quran Completion",
        "description": "Let's complete the Quran together!",
        "inviteCode": "ABC123",
        "memberCount": 42,
        "createdAt": 1699564800
      }
    ]
  }
}
```

#### POST /groups
**Description:** Create new reading group

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "name": "Ramadan Quran Completion",
  "description": "Let's complete the Quran together!",
  "readingTarget": "quran_complete",
  "targetDate": 1699564800,
  "isPrivate": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "inviteCode": "ABC123",
    "createdAt": 1699564800
  }
}
```

#### GET /groups/:groupId
**Description:** Get group details

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "group": {
      "id": "uuid",
      "name": "Ramadan Quran Completion",
      "description": "...",
      "inviteCode": "ABC123",
      "readingTarget": "quran_complete",
      "memberCount": 42,
      "createdAt": 1699564800
    },
    "members": [
      {
        "userId": "uuid",
        "displayName": "John Doe",
        "avatarUrl": "...",
        "role": "admin",
        "progress": 25.5
      }
    ]
  }
}
```

#### POST /groups/join
**Description:** Join group with invite code

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "inviteCode": "ABC123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "groupId": "uuid",
    "joinedAt": 1699564800
  }
}
```

#### POST /groups/:groupId/leave
**Description:** Leave group

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Left group successfully"
}
```

---

### 2.5 Group Progress Endpoints

#### GET /groups/:groupId/progress
**Description:** Get group's overall progress

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalVerses": 6236,
    "completedVerses": 1500,
    "percentComplete": 24.05,
    "topReaders": [
      {
        "userId": "uuid",
        "displayName": "John Doe",
        "versesRead": 350
      }
    ]
  }
}
```

#### POST /groups/:groupId/progress
**Description:** Log reading progress

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "surahNumber": 2,
  "verseNumber": 255
}
```

**Response:**
```json
{
  "success": true,
  "message": "Progress logged"
}
```

---

### 2.6 Group Posts Endpoints

#### GET /groups/:groupId/posts
**Description:** Get group feed posts

**Headers:** `Authorization: Bearer {token}`

**Query Params:**
- `limit` (optional): Number of posts (default: 20)
- `offset` (optional): Pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "uuid",
        "userId": "uuid",
        "userName": "John Doe",
        "userAvatar": "...",
        "content": "Just completed Surah Al-Baqarah!",
        "postType": "milestone",
        "reactions": {
          "like": 5,
          "encourage": 3
        },
        "createdAt": 1699564800
      }
    ]
  }
}
```

#### POST /groups/:groupId/posts
**Description:** Create post in group feed

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "content": "Just completed Surah Al-Baqarah!",
  "postType": "milestone"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "createdAt": 1699564800
  }
}
```

#### POST /groups/:groupId/posts/:postId/react
**Description:** React to a post

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "reactionType": "encourage"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reaction added"
}
```

---

## 3. Cloudflare Workers Implementation

### Project Structure:
```
cloudflare-workers/
├── src/
│   ├── index.ts                 # Main router
│   ├── auth/
│   │   ├── handlers.ts          # Auth endpoints
│   │   └── jwt.ts               # JWT utilities
│   ├── users/
│   │   └── handlers.ts          # User endpoints
│   ├── bookmarks/
│   │   └── handlers.ts          # Bookmark endpoints
│   ├── groups/
│   │   └── handlers.ts          # Group endpoints
│   ├── database/
│   │   ├── d1.ts                # D1 client wrapper
│   │   └── queries.ts           # SQL queries
│   └── utils/
│       ├── response.ts          # Response helpers
│       └── validation.ts        # Input validation
├── wrangler.toml                # Cloudflare config
└── schema.sql                   # Database schema
```

### wrangler.toml Configuration:
```toml
name = "justdeen-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "justdeen-production"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

[vars]
ENVIRONMENT = "production"
JWT_SECRET = "your-secret-key-here"
```

---

## 4. Authentication Flow

### JWT Token Structure:
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "provider": "google",
  "isPremium": false,
  "iat": 1699564800,
  "exp": 1699651200
}
```

### Token Expiration:
- Access token: 7 days
- Refresh token: 30 days

---

## 5. Error Handling

### Standard Error Response:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

### Error Codes:
- `UNAUTHORIZED`: No valid auth token
- `FORBIDDEN`: User lacks permission
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input
- `DATABASE_ERROR`: D1 error
- `INTERNAL_ERROR`: Unexpected error

---

## 6. Rate Limiting

**Implemented using Cloudflare Workers KV:**

- Auth endpoints: 10 requests/minute per IP
- Read endpoints: 100 requests/minute per user
- Write endpoints: 30 requests/minute per user

---

## 7. Deployment Commands

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create justdeen-production

# Run migrations
wrangler d1 execute justdeen-production --file=schema.sql

# Deploy worker
wrangler publish

# Tail logs
wrangler tail
```

---

## 8. Environment Variables

**Required in `wrangler.toml` or Cloudflare Dashboard:**

- `JWT_SECRET`: Secret key for JWT signing
- `GOOGLE_OAUTH_CLIENT_ID`: Google OAuth client ID
- `APPLE_OAUTH_CLIENT_ID`: Apple OAuth client ID
- `ENVIRONMENT`: `development` | `production`

---

**Last Updated:** 2025-11-10
**Maintained By:** Backend team
**Review Schedule:** Monthly
