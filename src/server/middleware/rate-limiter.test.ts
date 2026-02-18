// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { rateLimiter } from './rate-limiter'

describe('rateLimiter', () => {
  it('allows requests under the limit', async () => {
    const app = new Hono()
    app.use('*', rateLimiter({ windowMs: 60000, max: 5 }))
    app.get('/test', (c) => c.json({ ok: true }))

    const res = await app.request('/test')
    expect(res.status).toBe(200)
    expect(res.headers.get('X-RateLimit-Limit')).toBe('5')
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('4')
  })

  it('returns 429 when limit exceeded', async () => {
    const app = new Hono()
    app.use('*', rateLimiter({ windowMs: 60000, max: 2 }))
    app.get('/test', (c) => c.json({ ok: true }))

    await app.request('/test')
    await app.request('/test')
    const res = await app.request('/test')
    expect(res.status).toBe(429)
    const body = (await res.json()) as Record<string, unknown>
    expect(body.ok).toBe(false)
    expect(res.headers.get('Retry-After')).toBeTruthy()
  })

  it('includes rate limit headers', async () => {
    const app = new Hono()
    app.use('*', rateLimiter({ windowMs: 60000, max: 10 }))
    app.get('/test', (c) => c.json({ ok: true }))

    const res = await app.request('/test')
    expect(res.headers.get('X-RateLimit-Limit')).toBe('10')
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('9')
  })
})

it('evicts oldest entries when store exceeds maxStoreSize', async () => {
  const app = new Hono()
  app.use('*', rateLimiter({ windowMs: 60000, max: 100, maxStoreSize: 3 }))
  app.get('/test', (c) => c.json({ ok: true }))

  // Fill store with 4 different IPs (exceeds maxStoreSize of 3)
  for (let i = 0; i < 4; i++) {
    await app.request('/test', {
      headers: { 'x-forwarded-for': `10.0.0.${i}` },
    })
  }

  // First IP should have been evicted; its counter reset
  const res = await app.request('/test', {
    headers: { 'x-forwarded-for': '10.0.0.0' },
  })
  expect(res.status).toBe(200)
  expect(res.headers.get('X-RateLimit-Remaining')).toBe('99')
})

it('uses first IP from x-forwarded-for when multiple present', async () => {
  const app = new Hono()
  app.use('*', rateLimiter({ windowMs: 60000, max: 2 }))
  app.get('/test', (c) => c.json({ ok: true }))

  // Same real IP with different proxy chains
  await app.request('/test', {
    headers: { 'x-forwarded-for': '1.2.3.4, 10.0.0.1' },
  })
  await app.request('/test', {
    headers: { 'x-forwarded-for': '1.2.3.4, 10.0.0.2' },
  })
  const res = await app.request('/test', {
    headers: { 'x-forwarded-for': '1.2.3.4, 10.0.0.3' },
  })
  expect(res.status).toBe(429)
})
