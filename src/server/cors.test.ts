// @vitest-environment node
import { describe, it, expect, vi } from 'vitest'
import app from './index'

vi.mock('../services/google-books.ts', () => ({
  searchBooks: vi.fn(),
  getBookById: vi.fn(),
}))
vi.mock('../services/spotify.ts', () => ({
  searchMusic: vi.fn(),
  getMusicById: vi.fn(),
}))
vi.mock('../services/tmdb.ts', () => ({
  searchMovies: vi.fn(),
  getMovieById: vi.fn(),
}))

describe('CORS middleware', () => {
  it('returns CORS headers for /api/* with allowed origin', async () => {
    const req = new Request('http://localhost/api/books/search?q=test', {
      headers: { Origin: 'https://myno1s.exe.xyz' },
    })
    const res = await app.request(req)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://myno1s.exe.xyz',
    )
  })

  it('handles preflight OPTIONS request', async () => {
    const req = new Request('http://localhost/api/books/search', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://myno1s.exe.xyz',
        'Access-Control-Request-Method': 'GET',
      },
    })
    const res = await app.request(req)
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://myno1s.exe.xyz',
    )
    expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET')
  })

  it('does not return CORS headers for disallowed origin', async () => {
    const req = new Request('http://localhost/api/books/search?q=test', {
      headers: { Origin: 'https://evil.example.com' },
    })
    const res = await app.request(req)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })
})
