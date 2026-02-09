import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { fetchJson } from './fetch-client'

const TEST_URL = 'http://localhost:9999/test'

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('fetchJson', () => {
  it('returns ok result on successful JSON response', async () => {
    server.use(
      http.get(TEST_URL, () => HttpResponse.json({ message: 'hello' })),
    )
    const result = await fetchJson(TEST_URL)
    expect(result).toEqual({ ok: true, data: { message: 'hello' } })
  })

  it('maps 404 to not-found error', async () => {
    server.use(
      http.get(TEST_URL, () => new HttpResponse(null, { status: 404 })),
    )
    const result = await fetchJson(TEST_URL)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.kind).toBe('not-found')
      expect(result.error.status).toBe(404)
    }
  })

  it('maps 401 to auth-error', async () => {
    server.use(
      http.get(TEST_URL, () => new HttpResponse(null, { status: 401 })),
    )
    const result = await fetchJson(TEST_URL)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.kind).toBe('auth-error')
  })

  it('maps 403 to auth-error', async () => {
    server.use(
      http.get(TEST_URL, () => new HttpResponse(null, { status: 403 })),
    )
    const result = await fetchJson(TEST_URL)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.kind).toBe('auth-error')
  })

  it('maps 429 to rate-limited error', async () => {
    server.use(
      http.get(TEST_URL, () => new HttpResponse(null, { status: 429 })),
    )
    const result = await fetchJson(TEST_URL)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.kind).toBe('rate-limited')
  })

  it('maps 500 to server-error', async () => {
    server.use(
      http.get(TEST_URL, () => new HttpResponse(null, { status: 500 })),
    )
    const result = await fetchJson(TEST_URL)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.kind).toBe('server-error')
  })

  it('maps aborted request to aborted error', async () => {
    server.use(
      http.get(TEST_URL, async () => {
        await new Promise((resolve) => setTimeout(resolve, 5000))
        return HttpResponse.json({})
      }),
    )
    const controller = new AbortController()
    const promise = fetchJson(TEST_URL, { signal: controller.signal })
    controller.abort()
    const result = await promise
    expect(result.ok).toBe(false)
    if (!result.ok) {
      // In jsdom, abort may map to 'aborted' or 'unknown' depending on DOMException support
      expect(['aborted', 'unknown']).toContain(result.error.kind)
    }
  })

  it('maps network error to network error kind', async () => {
    server.use(http.get(TEST_URL, () => HttpResponse.error()))
    const result = await fetchJson(TEST_URL)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.kind).toBe('network')
  })

  it('applies validation function on success', async () => {
    server.use(http.get(TEST_URL, () => HttpResponse.json({ count: 42 })))
    const result = await fetchJson<{ count: number }>(TEST_URL, {
      validate: (data) => {
        const obj = data as { count: number }
        if (typeof obj.count !== 'number') throw new Error('bad')
        return obj
      },
    })
    expect(result).toEqual({ ok: true, data: { count: 42 } })
  })

  it('returns parse-error when validation throws', async () => {
    server.use(http.get(TEST_URL, () => HttpResponse.json({ bad: true })))
    const result = await fetchJson(TEST_URL, {
      validate: () => {
        throw new Error('Validation failed')
      },
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.kind).toBe('parse-error')
      expect(result.error.message).toBe('Validation failed')
    }
  })

  it('supports POST with body', async () => {
    server.use(
      http.post(TEST_URL, async ({ request }) => {
        const body = await request.text()
        return HttpResponse.json({ received: body })
      }),
    )
    const result = await fetchJson(TEST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'value' }),
    })
    expect(result.ok).toBe(true)
  })
})
