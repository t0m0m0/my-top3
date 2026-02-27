// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  createWorkTitleCache,
  type WorkTitleCache,
} from './work-title-cache.ts'

describe('WorkTitleCache', () => {
  let cache: WorkTitleCache

  beforeEach(() => {
    vi.useFakeTimers()
    cache = createWorkTitleCache({ ttlMs: 60_000, maxSize: 100 })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns undefined for a cache miss', () => {
    expect(cache.get('book', 'id1')).toBeUndefined()
  })

  it('returns cached value after set', () => {
    const info = { title: '1Q84', category: '📚 本' }
    cache.set('book', 'id1', info)
    expect(cache.get('book', 'id1')).toEqual(info)
  })

  it('returns undefined after TTL expires', () => {
    const info = { title: '1Q84', category: '📚 本' }
    cache.set('book', 'id1', info)

    vi.advanceTimersByTime(60_001)

    expect(cache.get('book', 'id1')).toBeUndefined()
  })

  it('returns value before TTL expires', () => {
    const info = { title: '1Q84', category: '📚 本' }
    cache.set('book', 'id1', info)

    vi.advanceTimersByTime(59_999)

    expect(cache.get('book', 'id1')).toEqual(info)
  })

  it('caches null (negative cache)', () => {
    cache.set('book', 'bad-id', null)
    expect(cache.get('book', 'bad-id')).toBeNull()
  })

  it('distinguishes different categories with the same id', () => {
    cache.set('book', 'id1', { title: 'Book', category: '📚 本' })
    cache.set('music', 'id1', { title: 'Music', category: '🎵 音楽' })

    expect(cache.get('book', 'id1')?.title).toBe('Book')
    expect(cache.get('music', 'id1')?.title).toBe('Music')
  })

  it('evicts oldest entries when maxSize is exceeded', () => {
    const smallCache = createWorkTitleCache({ ttlMs: 60_000, maxSize: 3 })

    smallCache.set('book', 'id1', { title: 'A', category: '📚 本' })
    smallCache.set('book', 'id2', { title: 'B', category: '📚 本' })
    smallCache.set('book', 'id3', { title: 'C', category: '📚 本' })
    smallCache.set('book', 'id4', { title: 'D', category: '📚 本' })

    // id1 should be evicted
    expect(smallCache.get('book', 'id1')).toBeUndefined()
    // id4 should exist
    expect(smallCache.get('book', 'id4')?.title).toBe('D')
  })

  it('returns correct size', () => {
    cache.set('book', 'id1', { title: 'A', category: '📚 本' })
    cache.set('music', 'id2', { title: 'B', category: '🎵 音楽' })
    expect(cache.size()).toBe(2)
  })

  it('clear removes all entries', () => {
    cache.set('book', 'id1', { title: 'A', category: '📚 本' })
    cache.set('music', 'id2', { title: 'B', category: '🎵 音楽' })
    cache.clear()
    expect(cache.size()).toBe(0)
    expect(cache.get('book', 'id1')).toBeUndefined()
  })

  it('setWithTtl uses custom TTL instead of default', () => {
    // Default TTL is 60_000, set with custom 10_000
    cache.setWithTtl(
      'book',
      'id1',
      { title: 'Short', category: '📚 本' },
      10_000,
    )

    vi.advanceTimersByTime(9_999)
    expect(cache.get('book', 'id1')?.title).toBe('Short')

    vi.advanceTimersByTime(2)
    expect(cache.get('book', 'id1')).toBeUndefined()
  })
})
