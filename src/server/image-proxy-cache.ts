export type CachedImage = {
  data: Uint8Array
  contentType: string
  expiresAt: number
}

export type ImageProxyCacheOptions = {
  /** Cache TTL in milliseconds (default: 24 hours) */
  ttlMs?: number
  /** Maximum number of entries (default: 500) */
  maxEntries?: number
  /** Maximum total cache size in bytes (default: 100MB) */
  maxTotalBytes?: number
}

export type ImageProxyCache = {
  get: (url: string) => CachedImage | undefined
  set: (url: string, data: Uint8Array, contentType: string) => void
  size: () => number
  totalBytes: () => number
  clear: () => void
}

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours
const DEFAULT_MAX_ENTRIES = 500
const DEFAULT_MAX_TOTAL_BYTES = 100 * 1024 * 1024 // 100MB

export function createImageProxyCache(
  options?: ImageProxyCacheOptions,
): ImageProxyCache {
  const ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS
  const maxEntries = options?.maxEntries ?? DEFAULT_MAX_ENTRIES
  const maxTotalBytes = options?.maxTotalBytes ?? DEFAULT_MAX_TOTAL_BYTES

  const store = new Map<string, CachedImage>()
  let currentTotalBytes = 0

  function evictOldest(): void {
    const oldest = store.keys().next().value
    if (oldest !== undefined) {
      const entry = store.get(oldest)
      if (entry) {
        currentTotalBytes -= entry.data.byteLength
      }
      store.delete(oldest)
    }
  }

  return {
    get(url: string): CachedImage | undefined {
      const entry = store.get(url)
      if (!entry) return undefined
      if (Date.now() > entry.expiresAt) {
        currentTotalBytes -= entry.data.byteLength
        store.delete(url)
        return undefined
      }
      // LRU: move to end by re-inserting
      store.delete(url)
      store.set(url, entry)
      return entry
    },

    set(url: string, data: Uint8Array, contentType: string): void {
      // Don't cache entries larger than the total limit
      if (data.byteLength > maxTotalBytes) return

      // Remove existing entry if present
      const existing = store.get(url)
      if (existing) {
        currentTotalBytes -= existing.data.byteLength
        store.delete(url)
      }

      // Evict until we have space
      while (
        store.size >= maxEntries ||
        currentTotalBytes + data.byteLength > maxTotalBytes
      ) {
        if (store.size === 0) break
        evictOldest()
      }

      const entry: CachedImage = {
        data,
        contentType,
        expiresAt: Date.now() + ttlMs,
      }
      store.set(url, entry)
      currentTotalBytes += data.byteLength
    },

    size(): number {
      return store.size
    },

    totalBytes(): number {
      return currentTotalBytes
    },

    clear(): void {
      store.clear()
      currentTotalBytes = 0
    },
  }
}
