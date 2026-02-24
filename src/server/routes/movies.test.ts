// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { moviesApp } from './movies'

vi.mock('../../services/tmdb.ts', () => ({
  searchMovies: vi.fn(),
  getMovieById: vi.fn(),
}))

import { searchMovies, getMovieById } from '../../services/tmdb.ts'

const mockSearchMovies = vi.mocked(searchMovies)
const mockGetMovieById = vi.mocked(getMovieById)

describe('movies routes', () => {
  beforeEach(() => {
    vi.stubEnv('TMDB_API_KEY', 'test-key')
    vi.clearAllMocks()
  })

  describe('GET /search', () => {
    it('returns 500 when no API key', async () => {
      vi.stubEnv('TMDB_API_KEY', '')
      const res = await moviesApp.request('/search?q=test')
      expect(res.status).toBe(500)
    })

    it('returns results on success', async () => {
      mockSearchMovies.mockResolvedValue({
        ok: true,
        data: {
          items: [
            {
              id: 'v1',
              category: 'movie',
              title: 'Inception',
              subtitle: 'Christopher Nolan',
              thumbnailUrl: '',
              externalUrl: '',
            },
          ],
          totalItems: 1,
          startIndex: 0,
        },
      })
      const res = await moviesApp.request('/search?q=test')
      expect(res.status).toBe(200)
      const body = (await res.json()) as Record<string, unknown>
      expect(body.ok).toBe(true)
    })

    it('returns 400 for too long query', async () => {
      const longQuery = 'a'.repeat(201)
      const res = await moviesApp.request(`/search?q=${longQuery}`)
      expect(res.status).toBe(400)
    })

    it('returns error status on service failure', async () => {
      mockSearchMovies.mockResolvedValue({
        ok: false,
        error: { kind: 'not-found', message: 'Not found', status: 404 },
      })
      const res = await moviesApp.request('/search?q=test')
      expect(res.status).toBe(404)
    })
  })

  describe('GET /:id', () => {
    it('returns item on success', async () => {
      mockGetMovieById.mockResolvedValue({
        ok: true,
        data: {
          id: 'v1',
          category: 'movie',
          title: 'Inception',
          subtitle: 'Christopher Nolan',
          thumbnailUrl: '',
          externalUrl: '',
        },
      })
      const res = await moviesApp.request('/123')
      expect(res.status).toBe(200)
    })

    it('returns error on service failure', async () => {
      mockGetMovieById.mockResolvedValue({
        ok: false,
        error: { kind: 'not-found', message: 'Not found', status: 404 },
      })
      const res = await moviesApp.request('/123')
      expect(res.status).toBe(404)
    })
  })
})
