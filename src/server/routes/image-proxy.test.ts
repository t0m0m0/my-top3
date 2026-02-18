// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { imageProxyApp, ALLOWED_HOSTS } from './image-proxy.ts'

type ErrorResponse = { ok: false; error: { kind: string; message: string } }

// Mock global fetch
const originalFetch = globalThis.fetch

beforeEach(() => {
  vi.restoreAllMocks()
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('image-proxy route', () => {
  describe('GET /proxy', () => {
    it('returns 400 when url query parameter is missing', async () => {
      const res = await imageProxyApp.request('/proxy')
      expect(res.status).toBe(400)
      const json = (await res.json()) as ErrorResponse
      expect(json.ok).toBe(false)
      expect(json.error.message).toMatch(/url/i)
    })

    it('returns 400 when url is not a valid URL', async () => {
      const res = await imageProxyApp.request('/proxy?url=not-a-url')
      expect(res.status).toBe(400)
      const json = (await res.json()) as ErrorResponse
      expect(json.ok).toBe(false)
    })

    it('returns 403 when host is not in allowlist', async () => {
      const res = await imageProxyApp.request(
        '/proxy?url=https://evil.example.com/image.jpg',
      )
      expect(res.status).toBe(403)
      const json = (await res.json()) as ErrorResponse
      expect(json.ok).toBe(false)
      expect(json.error.message).toMatch(/許可/)
    })

    it('proxies image from allowed Google Books host', async () => {
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
      const res = await imageProxyApp.request(
        `/proxy?url=${encodeURIComponent(url)}`,
      )

      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toBe('image/jpeg')
      expect(res.headers.get('Cache-Control')).toMatch(/max-age/)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })

    it('proxies image from allowed Spotify CDN host', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(new Uint8Array([0xff, 0xd8]), {
          status: 200,
          headers: { 'Content-Type': 'image/jpeg' },
        }),
      )

      const url = 'https://i.scdn.co/image/abc123'
      const res = await imageProxyApp.request(
        `/proxy?url=${encodeURIComponent(url)}`,
      )

      expect(res.status).toBe(200)
      expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledWith(
        url,
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      )
    })

    it('proxies image from allowed TMDB host', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(new Uint8Array([0xff, 0xd8]), {
          status: 200,
          headers: { 'Content-Type': 'image/jpeg' },
        }),
      )

      const url = 'https://image.tmdb.org/t/p/w300/poster.jpg'
      const res = await imageProxyApp.request(
        `/proxy?url=${encodeURIComponent(url)}`,
      )

      expect(res.status).toBe(200)
    })

    it('returns 502 when upstream returns non-2xx status', async () => {
      globalThis.fetch = vi
        .fn()
        .mockResolvedValue(new Response('Not Found', { status: 404 }))

      const url = 'https://i.scdn.co/image/missing'
      const res = await imageProxyApp.request(
        `/proxy?url=${encodeURIComponent(url)}`,
      )

      expect(res.status).toBe(502)
      const json = (await res.json()) as ErrorResponse
      expect(json.ok).toBe(false)
    })

    it('returns 502 when upstream fetch fails', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('network error'))

      const url = 'https://i.scdn.co/image/abc'
      const res = await imageProxyApp.request(
        `/proxy?url=${encodeURIComponent(url)}`,
      )

      expect(res.status).toBe(502)
    })

    it('returns 403 for non-https URLs', async () => {
      const res = await imageProxyApp.request(
        '/proxy?url=http://i.scdn.co/image/abc',
      )
      expect(res.status).toBe(403)
    })

    it('returns 400 for non-image content-type from upstream', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response('<html></html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }),
      )

      const url = 'https://i.scdn.co/image/abc'
      const res = await imageProxyApp.request(
        `/proxy?url=${encodeURIComponent(url)}`,
      )

      expect(res.status).toBe(400)
    })
  })

  describe('ALLOWED_HOSTS', () => {
    it('includes Google Books domains', () => {
      expect(ALLOWED_HOSTS).toContain('books.google.com')
      expect(ALLOWED_HOSTS).toContain('books.googleusercontent.com')
    })

    it('includes Spotify CDN', () => {
      expect(ALLOWED_HOSTS).toContain('i.scdn.co')
    })

    it('includes TMDB CDN', () => {
      expect(ALLOWED_HOSTS).toContain('image.tmdb.org')
    })
  })
})
