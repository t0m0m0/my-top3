import type { MiddlewareHandler } from 'hono'

type RateLimitEntry = { count: number; resetAt: number }
type RateLimitStore = Map<string, RateLimitEntry>

const DEFAULT_MAX_STORE_SIZE = 10000

/**
 * In-memory rate limiter middleware.
 *
 * ## IP取得について
 * - `x-forwarded-for` ヘッダの最初のIPを使用（リバースプロキシ経由のクライアントIP）
 * - フォールバック: `x-real-ip` ヘッダ → 'unknown'
 * - 信頼できるリバースプロキシ（Cloudflare, nginx等）の背後で動作することを前提
 * - プロキシなしで直接公開する場合、ヘッダー偽装によるバイパスのリスクあり
 *
 * ## Storeサイズ制限
 * - `maxStoreSize` でMapの上限を設定（デフォルト: 10,000）
 * - 上限超過時は最も古いエントリを削除（FIFO）
 */
export function rateLimiter(options: {
  windowMs: number
  max: number
  maxStoreSize?: number
}): MiddlewareHandler {
  const { windowMs, max, maxStoreSize = DEFAULT_MAX_STORE_SIZE } = options
  const store: RateLimitStore = new Map()

  // Clean up expired entries periodically
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of store) {
      if (now > value.resetAt) {
        store.delete(key)
      }
    }
  }, windowMs).unref?.()

  function getClientIp(c: Parameters<MiddlewareHandler>[0]): string {
    const forwarded = c.req.header('x-forwarded-for')
    if (forwarded) {
      // Take the first IP (client IP set by the trusted proxy)
      return forwarded.split(',')[0].trim()
    }
    return c.req.header('x-real-ip') ?? 'unknown'
  }

  function evictIfNeeded(): void {
    while (store.size >= maxStoreSize) {
      // Map iterates in insertion order; delete the oldest
      const oldest = store.keys().next().value
      if (oldest !== undefined) {
        store.delete(oldest)
      } else {
        break
      }
    }
  }

  return async (c, next) => {
    const key = getClientIp(c)
    const now = Date.now()
    const record = store.get(key)

    if (!record || now > record.resetAt) {
      evictIfNeeded()
      store.set(key, { count: 1, resetAt: now + windowMs })
      c.header('X-RateLimit-Limit', String(max))
      c.header('X-RateLimit-Remaining', String(max - 1))
      await next()
      return
    }

    record.count++
    const remaining = Math.max(0, max - record.count)
    c.header('X-RateLimit-Limit', String(max))
    c.header('X-RateLimit-Remaining', String(remaining))

    if (record.count > max) {
      c.header('Retry-After', String(Math.ceil((record.resetAt - now) / 1000)))
      return c.json(
        {
          ok: false,
          error: { kind: 'rate-limited', message: 'Too many requests' },
        },
        429,
      )
    }

    await next()
  }
}
