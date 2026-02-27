import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import Database from 'better-sqlite3'
import { createShareStore, type ShareParams } from './share-store'

describe('share-store', () => {
  let tmpDir: string
  let dbPath: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'share-store-'))
    dbPath = path.join(tmpDir, 'shares.db')
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  const sampleParams: ShareParams = {
    theme: '好きな夏の思い出',
    bookId: 'abc123',
    musicId: 'def456',
    movieId: 'ghi789',
  }

  const sampleParamsWithDefaults = {
    ...sampleParams,
    bookThumb: '',
    musicThumb: '',
    movieThumb: '',
    tags: [] as string[],
  }

  it('save returns a short id string', () => {
    const store = createShareStore(dbPath)
    const id = store.save(sampleParams)
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThanOrEqual(6)
    expect(id.length).toBeLessThanOrEqual(12)
    store.close()
  })

  it('get returns saved params by id', () => {
    const store = createShareStore(dbPath)
    const id = store.save(sampleParams)
    const result = store.get(id)
    expect(result).toEqual(sampleParamsWithDefaults)
    store.close()
  })

  it('get returns null for unknown id', () => {
    const store = createShareStore(dbPath)
    expect(store.get('nonexistent')).toBeNull()
    store.close()
  })

  it('persists data to file and survives reload', () => {
    const store1 = createShareStore(dbPath)
    const id = store1.save(sampleParams)
    store1.close()

    // Create a new store instance from the same file
    const store2 = createShareStore(dbPath)
    expect(store2.get(id)).toEqual(sampleParamsWithDefaults)
    store2.close()
  })

  it('generates unique ids for different saves', () => {
    const store = createShareStore(dbPath)
    const id1 = store.save(sampleParams)
    const id2 = store.save({ ...sampleParams, theme: '別のテーマ' })
    expect(id1).not.toBe(id2)
    store.close()
  })

  it('works when directory does not exist yet', () => {
    const newPath = path.join(tmpDir, 'subdir', 'shares.db')
    const store = createShareStore(newPath)
    const id = store.save(sampleParams)
    expect(store.get(id)).toEqual(sampleParamsWithDefaults)
    store.close()
  })

  it('id contains only url-safe characters', () => {
    const store = createShareStore(dbPath)
    const id = store.save(sampleParams)
    expect(id).toMatch(/^[A-Za-z0-9_-]+$/)
    store.close()
  })

  describe('record limit', () => {
    it('evicts oldest records when exceeding maxRecords', () => {
      const store = createShareStore(dbPath, { maxRecords: 3 })
      const id1 = store.save({ ...sampleParams, theme: 'first' })
      store.save({ ...sampleParams, theme: 'second' })
      store.save({ ...sampleParams, theme: 'third' })

      // id1 should still exist
      expect(store.get(id1)).not.toBeNull()

      // Adding a 4th should evict the oldest (id1)
      store.save({ ...sampleParams, theme: 'fourth' })
      expect(store.get(id1)).toBeNull()
      store.close()
    })
  })

  describe('idempotency', () => {
    it('returns the same id for identical params', () => {
      const store = createShareStore(dbPath)
      const id1 = store.save(sampleParams)
      const id2 = store.save(sampleParams)
      expect(id1).toBe(id2)
      store.close()
    })

    it('returns different ids for different params', () => {
      const store = createShareStore(dbPath)
      const id1 = store.save(sampleParams)
      const id2 = store.save({ ...sampleParams, theme: '別のテーマ' })
      expect(id1).not.toBe(id2)
      store.close()
    })

    it('returns different ids when only one field differs', () => {
      const store = createShareStore(dbPath)
      const id1 = store.save(sampleParams)
      const id2 = store.save({ ...sampleParams, bookId: 'different' })
      expect(id1).not.toBe(id2)
      store.close()
    })
  })

  describe('save with thumbnails', () => {
    it('stores and retrieves thumbnail URLs', () => {
      const store = createShareStore(dbPath)
      const params = {
        ...sampleParams,
        bookThumb: 'https://example.com/book.jpg',
        musicThumb: 'https://example.com/music.jpg',
        movieThumb: 'https://example.com/movie.jpg',
      }
      const id = store.save(params)
      const result = store.get(id)
      expect(result).toEqual({ ...params, tags: [] })
      store.close()
    })

    it('updates thumbnails on existing record when previously empty', () => {
      const store = createShareStore(dbPath)
      // First save without thumbnails
      const id1 = store.save(sampleParams)
      const result1 = store.get(id1)!
      expect(result1.bookThumb).toBe('')
      expect(result1.musicThumb).toBe('')
      expect(result1.movieThumb).toBe('')

      // Second save with same params but with thumbnails
      const id2 = store.save({
        ...sampleParams,
        bookThumb: 'https://example.com/book.jpg',
        musicThumb: 'https://example.com/music.jpg',
        movieThumb: 'https://example.com/movie.jpg',
      })

      // Should return the same id (idempotent)
      expect(id2).toBe(id1)

      // Thumbnails should now be updated
      const result2 = store.get(id2)!
      expect(result2.bookThumb).toBe('https://example.com/book.jpg')
      expect(result2.musicThumb).toBe('https://example.com/music.jpg')
      expect(result2.movieThumb).toBe('https://example.com/movie.jpg')
      store.close()
    })

    it('does not overwrite existing thumbnails with empty strings', () => {
      const store = createShareStore(dbPath)
      // Save with thumbnails
      const id1 = store.save({
        ...sampleParams,
        bookThumb: 'https://example.com/book.jpg',
        musicThumb: 'https://example.com/music.jpg',
        movieThumb: 'https://example.com/movie.jpg',
      })

      // Save again without thumbnails
      const id2 = store.save(sampleParams)
      expect(id2).toBe(id1)

      // Original thumbnails should be preserved
      const result = store.get(id2)!
      expect(result.bookThumb).toBe('https://example.com/book.jpg')
      expect(result.musicThumb).toBe('https://example.com/music.jpg')
      expect(result.movieThumb).toBe('https://example.com/movie.jpg')
      store.close()
    })

    it('defaults thumbnails to empty string when not provided', () => {
      const store = createShareStore(dbPath)
      const id = store.save(sampleParams)
      const result = store.get(id)!
      expect(result.bookThumb).toBe('')
      expect(result.musicThumb).toBe('')
      expect(result.movieThumb).toBe('')
      store.close()
    })
  })

  describe('list', () => {
    it('returns shares in newest-first order', () => {
      const store = createShareStore(dbPath)
      store.save({ ...sampleParams, theme: 'first' })
      store.save({ ...sampleParams, theme: 'second' })
      store.save({ ...sampleParams, theme: 'third' })
      const result = store.list({ limit: 10, offset: 0 })
      expect(result.items).toHaveLength(3)
      expect(result.items[0]!.theme).toBe('third')
      expect(result.items[1]!.theme).toBe('second')
      expect(result.items[2]!.theme).toBe('first')
      expect(result.total).toBe(3)
      store.close()
    })

    it('respects limit and offset for pagination', () => {
      const store = createShareStore(dbPath)
      store.save({ ...sampleParams, theme: 'a' })
      store.save({ ...sampleParams, theme: 'b' })
      store.save({ ...sampleParams, theme: 'c' })
      store.save({ ...sampleParams, theme: 'd' })

      const page1 = store.list({ limit: 2, offset: 0 })
      expect(page1.items).toHaveLength(2)
      expect(page1.items[0]!.theme).toBe('d')
      expect(page1.items[1]!.theme).toBe('c')
      expect(page1.total).toBe(4)

      const page2 = store.list({ limit: 2, offset: 2 })
      expect(page2.items).toHaveLength(2)
      expect(page2.items[0]!.theme).toBe('b')
      expect(page2.items[1]!.theme).toBe('a')
      expect(page2.total).toBe(4)
      store.close()
    })

    it('returns empty array when no shares exist', () => {
      const store = createShareStore(dbPath)
      const result = store.list({ limit: 10, offset: 0 })
      expect(result.items).toHaveLength(0)
      expect(result.total).toBe(0)
      store.close()
    })

    it('each item includes id, created_at, and thumbnails', () => {
      const store = createShareStore(dbPath)
      store.save({
        ...sampleParams,
        bookThumb: 'https://example.com/book.jpg',
        musicThumb: 'https://example.com/music.jpg',
        movieThumb: 'https://example.com/movie.jpg',
      })
      const result = store.list({ limit: 10, offset: 0 })
      const item = result.items[0]!
      expect(item.id).toBeDefined()
      expect(typeof item.id).toBe('string')
      expect(item.createdAt).toBeDefined()
      expect(typeof item.createdAt).toBe('number')
      expect(item.bookThumb).toBe('https://example.com/book.jpg')
      expect(item.musicThumb).toBe('https://example.com/music.jpg')
      expect(item.movieThumb).toBe('https://example.com/movie.jpg')
      store.close()
    })

    it('returns fewer items when offset exceeds total', () => {
      const store = createShareStore(dbPath)
      store.save(sampleParams)
      const result = store.list({ limit: 10, offset: 100 })
      expect(result.items).toHaveLength(0)
      expect(result.total).toBe(1)
      store.close()
    })
  })

  describe('TTL expiration', () => {
    it('get returns null for expired records', () => {
      const store = createShareStore(dbPath, { ttlSeconds: 60 })
      const id = store.save(sampleParams)

      // Manually backdate the record to simulate expiration
      const db = new Database(dbPath)
      db.prepare('UPDATE shares SET created_at = created_at - 120').run()
      db.close()

      expect(store.get(id)).toBeNull()
      store.close()
    })

    it('list excludes expired records', () => {
      const store = createShareStore(dbPath, { ttlSeconds: 60 })
      store.save({ ...sampleParams, theme: 'old' })

      // Backdate the first record
      const db = new Database(dbPath)
      db.prepare(
        "UPDATE shares SET created_at = created_at - 120 WHERE theme = 'old'",
      ).run()
      db.close()

      store.save({ ...sampleParams, theme: 'new' })

      const result = store.list({ limit: 10, offset: 0 })
      expect(result.items).toHaveLength(1)
      expect(result.items[0]!.theme).toBe('new')
      expect(result.total).toBe(1)
      store.close()
    })

    it('purgeExpired removes expired records and returns count', () => {
      const store = createShareStore(dbPath, { ttlSeconds: 60 })
      store.save({ ...sampleParams, theme: 'old1' })
      store.save({ ...sampleParams, theme: 'old2' })

      const db = new Database(dbPath)
      db.prepare('UPDATE shares SET created_at = created_at - 120').run()
      db.close()

      store.save({ ...sampleParams, theme: 'fresh' })

      const purged = store.purgeExpired()
      expect(purged).toBe(2)

      const result = store.list({ limit: 10, offset: 0 })
      expect(result.items).toHaveLength(1)
      expect(result.items[0]!.theme).toBe('fresh')
      store.close()
    })

    it('defaults to no TTL when ttlSeconds is not set', () => {
      const store = createShareStore(dbPath)
      const id = store.save(sampleParams)

      // Backdate by a large amount
      const db = new Database(dbPath)
      db.prepare('UPDATE shares SET created_at = created_at - 999999').run()
      db.close()

      // Should still be retrievable (no TTL)
      expect(store.get(id)).not.toBeNull()
      store.close()
    })
  })

  describe('delete', () => {
    it('deletes a record by id and returns true', () => {
      const store = createShareStore(dbPath)
      const id = store.save(sampleParams)
      expect(store.delete(id)).toBe(true)
      expect(store.get(id)).toBeNull()
      store.close()
    })

    it('returns false when id does not exist', () => {
      const store = createShareStore(dbPath)
      expect(store.delete('nonexistent')).toBe(false)
      store.close()
    })

    it('rejects invalid ids', () => {
      const store = createShareStore(dbPath)
      expect(store.delete('')).toBe(false)
      expect(store.delete('a'.repeat(20))).toBe(false)
      store.close()
    })
  })

  describe('input validation', () => {
    it('rejects bookId exceeding max length', () => {
      const store = createShareStore(dbPath)
      const longId = 'a'.repeat(101)
      expect(() =>
        store.save({ ...sampleParams, bookId: longId }),
      ).toThrowError(/bookId/)
      store.close()
    })

    it('rejects musicId exceeding max length', () => {
      const store = createShareStore(dbPath)
      const longId = 'a'.repeat(101)
      expect(() =>
        store.save({ ...sampleParams, musicId: longId }),
      ).toThrowError(/musicId/)
      store.close()
    })

    it('rejects movieId exceeding max length', () => {
      const store = createShareStore(dbPath)
      const longId = 'a'.repeat(101)
      expect(() =>
        store.save({ ...sampleParams, movieId: longId }),
      ).toThrowError(/movieId/)
      store.close()
    })

    it('rejects theme exceeding max length', () => {
      const store = createShareStore(dbPath)
      const longTheme = 'あ'.repeat(51)
      expect(() =>
        store.save({ ...sampleParams, theme: longTheme }),
      ).toThrowError(/theme/)
      store.close()
    })

    it('rejects IDs containing control characters', () => {
      const store = createShareStore(dbPath)
      expect(() =>
        store.save({ ...sampleParams, bookId: 'abc\x00def' }),
      ).toThrowError(/bookId/)
      store.close()
    })
  })

  describe('tags', () => {
    it('save stores tags and get returns them', () => {
      const store = createShareStore(dbPath)
      const id = store.save({ ...sampleParams, tags: ['summer', 'nostalgia'] })
      const result = store.get(id)!
      expect(result.tags).toEqual(['summer', 'nostalgia'])
      store.close()
    })

    it('get returns empty array when no tags', () => {
      const store = createShareStore(dbPath)
      const id = store.save(sampleParams)
      const result = store.get(id)!
      expect(result.tags).toEqual([])
      store.close()
    })

    it('list returns tags for each item', () => {
      const store = createShareStore(dbPath)
      store.save({ ...sampleParams, theme: 'tagged', tags: ['rock', 'jazz'] })
      store.save({ ...sampleParams, theme: 'untagged' })
      const result = store.list({ limit: 10, offset: 0 })
      const tagged = result.items.find((i) => i.theme === 'tagged')!
      const untagged = result.items.find((i) => i.theme === 'untagged')!
      expect(tagged.tags).toEqual(['rock', 'jazz'])
      expect(untagged.tags).toEqual([])
      store.close()
    })

    it('list filters by tag when tag option is provided', () => {
      const store = createShareStore(dbPath)
      store.save({ ...sampleParams, theme: 'a', tags: ['rock', 'jazz'] })
      store.save({ ...sampleParams, theme: 'b', tags: ['pop'] })
      store.save({ ...sampleParams, theme: 'c', tags: ['rock'] })

      const result = store.list({ limit: 10, offset: 0, tag: 'rock' })
      expect(result.items).toHaveLength(2)
      expect(result.total).toBe(2)
      const themes = result.items.map((i) => i.theme)
      expect(themes).toContain('a')
      expect(themes).toContain('c')
      store.close()
    })

    it('list with tag filter returns correct total for pagination', () => {
      const store = createShareStore(dbPath)
      store.save({ ...sampleParams, theme: 'a', tags: ['rock'] })
      store.save({ ...sampleParams, theme: 'b', tags: ['rock'] })
      store.save({ ...sampleParams, theme: 'c', tags: ['rock'] })
      store.save({ ...sampleParams, theme: 'd', tags: ['pop'] })

      const page = store.list({ limit: 2, offset: 0, tag: 'rock' })
      expect(page.items).toHaveLength(2)
      expect(page.total).toBe(3)
      store.close()
    })

    it('list with tag filter that matches nothing returns empty', () => {
      const store = createShareStore(dbPath)
      store.save({ ...sampleParams, tags: ['rock'] })
      const result = store.list({ limit: 10, offset: 0, tag: 'classical' })
      expect(result.items).toHaveLength(0)
      expect(result.total).toBe(0)
      store.close()
    })

    it('delete removes associated tags', () => {
      const store = createShareStore(dbPath)
      const id = store.save({ ...sampleParams, tags: ['rock', 'jazz'] })
      store.delete(id)

      // Verify tags are gone by checking the DB directly
      const db = new Database(dbPath)
      const rows = db.prepare('SELECT * FROM share_tags WHERE share_id = ?').all(id)
      db.close()
      expect(rows).toHaveLength(0)
      store.close()
    })

    it('rejects more than 5 tags', () => {
      const store = createShareStore(dbPath)
      expect(() =>
        store.save({
          ...sampleParams,
          tags: ['a', 'b', 'c', 'd', 'e', 'f'],
        }),
      ).toThrowError(/tags/)
      store.close()
    })

    it('rejects tags exceeding 20 characters', () => {
      const store = createShareStore(dbPath)
      expect(() =>
        store.save({
          ...sampleParams,
          tags: ['a'.repeat(21)],
        }),
      ).toThrowError(/tag/)
      store.close()
    })

    it('rejects tags containing control characters', () => {
      const store = createShareStore(dbPath)
      expect(() =>
        store.save({
          ...sampleParams,
          tags: ['bad\x00tag'],
        }),
      ).toThrowError(/tag/)
      store.close()
    })

    it('allows exactly 5 tags of 20 chars each', () => {
      const store = createShareStore(dbPath)
      const tags = Array.from({ length: 5 }, (_, i) => String(i).repeat(20).slice(0, 20))
      const id = store.save({ ...sampleParams, tags })
      const result = store.get(id)!
      expect(result.tags).toEqual(tags)
      store.close()
    })

    it('same content with different tags returns same id but updates tags', () => {
      const store = createShareStore(dbPath)
      const id1 = store.save({ ...sampleParams, tags: ['old'] })
      const id2 = store.save({ ...sampleParams, tags: ['new'] })
      expect(id1).toBe(id2)
      // Tags should be updated to the new set
      const result = store.get(id1)!
      expect(result.tags).toEqual(['new'])
      store.close()
    })

    it('deduplicates tags', () => {
      const store = createShareStore(dbPath)
      const id = store.save({ ...sampleParams, tags: ['rock', 'rock', 'jazz'] })
      const result = store.get(id)!
      expect(result.tags).toEqual(['rock', 'jazz'])
      store.close()
    })

    it('tags work with existing data without tags (migration)', () => {
      // Create a store and save without tags
      const store1 = createShareStore(dbPath)
      const id = store1.save(sampleParams)
      store1.close()

      // Reopen — migration should add share_tags table
      const store2 = createShareStore(dbPath)
      const result = store2.get(id)!
      expect(result.tags).toEqual([])
      store2.close()
    })

    it('computeParamsHash does not include tags — same content = same share', () => {
      const store = createShareStore(dbPath)
      const id1 = store.save({ ...sampleParams, tags: ['a'] })
      const id2 = store.save({ ...sampleParams, tags: ['b'] })
      // Same params (sans tags) → same id
      expect(id1).toBe(id2)
      store.close()
    })
  })

  describe('reactions', () => {
    it('addReaction returns count=1 and reacted=true for first reaction', () => {
      const store = createShareStore(dbPath)
      const id = store.save(sampleParams)
      const result = store.addReaction(id, 'client-1')
      expect(result).toEqual({ count: 1, reacted: true })
      store.close()
    })

    it('addReaction is idempotent — same client cannot react twice', () => {
      const store = createShareStore(dbPath)
      const id = store.save(sampleParams)
      store.addReaction(id, 'client-1')
      const result = store.addReaction(id, 'client-1')
      expect(result).toEqual({ count: 1, reacted: true })
      store.close()
    })

    it('multiple clients can react independently', () => {
      const store = createShareStore(dbPath)
      const id = store.save(sampleParams)
      store.addReaction(id, 'client-1')
      const result = store.addReaction(id, 'client-2')
      expect(result).toEqual({ count: 2, reacted: true })
      store.close()
    })

    it('removeReaction decrements count and returns reacted=false', () => {
      const store = createShareStore(dbPath)
      const id = store.save(sampleParams)
      store.addReaction(id, 'client-1')
      store.addReaction(id, 'client-2')
      const result = store.removeReaction(id, 'client-1')
      expect(result).toEqual({ count: 1, reacted: false })
      store.close()
    })

    it('removeReaction is idempotent — no error if not reacted', () => {
      const store = createShareStore(dbPath)
      const id = store.save(sampleParams)
      const result = store.removeReaction(id, 'client-1')
      expect(result).toEqual({ count: 0, reacted: false })
      store.close()
    })

    it('getReactionCount returns 0 for share with no reactions', () => {
      const store = createShareStore(dbPath)
      const id = store.save(sampleParams)
      expect(store.getReactionCount(id)).toBe(0)
      store.close()
    })

    it('getReactionCount returns correct count', () => {
      const store = createShareStore(dbPath)
      const id = store.save(sampleParams)
      store.addReaction(id, 'client-1')
      store.addReaction(id, 'client-2')
      store.addReaction(id, 'client-3')
      expect(store.getReactionCount(id)).toBe(3)
      store.close()
    })

    it('hasReacted returns false when client has not reacted', () => {
      const store = createShareStore(dbPath)
      const id = store.save(sampleParams)
      expect(store.hasReacted(id, 'client-1')).toBe(false)
      store.close()
    })

    it('hasReacted returns true when client has reacted', () => {
      const store = createShareStore(dbPath)
      const id = store.save(sampleParams)
      store.addReaction(id, 'client-1')
      expect(store.hasReacted(id, 'client-1')).toBe(true)
      store.close()
    })

    it('reactions are scoped to specific shares', () => {
      const store = createShareStore(dbPath)
      const id1 = store.save({ ...sampleParams, theme: 'share1' })
      const id2 = store.save({ ...sampleParams, theme: 'share2' })
      store.addReaction(id1, 'client-1')
      expect(store.getReactionCount(id1)).toBe(1)
      expect(store.getReactionCount(id2)).toBe(0)
      store.close()
    })

    it('list includes reactionCount for each item', () => {
      const store = createShareStore(dbPath)
      const id1 = store.save({ ...sampleParams, theme: 'popular' })
      store.save({ ...sampleParams, theme: 'unpopular' })
      store.addReaction(id1, 'client-1')
      store.addReaction(id1, 'client-2')
      const result = store.list({ limit: 10, offset: 0 })
      const popular = result.items.find((i) => i.theme === 'popular')!
      const unpopular = result.items.find((i) => i.theme === 'unpopular')!
      expect(popular.reactionCount).toBe(2)
      expect(unpopular.reactionCount).toBe(0)
      store.close()
    })

    it('deleting a share also deletes its reactions', () => {
      const store = createShareStore(dbPath)
      const id = store.save(sampleParams)
      store.addReaction(id, 'client-1')
      store.delete(id)
      // After deletion, getReactionCount should return 0
      expect(store.getReactionCount(id)).toBe(0)
      store.close()
    })

    it('validates client_id is not empty', () => {
      const store = createShareStore(dbPath)
      const id = store.save(sampleParams)
      expect(() => store.addReaction(id, '')).toThrowError(/client_id/)
      store.close()
    })

    it('validates client_id max length', () => {
      const store = createShareStore(dbPath)
      const id = store.save(sampleParams)
      expect(() => store.addReaction(id, 'a'.repeat(101))).toThrowError(
        /client_id/,
      )
      store.close()
    })
  })
})
