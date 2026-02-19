import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'

export type ShareParams = {
  theme: string
  bookId: string
  musicId: string
  movieId: string
}

export type ShareStoreOptions = {
  maxRecords?: number
}

const DEFAULT_MAX_RECORDS = 10_000
const MAX_ID_LENGTH = 100
const MAX_THEME_LENGTH = 50

// Allow printable characters only (no control chars)
// eslint-disable-next-line no-control-regex
const CONTROL_CHAR_RE = /[\x00-\x1f\x7f]/

function generateId(): string {
  // 8 chars of url-safe base64 (48 bits of entropy)
  return crypto.randomBytes(6).toString('base64url')
}

function computeParamsHash(params: ShareParams): string {
  const payload = [
    params.theme,
    params.bookId,
    params.musicId,
    params.movieId,
  ].join('\0')
  return crypto.createHash('sha256').update(payload).digest('base64url')
}

function validateField(name: string, value: string, maxLen: number): void {
  if (value.length > maxLen) {
    throw new Error(`${name} exceeds maximum length of ${maxLen}`)
  }
  if (CONTROL_CHAR_RE.test(value)) {
    throw new Error(`${name} contains invalid characters`)
  }
}

function validateParams(params: ShareParams): void {
  validateField('theme', params.theme, MAX_THEME_LENGTH)
  validateField('bookId', params.bookId, MAX_ID_LENGTH)
  validateField('musicId', params.musicId, MAX_ID_LENGTH)
  validateField('movieId', params.movieId, MAX_ID_LENGTH)
}

export type ShareStore = {
  save: (params: ShareParams) => string
  get: (id: string) => ShareParams | null
  close: () => void
}

export function createShareStore(
  dbPath: string,
  options?: ShareStoreOptions,
): ShareStore {
  const maxRecords = options?.maxRecords ?? DEFAULT_MAX_RECORDS

  // Ensure directory exists
  const dir = path.dirname(dbPath)
  fs.mkdirSync(dir, { recursive: true })

  const db = new Database(dbPath)

  // Enable WAL mode for better concurrent read performance
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS shares (
      id TEXT PRIMARY KEY,
      theme TEXT NOT NULL DEFAULT '',
      book_id TEXT NOT NULL DEFAULT '',
      music_id TEXT NOT NULL DEFAULT '',
      movie_id TEXT NOT NULL DEFAULT '',
      params_hash TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS idx_shares_created_at ON shares(created_at);
  `)

  // Migration: add params_hash column if missing (existing DBs before this change)
  const columns = db.prepare("PRAGMA table_info('shares')").all() as {
    name: string
  }[]
  if (!columns.some((c) => c.name === 'params_hash')) {
    db.exec(
      "ALTER TABLE shares ADD COLUMN params_hash TEXT NOT NULL DEFAULT ''",
    )
  }

  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_shares_params_hash
      ON shares(params_hash) WHERE params_hash != '';
  `)

  const insertStmt = db.prepare(`
    INSERT INTO shares (id, theme, book_id, music_id, movie_id, params_hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?, unixepoch())
  `)

  const selectStmt = db.prepare(`
    SELECT theme, book_id, music_id, movie_id FROM shares WHERE id = ?
  `)

  const selectByHashStmt = db.prepare(`
    SELECT id FROM shares WHERE params_hash = ?
  `)

  const countStmt = db.prepare(`SELECT COUNT(*) as cnt FROM shares`)

  const deleteOldestStmt = db.prepare(`
    DELETE FROM shares WHERE id IN (
      SELECT id FROM shares ORDER BY created_at ASC LIMIT ?
    )
  `)

  const saveTransaction = db.transaction((params: ShareParams): string => {
    const hash = computeParamsHash(params)

    // Return existing ID if the same params were already saved
    const existing = selectByHashStmt.get(hash) as { id: string } | undefined
    if (existing) {
      return existing.id
    }

    let id = generateId()
    // Ensure uniqueness (extremely unlikely collision but safe)
    while (selectStmt.get(id)) {
      id = generateId()
    }

    // Evict oldest records if at capacity
    const { cnt } = countStmt.get() as { cnt: number }
    if (cnt >= maxRecords) {
      const excess = cnt - maxRecords + 1
      deleteOldestStmt.run(excess)
    }

    insertStmt.run(
      id,
      params.theme,
      params.bookId,
      params.musicId,
      params.movieId,
      hash,
    )
    return id
  })

  return {
    save(params: ShareParams): string {
      validateParams(params)
      return saveTransaction(params)
    },

    get(id: string): ShareParams | null {
      // Generated IDs are 8 chars of base64url; reject obviously invalid input early
      if (id.length === 0 || id.length > 12 || CONTROL_CHAR_RE.test(id)) {
        return null
      }
      const row = selectStmt.get(id) as
        | { theme: string; book_id: string; music_id: string; movie_id: string }
        | undefined
      if (!row) return null
      return {
        theme: row.theme,
        bookId: row.book_id,
        musicId: row.music_id,
        movieId: row.movie_id,
      }
    },

    close(): void {
      db.close()
    },
  }
}
