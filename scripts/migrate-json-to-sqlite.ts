/**
 * Migration script: shares.json → shares.db (SQLite)
 *
 * Usage:
 *   npx tsx scripts/migrate-json-to-sqlite.ts [json-path] [db-path]
 *
 * Defaults:
 *   json-path: data/shares.json
 *   db-path:   data/shares.db
 */
import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'

const jsonPath = process.argv[2] || path.resolve('data', 'shares.json')
const dbPath = process.argv[3] || path.resolve('data', 'shares.db')

if (!fs.existsSync(jsonPath)) {
  console.error(`JSON file not found: ${jsonPath}`)
  process.exit(1)
}

const raw = fs.readFileSync(jsonPath, 'utf-8')
const data = JSON.parse(raw) as Record<
  string,
  { theme: string; bookId: string; musicId: string; movieId: string }
>

const entries = Object.entries(data)
console.log(`Found ${entries.length} records in ${jsonPath}`)

const dir = path.dirname(dbPath)
fs.mkdirSync(dir, { recursive: true })

const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS shares (
    id TEXT PRIMARY KEY,
    theme TEXT NOT NULL DEFAULT '',
    book_id TEXT NOT NULL DEFAULT '',
    music_id TEXT NOT NULL DEFAULT '',
    movie_id TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE INDEX IF NOT EXISTS idx_shares_created_at ON shares(created_at);
`)

const insert = db.prepare(`
  INSERT OR IGNORE INTO shares (id, theme, book_id, music_id, movie_id, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`)

const insertMany = db.transaction(
  (
    rows: Array<{
      id: string
      theme: string
      bookId: string
      musicId: string
      movieId: string
      createdAt: number
    }>,
  ) => {
    for (const row of rows) {
      insert.run(
        row.id,
        row.theme,
        row.bookId,
        row.musicId,
        row.movieId,
        row.createdAt,
      )
    }
  },
)

// Assign sequential timestamps so that record order is preserved for eviction.
// Original JSON has no timestamps, so we use a base time and increment by 1 second.
const baseTime = Math.floor(Date.now() / 1000) - entries.length
const rows = entries.map(([id, params], index) => ({
  id,
  ...params,
  createdAt: baseTime + index,
}))
insertMany(rows)

db.close()
console.log(`Migrated ${entries.length} records to ${dbPath}`)
