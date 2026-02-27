// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createImageProxyApp, ALLOWED_HOSTS } from './image-proxy.ts'
import { createImageProxyCache } from '../image-proxy-cache.ts'

type ErrorResponse = { ok: false; error: { kind: string; message: string } }

// Mock global fetch
const originalFetch = globalThis.fetch

function makeApp() {
  const cache = createImageProxyCache()
  const app = createImageProxyApp(cache)
  return { app, cache }
}

beforeEach(() => {
  vi.restoreAllMocks()
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('image-proxy route', () => {
  describe('GET /proxy', () => {
    it('returns 400 when url query parameter is missing', async () => {
      const { app } = makeApp()
      const res = await app.request('/proxy')
      expect(res.status).toBe(400)
      const json = (await res.json()) as ErrorResponse
      expect(json.ok).toBe(false)
      expect(json.error.message).toMatch(/url/i)
    })

    it('returns 400 when url is not a valid URL', async () => {
      const { app } = makeApp()
      const res = await app.request('/proxy?url=not-a-url')
      expect(res.status).toBe(400)
      const json = (await res.json()) as ErrorResponse
      expect(json.ok).toBe(false)
    })

    it('returns 403 when host is not in allowlist', async () => {
      const { app } = makeApp()
      const res = await app.request(
        '/proxy?url=https://evil.example.com/image.jpg',
      )
      expect(res.status).toBe(403)
      const json = (await res.json()) as ErrorResponse
      expect(json.ok).toBe(false)
      expect(json.error.message).toMatch(/許可/)
    })

    it('proxies image from allowed Google Books host', async () => {
      const { app } = makeApp()
      const imageData = new Uint8Array([137, 80, 78, 71]) // PNG magic bytes
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(imageData, {
          status: 200,
          headers: {
            'Content-Type': 'image/jpeg',
            'Content-Length': '4',
          },
        }),
      )

      const url = 'https://books.google.com/books/content?id=abc&img=1'
      const res = await app.request(`/proxy?url=${encodeURIComponent(url)}`)

      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toBe('image/jpeg')
      expect(res.headers.get('Cache-Control')).toMatch(/max-age/)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })

    it('proxies image from allowed Last.fm CDN host', async () => {
      const { app } = makeApp()
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(new Uint8Array([0xff, 0xd8]), {
          status: 200,
          headers: { 'Content-Type': 'image/jpeg' },
        }),
      )

      const url = 'https://lastfm.freetls.fastly.net/image/abc123'
      const res = await app.request(`/proxy?url=${encodeURIComponent(url)}`)

      expect(res.status).toBe(200)
      expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledWith(
        url,
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      )
    })

    it('proxies image from allowed TMDB host', async () => {
      const { app } = makeApp()
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(new Uint8Array([0xff, 0xd8]), {
          status: 200,
          headers: { 'Content-Type': 'image/jpeg' },
        }),
      )

      const url = 'https://image.tmdb.org/t/p/w300/poster.jpg'
      const res = await app.request(`/proxy?url=${encodeURIComponent(url)}`)

      expect(res.status).toBe(200)
    })

    it('returns 502 when upstream returns non-2xx status', async () => {
      const { app } = makeApp()
      globalThis.fetch = vi
        .fn()
        .mockResolvedValue(new Response('Not Found', { status: 404 }))

      const url = 'https://lastfm.freetls.fastly.net/image/missing'
      const res = await app.request(`/proxy?url=${encodeURIComponent(url)}`)

      expect(res.status).toBe(502)
      const json = (await res.json()) as ErrorResponse
      expect(json.ok).toBe(false)
    })

    it('returns 502 when upstream fetch fails', async () => {
      const { app } = makeApp()
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('network error'))

      const url = 'https://lastfm.freetls.fastly.net/image/abc'
      const res = await app.request(`/proxy?url=${encodeURIComponent(url)}`)

      expect(res.status).toBe(502)
    })

    it('returns 403 for non-https URLs', async () => {
      const { app } = makeApp()
      const res = await app.request(
        '/proxy?url=http://lastfm.freetls.fastly.net/image/abc',
      )
      expect(res.status).toBe(403)
    })

    it('returns 400 for non-image content-type from upstream', async () => {
      const { app } = makeApp()
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response('<html></html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }),
      )

      const url = 'https://lastfm.freetls.fastly.net/image/abc'
      const res = await app.request(`/proxy?url=${encodeURIComponent(url)}`)

      expect(res.status).toBe(400)
    })
  })

  it('returns 413 when Content-Length exceeds the size limit', async () => {
    const { app } = makeApp()
    const overSizeBytes = 11 * 1024 * 1024 // 11MB
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response('too large', {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Length': String(overSizeBytes),
        },
      }),
    )

    const url = 'https://books.google.com/books/content?id=abc&img=1'
    const res = await app.request(`/proxy?url=${encodeURIComponent(url)}`)

    expect(res.status).toBe(413)
    const json = (await res.json()) as ErrorResponse
    expect(json.ok).toBe(false)
    expect(json.error.message).toMatch(/サイズ/)
  })

  it('allows responses within the size limit', async () => {
    const { app } = makeApp()
    const imageData = new Uint8Array(1024) // 1KB
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(imageData, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Content-Length': '1024',
        },
      }),
    )

    const url = 'https://books.google.com/books/content?id=abc&img=1'
    const res = await app.request(`/proxy?url=${encodeURIComponent(url)}`)

    expect(res.status).toBe(200)
  })

  it('returns 413 when streamed body exceeds the size limit without Content-Length', async () => {
    const { app } = makeApp()
    const chunkSize = 1024 * 1024 // 1MB per chunk
    let chunksSent = 0
    const stream = new ReadableStream({
      pull(controller) {
        if (chunksSent < 11) {
          controller.enqueue(new Uint8Array(chunkSize))
          chunksSent++
        } else {
          controller.close()
        }
      },
    })

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(stream, {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
        },
      }),
    )

    const url = 'https://books.google.com/books/content?id=abc&img=1'
    const res = await app.request(`/proxy?url=${encodeURIComponent(url)}`)

    expect(res.status).toBe(413)
    const json = (await res.json()) as ErrorResponse
    expect(json.ok).toBe(false)
    expect(json.error.message).toMatch(/サイズ/)
  })

  it('streams responses without Content-Length within the size limit', async () => {
    const { app } = makeApp()
    const chunkSize = 1024
    let chunksSent = 0
    const stream = new ReadableStream({
      pull(controller) {
        if (chunksSent < 3) {
          controller.enqueue(new Uint8Array(chunkSize))
          chunksSent++
        } else {
          controller.close()
        }
      },
    })

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(stream, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
        },
      }),
    )

    const url = 'https://books.google.com/books/content?id=abc&img=1'
    const res = await app.request(`/proxy?url=${encodeURIComponent(url)}`)

    expect(res.status).toBe(200)
    const body = await res.arrayBuffer()
    expect(body.byteLength).toBe(3 * 1024)
  })

  describe('server-side cache', () => {
    it('returns X-Cache: MISS on first request', async () => {
      const { app } = makeApp()
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(new Uint8Array([1, 2, 3]), {
          status: 200,
          headers: { 'Content-Type': 'image/jpeg' },
        }),
      )

      const url = 'https://books.google.com/books/content?id=abc&img=1'
      const res = await app.request(`/proxy?url=${encodeURIComponent(url)}`)

      expect(res.status).toBe(200)
      expect(res.headers.get('X-Cache')).toBe('MISS')
    })

    it('returns X-Cache: HIT on second request and does not call fetch again', async () => {
      const { app } = makeApp()
      const imageData = new Uint8Array([1, 2, 3])
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(imageData, {
          status: 200,
          headers: { 'Content-Type': 'image/jpeg' },
        }),
      )
      globalThis.fetch = mockFetch

      const url = 'https://books.google.com/books/content?id=abc&img=1'
      const encodedUrl = `/proxy?url=${encodeURIComponent(url)}`

      // First request - MISS
      const res1 = await app.request(encodedUrl)
      expect(res1.status).toBe(200)
      expect(res1.headers.get('X-Cache')).toBe('MISS')
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Second request - HIT (fetch should not be called again)
      const res2 = await app.request(encodedUrl)
      expect(res2.status).toBe(200)
      expect(res2.headers.get('X-Cache')).toBe('HIT')
      expect(res2.headers.get('Content-Type')).toBe('image/jpeg')
      expect(mockFetch).toHaveBeenCalledTimes(1)

      const body = new Uint8Array(await res2.arrayBuffer())
      expect(body).toEqual(imageData)
    })

    it('caches different URLs separately', async () => {
      const { app } = makeApp()
      let callCount = 0
      globalThis.fetch = vi.fn().mockImplementation(() => {
        callCount++
        return Promise.resolve(
          new Response(new Uint8Array([callCount]), {
            status: 200,
            headers: { 'Content-Type': 'image/png' },
          }),
        )
      })

      const url1 = 'https://books.google.com/img1'
      const url2 = 'https://books.google.com/img2'

      await app.request(`/proxy?url=${encodeURIComponent(url1)}`)
      await app.request(`/proxy?url=${encodeURIComponent(url2)}`)

      expect(callCount).toBe(2)

      // Both should be cached
      const res1 = await app.request(`/proxy?url=${encodeURIComponent(url1)}`)
      const res2 = await app.request(`/proxy?url=${encodeURIComponent(url2)}`)
      expect(res1.headers.get('X-Cache')).toBe('HIT')
      expect(res2.headers.get('X-Cache')).toBe('HIT')
      expect(callCount).toBe(2) // no additional fetches
    })

    it('does not cache error responses', async () => {
      const { app } = makeApp()
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce(new Response('Not Found', { status: 404 }))
        .mockResolvedValueOnce(
          new Response(new Uint8Array([1]), {
            status: 200,
            headers: { 'Content-Type': 'image/jpeg' },
          }),
        )
      globalThis.fetch = mockFetch

      const url = 'https://books.google.com/img'
      const encodedUrl = `/proxy?url=${encodeURIComponent(url)}`

      // First request fails
      const res1 = await app.request(encodedUrl)
      expect(res1.status).toBe(502)

      // Second request should fetch again (not cached)
      const res2 = await app.request(encodedUrl)
      expect(res2.status).toBe(200)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('ALLOWED_HOSTS', () => {
    it('includes Google Books domains', () => {
      expect(ALLOWED_HOSTS).toContain('books.google.com')
      expect(ALLOWED_HOSTS).toContain('books.googleusercontent.com')
    })

    it('includes Last.fm CDN', () => {
      expect(ALLOWED_HOSTS).toContain('lastfm.freetls.fastly.net')
    })

    it('includes TMDB CDN', () => {
      expect(ALLOWED_HOSTS).toContain('image.tmdb.org')
    })
  })
})
