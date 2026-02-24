import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  beforeEach,
} from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '../test/msw/server'
import { useReaction } from './useReaction'

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  localStorage.clear()
})
afterAll(() => server.close())

describe('useReaction', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('initializes with given count and reacted=false by default', () => {
    const { result } = renderHook(() => useReaction('share-1', 5))
    expect(result.current.count).toBe(5)
    expect(result.current.reacted).toBe(false)
  })

  it('reads reacted state from localStorage', () => {
    localStorage.setItem('reactions', JSON.stringify({ 'share-1': true }))
    const { result } = renderHook(() => useReaction('share-1', 3))
    expect(result.current.reacted).toBe(true)
  })

  it('toggleReaction adds a reaction optimistically', async () => {
    server.use(
      http.post('/api/shares/:id/reactions', () =>
        HttpResponse.json({ ok: true, data: { count: 1, reacted: true } }),
      ),
    )

    const { result } = renderHook(() => useReaction('share-1', 0))
    expect(result.current.count).toBe(0)
    expect(result.current.reacted).toBe(false)

    act(() => result.current.toggleReaction())

    // Optimistic update
    expect(result.current.count).toBe(1)
    expect(result.current.reacted).toBe(true)

    // After API confirms
    await waitFor(() => {
      expect(result.current.count).toBe(1)
    })
  })

  it('toggleReaction removes a reaction optimistically', async () => {
    localStorage.setItem('reactions', JSON.stringify({ 'share-1': true }))
    server.use(
      http.post('/api/shares/:id/reactions', () =>
        HttpResponse.json({ ok: true, data: { count: 0, reacted: false } }),
      ),
    )

    const { result } = renderHook(() => useReaction('share-1', 1))
    expect(result.current.reacted).toBe(true)

    act(() => result.current.toggleReaction())

    // Optimistic update
    expect(result.current.count).toBe(0)
    expect(result.current.reacted).toBe(false)

    await waitFor(() => {
      expect(result.current.count).toBe(0)
    })
  })

  it('persists reacted state to localStorage', async () => {
    server.use(
      http.post('/api/shares/:id/reactions', () =>
        HttpResponse.json({ ok: true, data: { count: 1, reacted: true } }),
      ),
    )

    const { result } = renderHook(() => useReaction('share-1', 0))
    act(() => result.current.toggleReaction())

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('reactions') ?? '{}')
      expect(stored['share-1']).toBe(true)
    })
  })

  it('reverts on API failure', async () => {
    server.use(
      http.post(
        '/api/shares/:id/reactions',
        () => new HttpResponse(null, { status: 500 }),
      ),
    )

    const { result } = renderHook(() => useReaction('share-1', 0))
    act(() => result.current.toggleReaction())

    // Optimistic
    expect(result.current.count).toBe(1)
    expect(result.current.reacted).toBe(true)

    // Reverts after failure
    await waitFor(() => {
      expect(result.current.count).toBe(0)
      expect(result.current.reacted).toBe(false)
    })
  })

  it('generates and persists clientId in localStorage', async () => {
    let capturedBody: Record<string, unknown> = {}
    server.use(
      http.post('/api/shares/:id/reactions', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          ok: true,
          data: { count: 1, reacted: true },
        })
      }),
    )

    const { result } = renderHook(() => useReaction('share-1', 0))
    act(() => result.current.toggleReaction())

    await waitFor(() => {
      expect(capturedBody.clientId).toBeDefined()
      expect(typeof capturedBody.clientId).toBe('string')
    })

    // clientId should be persisted
    const clientId = localStorage.getItem('clientId')
    expect(clientId).toBeTruthy()
    expect(clientId).toBe(capturedBody.clientId)
  })
})
