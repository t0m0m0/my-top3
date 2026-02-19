import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { act } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '../test/msw/server'
import { useWorkFetch } from './useWorkFetch'

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useWorkFetch', () => {
  it('resolves 3 parallel requests (book, music, movie) with correct data', async () => {
    const { result: bookResult } = renderHook(() =>
      useWorkFetch('book', 'book-123'),
    )
    const { result: musicResult } = renderHook(() =>
      useWorkFetch('music', 'music-456'),
    )
    const { result: movieResult } = renderHook(() =>
      useWorkFetch('movie', 'movie-789'),
    )

    await waitFor(() => {
      expect(bookResult.current.loading).toBe(false)
    })
    await waitFor(() => {
      expect(musicResult.current.loading).toBe(false)
    })
    await waitFor(() => {
      expect(movieResult.current.loading).toBe(false)
    })

    // Book
    expect(bookResult.current.error).toBeNull()
    expect(bookResult.current.data).toEqual({
      id: 'book-123',
      category: 'book',
      title: 'Test Book',
      subtitle: 'Test Author',
      thumbnailUrl: 'https://example.com/book.jpg',
      externalUrl: 'https://amazon.co.jp/dp/1234567890',
    })

    // Music
    expect(musicResult.current.error).toBeNull()
    expect(musicResult.current.data).toEqual({
      id: 'music-456',
      category: 'music',
      title: 'Test Album',
      subtitle: 'Test Artist',
      thumbnailUrl: 'https://example.com/album.jpg',
      externalUrl: 'https://www.last.fm/music/Artist/Album',
    })

    // Movie
    expect(movieResult.current.error).toBeNull()
    expect(movieResult.current.data).toEqual({
      id: 'movie-789',
      category: 'movie',
      title: 'Test Movie',
      subtitle: 'Test Director',
      thumbnailUrl: 'https://example.com/movie.jpg',
      externalUrl: 'https://www.imdb.com/title/tt1234567',
    })
  })

  it('sets error containing "見つかりませんでした" on 404', async () => {
    server.use(
      http.get('/api/books/:id', () => {
        return new HttpResponse(null, { status: 404 })
      }),
    )

    const { result } = renderHook(() => useWorkFetch('book', 'nonexistent'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toContain('見つかりませんでした')
  })

  it('sets error "しばらく時間をおいて再度お試しください" on 429', async () => {
    server.use(
      http.get('/api/music/:id', () => {
        return new HttpResponse(null, { status: 429 })
      }),
    )

    const { result } = renderHook(() =>
      useWorkFetch('music', 'rate-limited-id'),
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBe('しばらく時間をおいて再度お試しください')
  })

  it('loads data after retry following an error', async () => {
    let callCount = 0
    server.use(
      http.get('/api/movies/:id', ({ params }) => {
        callCount++
        if (callCount === 1) {
          return new HttpResponse(null, { status: 500 })
        }
        return HttpResponse.json({
          ok: true,
          data: {
            id: params['id'],
            category: 'movie',
            title: 'Retried Movie',
            subtitle: 'Retried Director',
            thumbnailUrl: 'https://example.com/retry.jpg',
            externalUrl: 'https://www.imdb.com/title/tt0000001',
          },
        })
      }),
    )

    const { result } = renderHook(() => useWorkFetch('movie', 'retry-id'))

    // Wait for first request to fail
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.error).toBeTruthy()
    expect(result.current.data).toBeNull()

    // Retry
    act(() => {
      result.current.retry()
    })

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.data).toEqual({
      id: 'retry-id',
      category: 'movie',
      title: 'Retried Movie',
      subtitle: 'Retried Director',
      thumbnailUrl: 'https://example.com/retry.jpg',
      externalUrl: 'https://www.imdb.com/title/tt0000001',
    })
  })
})
