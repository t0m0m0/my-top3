import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '../test/msw/server'
import { useGallery } from './useGallery'

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const makeFakeShares = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `id-${i}`,
    theme: `Theme ${i}`,
    bookId: `b${i}`,
    musicId: `m${i}`,
    movieId: `v${i}`,
    createdAt: 1700000000 - i,
  }))

describe('useGallery', () => {
  it('fetches initial data on mount', async () => {
    const fakeItems = makeFakeShares(3)
    server.use(
      http.get('/api/shares', () =>
        HttpResponse.json({ ok: true, data: { items: fakeItems, total: 3 } }),
      ),
    )

    const { result } = renderHook(() => useGallery())
    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.items).toHaveLength(3)
    expect(result.current.total).toBe(3)
    expect(result.current.error).toBeNull()
  })

  it('sets error on fetch failure', async () => {
    server.use(
      http.get('/api/shares', () => new HttpResponse(null, { status: 500 })),
    )

    const { result } = renderHook(() => useGallery())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeTruthy()
    expect(result.current.items).toHaveLength(0)
  })

  it('loads more items when loadMore is called', async () => {
    const page1 = makeFakeShares(20)
    const page2 = makeFakeShares(5).map((s) => ({ ...s, id: `page2-${s.id}` }))
    let callCount = 0

    server.use(
      http.get('/api/shares', ({ request }) => {
        callCount++
        const url = new URL(request.url)
        const offset = parseInt(url.searchParams.get('offset') ?? '0', 10)
        if (offset === 0) {
          return HttpResponse.json({
            ok: true,
            data: { items: page1, total: 25 },
          })
        }
        return HttpResponse.json({
          ok: true,
          data: { items: page2, total: 25 },
        })
      }),
    )

    const { result } = renderHook(() => useGallery())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.items).toHaveLength(20)
    expect(result.current.hasMore).toBe(true)

    act(() => result.current.loadMore())
    await waitFor(() => expect(result.current.loadingMore).toBe(false))
    expect(result.current.items).toHaveLength(25)
    expect(result.current.hasMore).toBe(false)
    expect(callCount).toBe(2)
  })

  it('hasMore is false when all items are loaded', async () => {
    server.use(
      http.get('/api/shares', () =>
        HttpResponse.json({
          ok: true,
          data: { items: makeFakeShares(3), total: 3 },
        }),
      ),
    )

    const { result } = renderHook(() => useGallery())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.hasMore).toBe(false)
  })
})
