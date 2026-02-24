import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'

export type ShareParams = {
  theme: string
  bookId: string
  musicId: string
  movieId: string
  bookThumb?: string
  musicThumb?: string
  movieThumb?: string
}

export type ShareStoreOptions = {
  maxRecords?: number
  ttlSeconds?: number
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

type ShareRow = {
  theme: string
  book_id: string
  music_id: string
  movie_id: string
  book_thumb: string
  music_thumb: string
  movie_thumb: string
}

function mapRow(row: ShareRow): Required<ShareParams> {
  return {
    theme: row.theme,
    bookId: row.book_id,
    musicId: row.music_id,
    movieId: row.movie_id,
    bookThumb: row.book_thumb,
    musicThumb: row.music_thumb,
    movieThumb: row.movie_thumb,
  }
}

function isValidShareId(id: string): boolean {
  return id.length > 0 && id.length <= 12 && !CONTROL_CHAR_RE.test(id)
}

function runMigrations(db: Database.Database): void {
  const columns = db.prepare("PRAGMA table_info('shares')").all() as {
    name: string
  }[]

  // Migration: add params_hash column if missing (existing DBs before this change)
  if (!columns.some((c) => c.name === 'params_hash')) {
    db.exec(
      "ALTER TABLE shares ADD COLUMN params_hash TEXT NOT NULL DEFAULT ''",
    )
  }

  // Migration: add thumbnail columns if missing
  const colNames = new Set(columns.map((c) => c.name))
  if (!colNames.has('book_thumb')) {
    db.exec("ALTER TABLE shares ADD COLUMN book_thumb TEXT NOT NULL DEFAULT ''")
  }
  if (!colNames.has('music_thumb')) {
    db.exec(
      "ALTER TABLE shares ADD COLUMN music_thumb TEXT NOT NULL DEFAULT ''",
    )
  }
  if (!colNames.has('movie_thumb')) {
    db.exec(
      "ALTER TABLE shares ADD COLUMN movie_thumb TEXT NOT NULL DEFAULT ''",
    )
  }
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

export type ShareListItem = Required<ShareParams> & {
  id: string
  createdAt: number
}

export type ShareListResult = {
  items: ShareListItem[]
  total: number
}

export type ShareListOptions = {
  limit: number
  offset: number
}

export type ShareStore = {
  save: (params: ShareParams) => string
  get: (id: string) => ShareParams | null
  list: (options: ShareListOptions) => ShareListResult
  delete: (id: string) => boolean
  purgeExpired: () => number
  close: () => void
}

export function createShareStore(
  dbPath: string,
  options?: ShareStoreOptions,
): ShareStore {
  const maxRecords = options?.maxRecords ?? DEFAULT_MAX_RECORDS
  const ttlSeconds = options?.ttlSeconds ?? 0 // 0 = no TTL

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

  runMigrations(db)

  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_shares_params_hash
      ON shares(params_hash) WHERE params_hash != '';
  `)

  const insertStmt = db.prepare(`
    INSERT INTO shares (id, theme, book_id, music_id, movie_id, params_hash, book_thumb, music_thumb, movie_thumb, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch())
  `)

  const selectStmt = db.prepare(`
    SELECT theme, book_id, music_id, movie_id, book_thumb, music_thumb, movie_thumb FROM shares WHERE id = ?
  `)

  const selectByIdFullStmt = db.prepare(`
    SELECT theme, book_id, music_id, movie_id, book_thumb, music_thumb, movie_thumb, created_at FROM shares WHERE id = ?
  `)

  const selectByHashStmt = db.prepare(`
    SELECT id, book_thumb, music_thumb, movie_thumb FROM shares WHERE params_hash = ?
  `)

  const updateThumbsStmt = db.prepare(`
    UPDATE shares
    SET book_thumb = CASE WHEN book_thumb = '' AND @bookThumb != '' THEN @bookThumb ELSE book_thumb END,
        music_thumb = CASE WHEN music_thumb = '' AND @musicThumb != '' THEN @musicThumb ELSE music_thumb END,
        movie_thumb = CASE WHEN movie_thumb = '' AND @movieThumb != '' THEN @movieThumb ELSE movie_thumb END
    WHERE id = @id
  `)

  const countStmt = db.prepare(`SELECT COUNT(*) as cnt FROM shares`)

  const listStmt = db.prepare(`
    SELECT id, theme, book_id, music_id, movie_id, book_thumb, music_thumb, movie_thumb, created_at
    FROM shares
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `)

  const deleteOldestStmt = db.prepare(`
    DELETE FROM shares WHERE id IN (
      SELECT id FROM shares ORDER BY created_at ASC LIMIT ?
    )
  `)

  const deleteByIdStmt = db.prepare(`DELETE FROM shares WHERE id = ?`)

  const purgeExpiredStmt = db.prepare(
    `DELETE FROM shares WHERE created_at < unixepoch() - ?`,
  )

  function isExpired(createdAt: number): boolean {
    if (ttlSeconds <= 0) return false
    return createdAt < Math.floor(Date.now() / 1000) - ttlSeconds
  }

  const saveTransaction = db.transaction((params: ShareParams): string => {
    const hash = computeParamsHash(params)

    // Return existing ID if the same params were already saved
    const existing = selectByHashStmt.get(hash) as
      | {
          id: string
          book_thumb: string
          music_thumb: string
          movie_thumb: string
        }
      | undefined
    if (existing) {
      // Update thumbnails if they were previously empty
      const bookThumb = params.bookThumb ?? ''
      const musicThumb = params.musicThumb ?? ''
      const movieThumb = params.movieThumb ?? ''
      if (
        (existing.book_thumb === '' && bookThumb !== '') ||
        (existing.music_thumb === '' && musicThumb !== '') ||
        (existing.movie_thumb === '' && movieThumb !== '')
      ) {
        updateThumbsStmt.run({
          bookThumb,
          musicThumb,
          movieThumb,
          id: existing.id,
        })
      }
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
      params.bookThumb ?? '',
      params.musicThumb ?? '',
      params.movieThumb ?? '',
    )
    return id
  })

  return {
    save(params: ShareParams): string {
      validateParams(params)
      return saveTransaction(params)
    },

    get(id: string): ShareParams | null {
      if (!isValidShareId(id)) return null
      const row = selectByIdFullStmt.get(id) as
        | (ShareRow & { created_at: number })
        | undefined
      if (!row) return null
      if (isExpired(row.created_at)) return null
      return mapRow(row)
    },

    list(options: ShareListOptions): ShareListResult {
      if (ttlSeconds > 0) {
        purgeExpiredStmt.run(ttlSeconds)
      }
      const { cnt } = countStmt.get() as { cnt: number }
      const rows = listStmt.all(options.limit, options.offset) as (ShareRow & {
        id: string
        created_at: number
      })[]
      return {
        items: rows.map((row) => ({
          ...mapRow(row),
          id: row.id,
          createdAt: row.created_at,
        })),
        total: cnt,
      }
    },

    delete(id: string): boolean {
      if (!isValidShareId(id)) return false
      const result = deleteByIdStmt.run(id)
      return result.changes > 0
    },

    purgeExpired(): number {
      if (ttlSeconds <= 0) return 0
      const result = purgeExpiredStmt.run(ttlSeconds)
      return result.changes
    },

    close(): void {
      db.close()
    },
  }
}
