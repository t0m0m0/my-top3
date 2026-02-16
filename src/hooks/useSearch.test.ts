import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '../test/msw/server'
import { useSearch } from './useSearch'

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useSearch', () => {
  it('returns empty results for empty query', async () => {
    const { result } = renderHook(() => useSearch('book', ''))
    expect(result.current.results).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.hasMore).toBe(false)
  })

  it('fetches results for non-empty query', async () => {
    const { result } = renderHook(() => useSearch('book', 'test'))
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.results.length).toBeGreaterThan(0)
    expect(result.current.results[0].category).toBe('book')
  })

  it('sets error on API failure', async () => {
    server.use(
      http.get(
        '/api/books/search',
        () => new HttpResponse(null, { status: 500 }),
      ),
    )
    const { result } = renderHook(() => useSearch('book', 'test'))
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.error).toBeTruthy()
  })

  it('resets results when query changes to empty', async () => {
    const { result, rerender } = renderHook(
      ({ query }) => useSearch('book', query),
      { initialProps: { query: 'test' } },
    )
    await waitFor(() => {
      expect(result.current.results.length).toBeGreaterThan(0)
    })

    rerender({ query: '' })
    await waitFor(() => {
      expect(result.current.results).toEqual([])
    })
  })

  it('calls correct API path for each category', async () => {
    const { result: musicResult } = renderHook(() => useSearch('music', 'test'))
    await waitFor(() => {
      expect(musicResult.current.isLoading).toBe(false)
    })
    expect(musicResult.current.results[0]?.category).toBe('music')
  })

  it('deduplicates items when loading more returns overlapping results', async () => {
    let callCount = 0
    server.use(
      http.get('/api/books/search', () => {
        callCount++
        if (callCount === 1) {
          return HttpResponse.json({
            ok: true,
            data: {
              items: [
                {
                  id: 'b1',
                  category: 'book',
                  title: 'Book 1',
                  subtitle: 'A1',
                  thumbnailUrl: '',
                  externalUrl: '',
                },
                {
                  id: 'b2',
                  category: 'book',
                  title: 'Book 2',
                  subtitle: 'A2',
                  thumbnailUrl: '',
                  externalUrl: '',
                },
              ],
              totalItems: 4,
              startIndex: 0,
            },
          })
        }
        return HttpResponse.json({
          ok: true,
          data: {
            items: [
              {
                id: 'b2',
                category: 'book',
                title: 'Book 2',
                subtitle: 'A2',
                thumbnailUrl: '',
                externalUrl: '',
              },
              {
                id: 'b3',
                category: 'book',
                title: 'Book 3',
                subtitle: 'A3',
                thumbnailUrl: '',
                externalUrl: '',
              },
            ],
            totalItems: 4,
            startIndex: 2,
          },
        })
      }),
    )

    const { result } = renderHook(() => useSearch('book', 'test'))
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.results).toHaveLength(2)
    expect(result.current.hasMore).toBe(true)

    result.current.loadMore()
    await waitFor(() => {
      expect(result.current.results).toHaveLength(3)
    })
    const ids = result.current.results.map((r) => r.id)
    expect(ids).toEqual(['b1', 'b2', 'b3'])
  })

  it('sets hasMore to false when API returns empty items with remaining totalItems', async () => {
    server.use(
      http.get('/api/books/search', () => {
        return HttpResponse.json({
          ok: true,
          data: {
            items: [],
            totalItems: 100,
            startIndex: 0,
          },
        })
      }),
    )

    const { result } = renderHook(() => useSearch('book', 'test'))
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.hasMore).toBe(false)
    expect(result.current.results).toEqual([])
  })
})
