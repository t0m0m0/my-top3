import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useRestoreSelection } from './useRestoreSelection'
import { createSearchResultItem } from '../test/fixtures'

// Mock fetch
const mockFetch = vi.fn()
globalThis.fetch = mockFetch

// Mock selection context
const mockSelectItem = vi.fn()
vi.mock('./useSelection', () => ({
  useSelection: () => ({
    selection: { book: null, music: null, movie: null },
    selectItem: mockSelectItem,
    deselectItem: vi.fn(),
    clearAll: vi.fn(),
    isComplete: false,
  }),
}))

describe('useRestoreSelection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does nothing when no IDs provided', () => {
    renderHook(() => useRestoreSelection('', '', ''))
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('fetches and restores book when bookId is provided', async () => {
    const bookItem = createSearchResultItem({
      id: 'b1',
      category: 'book',
      title: 'Test Book',
    })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, data: bookItem }),
    })

    renderHook(() => useRestoreSelection('b1', '', ''))

    await waitFor(() => {
      expect(mockSelectItem).toHaveBeenCalledWith(bookItem)
    })
  })

  it('fetches all three categories in parallel', async () => {
    const bookItem = createSearchResultItem({ id: 'b1', category: 'book' })
    const musicItem = createSearchResultItem({ id: 'm1', category: 'music' })
    const movieItem = createSearchResultItem({ id: 'v1', category: 'movie' })

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, data: bookItem }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, data: musicItem }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, data: movieItem }),
      })

    renderHook(() => useRestoreSelection('b1', 'm1', 'v1'))

    await waitFor(() => {
      expect(mockSelectItem).toHaveBeenCalledTimes(3)
    })
  })

  it('handles fetch failure gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    renderHook(() => useRestoreSelection('b1', '', ''))

    // Should not throw
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })
})
