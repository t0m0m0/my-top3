// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../services/google-books.ts', () => ({
  searchBooks: vi.fn(),
  getBookById: vi.fn(),
}))
vi.mock('../services/lastfm.ts', () => ({
  searchMusic: vi.fn(),
  getMusicById: vi.fn(),
}))
vi.mock('../services/tmdb.ts', () => ({
  searchMovies: vi.fn(),
  getMovieById: vi.fn(),
}))

describe('CORS middleware', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    vi.resetModules()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  async function getApp() {
    const mod = await import('./index.ts')
    return mod.default
  }

  it('throws error when CORS_ORIGIN is not set', async () => {
    delete process.env['CORS_ORIGIN']
    await expect(getApp()).rejects.toThrow(
      'CORS_ORIGIN environment variable is required',
    )
  })

  it('returns CORS headers when CORS_ORIGIN is set', async () => {
    process.env['CORS_ORIGIN'] = 'https://custom.example.com'
    const app = await getApp()
    const req = new Request('http://localhost/api/books/search?q=test', {
      headers: { Origin: 'https://custom.example.com' },
    })
    const res = await app.request(req)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://custom.example.com',
    )
  })

  it('handles preflight OPTIONS request', async () => {
    process.env['CORS_ORIGIN'] = 'https://custom.example.com'
    const app = await getApp()
    const req = new Request('http://localhost/api/books/search', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://custom.example.com',
        'Access-Control-Request-Method': 'GET',
      },
    })
    const res = await app.request(req)
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://custom.example.com',
    )
    expect(res.headers.get('Access-Control-Allow-Methods')).toBe(
      'GET,POST,DELETE',
    )
  })

  it('allows POST in preflight for /api/shares', async () => {
    process.env['CORS_ORIGIN'] = 'https://custom.example.com'
    const app = await getApp()
    const req = new Request('http://localhost/api/shares', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://custom.example.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      },
    })
    const res = await app.request(req)
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST')
  })

  it('does not return CORS headers for disallowed origin', async () => {
    process.env['CORS_ORIGIN'] = 'https://allowed.example.com'
    const app = await getApp()
    const req = new Request('http://localhost/api/books/search?q=test', {
      headers: { Origin: 'https://evil.example.com' },
    })
    const res = await app.request(req)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })

  it('supports multiple origins via comma-separated CORS_ORIGIN', async () => {
    process.env['CORS_ORIGIN'] =
      'https://one.example.com,https://two.example.com'
    const app = await getApp()

    const req1 = new Request('http://localhost/api/books/search?q=test', {
      headers: { Origin: 'https://one.example.com' },
    })
    const res1 = await app.request(req1)
    expect(res1.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://one.example.com',
    )

    const req2 = new Request('http://localhost/api/books/search?q=test', {
      headers: { Origin: 'https://two.example.com' },
    })
    const res2 = await app.request(req2)
    expect(res2.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://two.example.com',
    )
  })

  it('rejects origins not in CORS_ORIGIN when env var is set', async () => {
    process.env['CORS_ORIGIN'] = 'https://allowed.example.com'
    const app = await getApp()
    const req = new Request('http://localhost/api/books/search?q=test', {
      headers: { Origin: 'https://evil.example.com' },
    })
    const res = await app.request(req)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })
})
