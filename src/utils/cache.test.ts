import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TtlCache } from './cache.ts'

describe('TtlCache', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns undefined for cache miss', () => {
    const cache = new TtlCache<string>({ ttlMs: 60_000, maxEntries: 100 })
    expect(cache.get('missing')).toBeUndefined()
  })

  it('returns cached value on hit', () => {
    const cache = new TtlCache<string>({ ttlMs: 60_000, maxEntries: 100 })
    cache.set('key1', 'value1')
    expect(cache.get('key1')).toBe('value1')
  })

  it('returns undefined after TTL expires', () => {
    const cache = new TtlCache<string>({ ttlMs: 5_000, maxEntries: 100 })
    cache.set('key1', 'value1')

    vi.advanceTimersByTime(4_999)
    expect(cache.get('key1')).toBe('value1')

    vi.advanceTimersByTime(1)
    expect(cache.get('key1')).toBeUndefined()
  })

  it('evicts oldest entry when maxEntries is exceeded', () => {
    const cache = new TtlCache<string>({ ttlMs: 60_000, maxEntries: 2 })
    cache.set('a', '1')
    cache.set('b', '2')
    cache.set('c', '3') // should evict 'a'

    expect(cache.get('a')).toBeUndefined()
    expect(cache.get('b')).toBe('2')
    expect(cache.get('c')).toBe('3')
  })

  it('get() promotes entry to most recently used (LRU)', () => {
    const cache = new TtlCache<string>({ ttlMs: 60_000, maxEntries: 2 })
    cache.set('a', '1')
    cache.set('b', '2')
    cache.get('a') // promote 'a' to most recently used
    cache.set('c', '3') // should evict 'b' (now oldest), not 'a'

    expect(cache.get('a')).toBe('1')
    expect(cache.get('b')).toBeUndefined()
    expect(cache.get('c')).toBe('3')
  })

  it('reports size correctly', () => {
    const cache = new TtlCache<string>({ ttlMs: 60_000, maxEntries: 100 })
    expect(cache.size).toBe(0)
    cache.set('a', '1')
    cache.set('b', '2')
    expect(cache.size).toBe(2)
  })

  it('overwrites existing key and resets TTL', () => {
    const cache = new TtlCache<string>({ ttlMs: 5_000, maxEntries: 100 })
    cache.set('key1', 'old')

    vi.advanceTimersByTime(3_000)
    cache.set('key1', 'new')

    vi.advanceTimersByTime(3_000)
    // Would be expired if TTL wasn't reset
    expect(cache.get('key1')).toBe('new')
  })

  it('clear removes all entries', () => {
    const cache = new TtlCache<string>({ ttlMs: 60_000, maxEntries: 100 })
    cache.set('a', '1')
    cache.set('b', '2')
    cache.clear()
    expect(cache.size).toBe(0)
    expect(cache.get('a')).toBeUndefined()
  })

  it('expired entries are cleaned up on get', () => {
    const cache = new TtlCache<string>({ ttlMs: 1_000, maxEntries: 100 })
    cache.set('a', '1')
    vi.advanceTimersByTime(1_001)
    cache.get('a') // triggers cleanup
    expect(cache.size).toBe(0)
  })

  it('handles non-string values (objects)', () => {
    const cache = new TtlCache<{ name: string }>({
      ttlMs: 60_000,
      maxEntries: 100,
    })
    const obj = { name: 'test' }
    cache.set('key', obj)
    expect(cache.get('key')).toBe(obj)
  })
})
