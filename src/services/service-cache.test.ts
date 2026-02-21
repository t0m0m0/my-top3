import { describe, it, expect } from 'vitest'
import {
  createServiceCaches,
  EMPTY_SEARCH_RESULT,
  SEARCH_TTL_MS,
  GET_BY_ID_TTL_MS,
  SEARCH_MAX_ENTRIES,
  GET_BY_ID_MAX_ENTRIES,
} from './service-cache'
import type {
  PaginatedResponse,
  Result,
  SearchResultItem,
} from '../types/common'

describe('EMPTY_SEARCH_RESULT', () => {
  it('returns ok with empty items, totalItems 0, startIndex 0', () => {
    expect(EMPTY_SEARCH_RESULT).toEqual({
      ok: true,
      data: { items: [], totalItems: 0, startIndex: 0 },
    })
  })

  it('has the correct shape', () => {
    expect(EMPTY_SEARCH_RESULT.ok).toBe(true)
    if (EMPTY_SEARCH_RESULT.ok) {
      expect(EMPTY_SEARCH_RESULT.data.items).toEqual([])
    }
  })
})

describe('TTL and size constants', () => {
  it('has correct TTL values', () => {
    expect(SEARCH_TTL_MS).toBe(5 * 60 * 1000)
    expect(GET_BY_ID_TTL_MS).toBe(60 * 60 * 1000)
  })

  it('has correct max entries', () => {
    expect(SEARCH_MAX_ENTRIES).toBe(200)
    expect(GET_BY_ID_MAX_ENTRIES).toBe(500)
  })
})

describe('createServiceCaches', () => {
  it('returns searchCache, getByIdCache, and clearCaches', () => {
    const caches = createServiceCaches<
      Result<PaginatedResponse<SearchResultItem>>,
      Result<SearchResultItem>
    >()
    expect(caches).toHaveProperty('searchCache')
    expect(caches).toHaveProperty('getByIdCache')
    expect(caches).toHaveProperty('clearCaches')
  })

  it('searchCache stores and retrieves values', () => {
    const { searchCache } = createServiceCaches<string, string>()
    searchCache.set('key1', 'value1')
    expect(searchCache.get('key1')).toBe('value1')
  })

  it('getByIdCache stores and retrieves values', () => {
    const { getByIdCache } = createServiceCaches<string, string>()
    getByIdCache.set('id1', 'detail1')
    expect(getByIdCache.get('id1')).toBe('detail1')
  })

  it('clearCaches clears both caches', () => {
    const { searchCache, getByIdCache, clearCaches } = createServiceCaches<
      string,
      string
    >()
    searchCache.set('k', 'v')
    getByIdCache.set('k', 'v')
    expect(searchCache.size).toBe(1)
    expect(getByIdCache.size).toBe(1)

    clearCaches()
    expect(searchCache.size).toBe(0)
    expect(getByIdCache.size).toBe(0)
  })

  it('creates independent cache instances per call', () => {
    const a = createServiceCaches<string, string>()
    const b = createServiceCaches<string, string>()
    a.searchCache.set('k', 'a')
    b.searchCache.set('k', 'b')
    expect(a.searchCache.get('k')).toBe('a')
    expect(b.searchCache.get('k')).toBe('b')
  })
})
