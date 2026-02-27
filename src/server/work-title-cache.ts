import type { MediaCategory } from '../types/common.ts'

export type WorkInfo = {
  title: string
  category: string
}

type CacheEntry = {
  value: WorkInfo | null
  expiresAt: number
}

export type WorkTitleCacheOptions = {
  /** Cache TTL in milliseconds (default: 6 hours) */
  ttlMs?: number
  /** Maximum number of entries (default: 10,000) */
  maxSize?: number
}

export type WorkTitleCache = {
  get: (category: MediaCategory, id: string) => WorkInfo | null | undefined
  set: (category: MediaCategory, id: string, value: WorkInfo | null) => void
  size: () => number
  clear: () => void
}

const DEFAULT_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours
const DEFAULT_MAX_SIZE = 10_000

function cacheKey(category: MediaCategory, id: string): string {
  return `${category}:${id}`
}

export function createWorkTitleCache(
  options?: WorkTitleCacheOptions,
): WorkTitleCache {
  const ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS
  const maxSize = options?.maxSize ?? DEFAULT_MAX_SIZE

  // Use Map to preserve insertion order for LRU-like eviction
  const store = new Map<string, CacheEntry>()

  return {
    get(category: MediaCategory, id: string): WorkInfo | null | undefined {
      const key = cacheKey(category, id)
      const entry = store.get(key)
      if (!entry) return undefined
      if (Date.now() > entry.expiresAt) {
        store.delete(key)
        return undefined
      }
      return entry.value
    },

    set(category: MediaCategory, id: string, value: WorkInfo | null): void {
      const key = cacheKey(category, id)
      // Delete first to refresh insertion order
      store.delete(key)

      // Evict oldest if at capacity
      if (store.size >= maxSize) {
        const oldest = store.keys().next().value
        if (oldest !== undefined) {
          store.delete(oldest)
        }
      }

      store.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
      })
    },

    size(): number {
      return store.size
    },

    clear(): void {
      store.clear()
    },
  }
}
