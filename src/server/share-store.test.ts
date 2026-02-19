import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
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
    expect(result).toEqual(sampleParams)
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
    expect(store2.get(id)).toEqual(sampleParams)
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
    expect(store.get(id)).toEqual(sampleParams)
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
})
