import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { SelectionProvider } from './SelectionContext'
import { useSelection } from '../hooks/useSelection'
import { createSearchResultItem } from '../test/fixtures'

function wrapper({ children }: { children: ReactNode }) {
  return <SelectionProvider>{children}</SelectionProvider>
}

describe('SelectionContext', () => {
  it('has all null initial selections', () => {
    const { result } = renderHook(() => useSelection(), { wrapper })
    expect(result.current.selection.book).toBeNull()
    expect(result.current.selection.music).toBeNull()
    expect(result.current.selection.movie).toBeNull()
  })

  it('selectItem sets item for correct category', () => {
    const { result } = renderHook(() => useSelection(), { wrapper })
    const book = createSearchResultItem({ id: 'b1', category: 'book' })
    act(() => {
      result.current.selectItem(book)
    })
    expect(result.current.selection.book).toEqual(book)
    expect(result.current.selection.music).toBeNull()
  })

  it('selectItem replaces existing selection', () => {
    const { result } = renderHook(() => useSelection(), { wrapper })
    const book1 = createSearchResultItem({ id: 'b1', category: 'book' })
    const book2 = createSearchResultItem({ id: 'b2', category: 'book' })
    act(() => {
      result.current.selectItem(book1)
    })
    act(() => {
      result.current.selectItem(book2)
    })
    expect(result.current.selection.book?.id).toBe('b2')
  })

  it('deselectItem clears specific category', () => {
    const { result } = renderHook(() => useSelection(), { wrapper })
    const book = createSearchResultItem({ id: 'b1', category: 'book' })
    act(() => {
      result.current.selectItem(book)
    })
    act(() => {
      result.current.deselectItem('book')
    })
    expect(result.current.selection.book).toBeNull()
  })

  it('clearAll resets all selections', () => {
    const { result } = renderHook(() => useSelection(), { wrapper })
    act(() => {
      result.current.selectItem(
        createSearchResultItem({ id: 'b1', category: 'book' }),
      )
      result.current.selectItem(
        createSearchResultItem({ id: 'm1', category: 'music' }),
      )
      result.current.selectItem(
        createSearchResultItem({ id: 'v1', category: 'movie' }),
      )
    })
    act(() => {
      result.current.clearAll()
    })
    expect(result.current.selection.book).toBeNull()
    expect(result.current.selection.music).toBeNull()
    expect(result.current.selection.movie).toBeNull()
  })

  it('isComplete is false when any selection is null', () => {
    const { result } = renderHook(() => useSelection(), { wrapper })
    act(() => {
      result.current.selectItem(
        createSearchResultItem({ id: 'b1', category: 'book' }),
      )
      result.current.selectItem(
        createSearchResultItem({ id: 'm1', category: 'music' }),
      )
    })
    expect(result.current.isComplete).toBe(false)
  })

  it('isComplete is true when all 3 selected', () => {
    const { result } = renderHook(() => useSelection(), { wrapper })
    act(() => {
      result.current.selectItem(
        createSearchResultItem({ id: 'b1', category: 'book' }),
      )
      result.current.selectItem(
        createSearchResultItem({ id: 'm1', category: 'music' }),
      )
      result.current.selectItem(
        createSearchResultItem({ id: 'v1', category: 'movie' }),
      )
    })
    expect(result.current.isComplete).toBe(true)
  })

  it('throws when used outside provider', () => {
    expect(() => {
      renderHook(() => useSelection())
    }).toThrow('useSelection must be used within a SelectionProvider')
  })
})
