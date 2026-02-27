// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createImageProxyCache } from './image-proxy-cache.ts'

describe('ImageProxyCache', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('stores and retrieves a cached image', () => {
    const cache = createImageProxyCache()
    const data = new Uint8Array([1, 2, 3])
    cache.set('https://example.com/img.jpg', data, 'image/jpeg')

    const result = cache.get('https://example.com/img.jpg')
    expect(result).toBeDefined()
    expect(result!.data).toEqual(data)
    expect(result!.contentType).toBe('image/jpeg')
  })

  it('returns undefined for cache miss', () => {
    const cache = createImageProxyCache()
    expect(cache.get('https://example.com/missing.jpg')).toBeUndefined()
  })

  it('expires entries after TTL', () => {
    const cache = createImageProxyCache({ ttlMs: 1000 })
    const data = new Uint8Array([1, 2, 3])
    cache.set('https://example.com/img.jpg', data, 'image/jpeg')

    // Before expiration
    vi.advanceTimersByTime(999)
    expect(cache.get('https://example.com/img.jpg')).toBeDefined()

    // After expiration
    vi.advanceTimersByTime(2)
    expect(cache.get('https://example.com/img.jpg')).toBeUndefined()
  })

  it('evicts oldest entry when maxEntries is reached', () => {
    const cache = createImageProxyCache({ maxEntries: 2 })
    const data = new Uint8Array([1])

    cache.set('url1', data, 'image/png')
    cache.set('url2', data, 'image/png')
    cache.set('url3', data, 'image/png') // should evict url1

    expect(cache.get('url1')).toBeUndefined()
    expect(cache.get('url2')).toBeDefined()
    expect(cache.get('url3')).toBeDefined()
    expect(cache.size()).toBe(2)
  })

  it('evicts entries when maxTotalBytes is exceeded', () => {
    const cache = createImageProxyCache({ maxTotalBytes: 10, maxEntries: 100 })

    cache.set('url1', new Uint8Array(5), 'image/png')
    cache.set('url2', new Uint8Array(5), 'image/png')
    expect(cache.size()).toBe(2)
    expect(cache.totalBytes()).toBe(10)

    // Adding 6 bytes: 5+5+6=16 > 10, so url1 and url2 both get evicted
    cache.set('url3', new Uint8Array(6), 'image/png')
    expect(cache.get('url1')).toBeUndefined()
    expect(cache.get('url2')).toBeUndefined()
    expect(cache.size()).toBe(1)
    expect(cache.totalBytes()).toBe(6)
  })

  it('skips caching entries larger than maxTotalBytes', () => {
    const cache = createImageProxyCache({ maxTotalBytes: 10 })
    cache.set('url1', new Uint8Array(11), 'image/png')
    expect(cache.size()).toBe(0)
    expect(cache.totalBytes()).toBe(0)
  })

  it('updates existing entry with same URL', () => {
    const cache = createImageProxyCache()
    cache.set('url1', new Uint8Array([1, 2, 3]), 'image/jpeg')
    cache.set('url1', new Uint8Array([4, 5]), 'image/png')

    expect(cache.size()).toBe(1)
    const result = cache.get('url1')
    expect(result!.data).toEqual(new Uint8Array([4, 5]))
    expect(result!.contentType).toBe('image/png')
  })

  it('LRU: accessing an entry moves it to the end (prevents eviction)', () => {
    const cache = createImageProxyCache({ maxEntries: 2 })
    const data = new Uint8Array([1])

    cache.set('url1', data, 'image/png')
    cache.set('url2', data, 'image/png')

    // Access url1 to make it recent
    cache.get('url1')

    // Adding url3 should evict url2 (oldest), not url1
    cache.set('url3', data, 'image/png')
    expect(cache.get('url1')).toBeDefined()
    expect(cache.get('url2')).toBeUndefined()
    expect(cache.get('url3')).toBeDefined()
  })

  it('tracks totalBytes correctly through set/evict/clear', () => {
    const cache = createImageProxyCache({ maxEntries: 100 })
    cache.set('url1', new Uint8Array(100), 'image/png')
    cache.set('url2', new Uint8Array(200), 'image/png')
    expect(cache.totalBytes()).toBe(300)

    cache.clear()
    expect(cache.totalBytes()).toBe(0)
    expect(cache.size()).toBe(0)
  })

  it('decrements totalBytes when expired entry is accessed', () => {
    const cache = createImageProxyCache({ ttlMs: 1000 })
    cache.set('url1', new Uint8Array(100), 'image/png')
    expect(cache.totalBytes()).toBe(100)

    vi.advanceTimersByTime(1001)
    cache.get('url1') // triggers eviction of expired entry
    expect(cache.totalBytes()).toBe(0)
  })
})
