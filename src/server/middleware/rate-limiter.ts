import type { MiddlewareHandler } from 'hono'

type RateLimitStore = Map<string, { count: number; resetAt: number }>

export function rateLimiter(options: {
  windowMs: number
  max: number
}): MiddlewareHandler {
  const { windowMs, max } = options
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

  return async (c, next) => {
    const key =
      c.req.header('x-forwarded-for') ?? c.req.header('x-real-ip') ?? 'unknown'
    const now = Date.now()
    const record = store.get(key)

    if (!record || now > record.resetAt) {
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
