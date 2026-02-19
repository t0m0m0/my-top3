import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { createShareStore, type ShareParams } from './share-store'

describe('share-store', () => {
  let tmpDir: string
  let filePath: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'share-store-'))
    filePath = path.join(tmpDir, 'shares.json')
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
    const store = createShareStore(filePath)
    const id = store.save(sampleParams)
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThanOrEqual(6)
    expect(id.length).toBeLessThanOrEqual(12)
  })

  it('get returns saved params by id', () => {
    const store = createShareStore(filePath)
    const id = store.save(sampleParams)
    const result = store.get(id)
    expect(result).toEqual(sampleParams)
  })

  it('get returns null for unknown id', () => {
    const store = createShareStore(filePath)
    expect(store.get('nonexistent')).toBeNull()
  })

  it('persists data to file and survives reload', () => {
    const store1 = createShareStore(filePath)
    const id = store1.save(sampleParams)

    // Create a new store instance from the same file
    const store2 = createShareStore(filePath)
    expect(store2.get(id)).toEqual(sampleParams)
  })

  it('generates unique ids for different saves', () => {
    const store = createShareStore(filePath)
    const id1 = store.save(sampleParams)
    const id2 = store.save({ ...sampleParams, theme: '別のテーマ' })
    expect(id1).not.toBe(id2)
  })

  it('works when file does not exist yet', () => {
    const newPath = path.join(tmpDir, 'subdir', 'shares.json')
    const store = createShareStore(newPath)
    const id = store.save(sampleParams)
    expect(store.get(id)).toEqual(sampleParams)
  })

  it('id contains only url-safe characters', () => {
    const store = createShareStore(filePath)
    const id = store.save(sampleParams)
    expect(id).toMatch(/^[A-Za-z0-9_-]+$/)
  })
})
