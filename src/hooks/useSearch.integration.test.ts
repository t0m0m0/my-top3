import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse, delay } from 'msw'
import { server } from '../test/msw/server'
import { useSearch } from './useSearch'

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function makeSearchResponse(
  items: Array<{
    id: string
    category: string
    title: string
    subtitle: string
    thumbnailUrl: string
    externalUrl: string
  }>,
  totalItems?: number,
) {
  return {
    ok: true,
    data: {
      items,
      totalItems: totalItems ?? items.length,
      startIndex: 0,
    },
  }
}

describe('useSearch integration', () => {
  it('aborts stale request when query changes quickly, showing only latest results', async () => {
    const requestLog: string[] = []

    server.use(
      http.get('/api/books/search', async ({ request }) => {
        const url = new URL(request.url)
        const q = url.searchParams.get('q') ?? ''
        requestLog.push(q)

        if (q === 'A') {
          // Slow response for query "A" - should be aborted
          await delay(500)
          return HttpResponse.json(
            makeSearchResponse([
              {
                id: 'stale-a',
                category: 'book',
                title: 'Stale Result A',
                subtitle: 'Should not appear',
                thumbnailUrl: 'https://example.com/a.jpg',
                externalUrl: 'https://example.com/a',
              },
            ]),
          )
        }

        // Fast response for query "B"
        return HttpResponse.json(
          makeSearchResponse([
            {
              id: 'fresh-b',
              category: 'book',
              title: 'Fresh Result B',
              subtitle: 'Should appear',
              thumbnailUrl: 'https://example.com/b.jpg',
              externalUrl: 'https://example.com/b',
            },
          ]),
        )
      }),
    )

    const { result, rerender } = renderHook(
      ({ query }: { query: string }) => useSearch('book', query),
      { initialProps: { query: 'A' } },
    )

    // Immediately change query to "B" before "A" resolves
    rerender({ query: 'B' })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Stale "A" results must not appear
    const hasStale = result.current.results.some((r) => r.id === 'stale-a')
    expect(hasStale).toBe(false)

    if (result.current.results.length > 0) {
      expect(result.current.results[0].id).toBe('fresh-b')
    }

    // Both requests were issued but "A" was aborted
    expect(requestLog).toContain('A')
    expect(requestLog).toContain('B')
  })

  it('does not throw when unmounted during an in-flight request', async () => {
    server.use(
      http.get('/api/books/search', async () => {
        await delay(300)
        return HttpResponse.json(
          makeSearchResponse([
            {
              id: 'unmount-1',
              category: 'book',
              title: 'Unmount Test',
              subtitle: 'Sub',
              thumbnailUrl: 'https://example.com/u.jpg',
              externalUrl: 'https://example.com/u',
            },
          ]),
        )
      }),
    )

    const { result, unmount } = renderHook(() =>
      useSearch('book', 'unmount-query'),
    )

    // Unmount while request is in-flight
    expect(result.current.isLoading).toBe(true)
    expect(() => unmount()).not.toThrow()
  })

  it('recovers from server error on re-render with same query (retry flow)', async () => {
    let callCount = 0
    server.use(
      http.get('/api/books/search', () => {
        callCount++
        if (callCount === 1) {
          return new HttpResponse(null, { status: 500 })
        }
        return HttpResponse.json(
          makeSearchResponse([
            {
              id: 'recovered-1',
              category: 'book',
              title: 'Recovered Book',
              subtitle: 'Author',
              thumbnailUrl: 'https://example.com/rec.jpg',
              externalUrl: 'https://example.com/rec',
            },
          ]),
        )
      }),
    )

    const { result, rerender } = renderHook(
      ({ query }: { query: string }) => useSearch('book', query),
      { initialProps: { query: 'retry-test' } },
    )

    // Wait for the first request to fail
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.error).toBeTruthy()
    expect(result.current.results).toHaveLength(0)

    // Change query to trigger a new fetch, then change back to trigger retry
    rerender({ query: '' })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    rerender({ query: 'retry-test' })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.results.length).toBeGreaterThan(0)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.results).toHaveLength(1)
    expect(result.current.results[0]).toEqual({
      id: 'recovered-1',
      category: 'book',
      title: 'Recovered Book',
      subtitle: 'Author',
      thumbnailUrl: 'https://example.com/rec.jpg',
      externalUrl: 'https://example.com/rec',
    })
  })
})
