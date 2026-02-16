// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { searchMovies, getMovieById } from './tmdb'

const BASE_URL = 'https://api.themoviedb.org/3'

const server = setupServer()
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function mockMovie(overrides: Record<string, unknown> = {}) {
  return {
    id: 123,
    title: 'Test Movie',
    poster_path: '/poster.jpg',
    release_date: '2024-01-01',
    ...overrides,
  }
}

function mockMovieDetail(overrides: Record<string, unknown> = {}) {
  return {
    id: 123,
    title: 'Test Movie',
    poster_path: '/poster.jpg',
    imdb_id: 'tt1234567',
    credits: {
      crew: [{ id: 1, name: 'Test Director', job: 'Director' }],
    },
    ...overrides,
  }
}

describe('searchMovies', () => {
  it('returns empty for blank query', async () => {
    const result = await searchMovies('key', '  ')
    expect(result).toEqual({
      ok: true,
      data: { items: [], totalItems: 0, startIndex: 0 },
    })
  })

  it('maps TMDb response correctly', async () => {
    server.use(
      http.get(`${BASE_URL}/search/movie`, () =>
        HttpResponse.json({
          page: 1,
          results: [mockMovie()],
          total_pages: 1,
          total_results: 1,
        }),
      ),
    )
    const result = await searchMovies('key', 'test')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.items).toHaveLength(1)
      expect(result.data.items[0].category).toBe('movie')
      expect(result.data.items[0].title).toBe('Test Movie')
      expect(result.data.items[0].thumbnailUrl).toContain('/poster.jpg')
      expect(result.data.items[0].subtitle).toBe('2024')
    }
  })

  it('shows 公開日不明 when release_date is missing', async () => {
    server.use(
      http.get(`${BASE_URL}/search/movie`, () =>
        HttpResponse.json({
          page: 1,
          results: [mockMovie({ release_date: undefined })],
          total_pages: 1,
          total_results: 1,
        }),
      ),
    )
    const result = await searchMovies('key', 'test')
    if (result.ok) {
      expect(result.data.items[0].subtitle).toBe('公開日不明')
    }
  })

  it('shows 公開日不明 when release_date is empty string', async () => {
    server.use(
      http.get(`${BASE_URL}/search/movie`, () =>
        HttpResponse.json({
          page: 1,
          results: [mockMovie({ release_date: '' })],
          total_pages: 1,
          total_results: 1,
        }),
      ),
    )
    const result = await searchMovies('key', 'test')
    if (result.ok) {
      expect(result.data.items[0].subtitle).toBe('公開日不明')
    }
  })

  it('handles null poster_path', async () => {
    server.use(
      http.get(`${BASE_URL}/search/movie`, () =>
        HttpResponse.json({
          page: 1,
          results: [mockMovie({ poster_path: null })],
          total_pages: 1,
          total_results: 1,
        }),
      ),
    )
    const result = await searchMovies('key', 'test')
    if (result.ok) {
      expect(result.data.items[0].thumbnailUrl).toBe('')
    }
  })
})

describe('getMovieById', () => {
  it('returns mapped result with director name', async () => {
    server.use(
      http.get(`${BASE_URL}/movie/:id`, () =>
        HttpResponse.json(mockMovieDetail()),
      ),
    )
    const result = await getMovieById('key', '123')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.subtitle).toBe('Test Director')
      expect(result.data.externalUrl).toBe(
        'https://www.imdb.com/title/tt1234567',
      )
    }
  })

  it('falls back to TMDb URL when no imdb_id', async () => {
    server.use(
      http.get(`${BASE_URL}/movie/:id`, () =>
        HttpResponse.json(mockMovieDetail({ imdb_id: null })),
      ),
    )
    const result = await getMovieById('key', '123')
    if (result.ok) {
      expect(result.data.externalUrl).toContain('themoviedb.org')
    }
  })

  it('rejects non-numeric ID', async () => {
    const result = await getMovieById('key', 'abc')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.kind).toBe('not-found')
  })
})
