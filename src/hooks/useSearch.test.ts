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
})
