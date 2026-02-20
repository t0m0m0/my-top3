type CacheEntry<T> = {
  value: T
  expiresAt: number
}

export class TtlCache<T> {
  private readonly ttlMs: number
  private readonly maxEntries: number
  private readonly map = new Map<string, CacheEntry<T>>()

  constructor(options: { ttlMs: number; maxEntries: number }) {
    this.ttlMs = options.ttlMs
    this.maxEntries = options.maxEntries
  }

  get(key: string): T | undefined {
    const entry = this.map.get(key)
    if (!entry) return undefined

    if (Date.now() >= entry.expiresAt) {
      this.map.delete(key)
      return undefined
    }

    // Move to end so it becomes the most recently used
    this.map.delete(key)
    this.map.set(key, entry)

    return entry.value
  }

  set(key: string, value: T): void {
    // Delete first so re-insertion moves it to the end (Map insertion order)
    this.map.delete(key)

    if (this.map.size >= this.maxEntries) {
      // Evict the oldest entry (first key in Map iteration order)
      const oldest = this.map.keys().next()
      if (!oldest.done) {
        this.map.delete(oldest.value)
      }
    }

    this.map.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    })
  }

  clear(): void {
    this.map.clear()
  }

  get size(): number {
    return this.map.size
  }
}
