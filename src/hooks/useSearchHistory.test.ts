import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSearchHistory } from './useSearchHistory'

describe('useSearchHistory', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns empty history initially', () => {
    const { result } = renderHook(() => useSearchHistory('book'))
    expect(result.current.history).toEqual([])
  })

  it('adds a keyword to history', () => {
    const { result } = renderHook(() => useSearchHistory('book'))
    act(() => {
      result.current.addHistory('村上春樹')
    })
    expect(result.current.history).toEqual(['村上春樹'])
  })

  it('ignores empty or whitespace-only keywords', () => {
    const { result } = renderHook(() => useSearchHistory('book'))
    act(() => {
      result.current.addHistory('')
    })
    act(() => {
      result.current.addHistory('   ')
    })
    expect(result.current.history).toEqual([])
  })

  it('trims keywords before saving', () => {
    const { result } = renderHook(() => useSearchHistory('book'))
    act(() => {
      result.current.addHistory('  村上春樹  ')
    })
    expect(result.current.history).toEqual(['村上春樹'])
  })

  it('deduplicates keywords, moving existing to the top', () => {
    const { result } = renderHook(() => useSearchHistory('book'))
    act(() => {
      result.current.addHistory('東野圭吾')
    })
    act(() => {
      result.current.addHistory('村上春樹')
    })
    act(() => {
      result.current.addHistory('東野圭吾')
    })
    expect(result.current.history).toEqual(['東野圭吾', '村上春樹'])
  })

  it('limits history to 10 items', () => {
    const { result } = renderHook(() => useSearchHistory('book'))
    for (let i = 0; i < 12; i++) {
      act(() => {
        result.current.addHistory(`keyword-${i}`)
      })
    }
    expect(result.current.history).toHaveLength(10)
    expect(result.current.history[0]).toBe('keyword-11')
    expect(result.current.history[9]).toBe('keyword-2')
  })

  it('removes a keyword from history', () => {
    const { result } = renderHook(() => useSearchHistory('book'))
    act(() => {
      result.current.addHistory('村上春樹')
    })
    act(() => {
      result.current.addHistory('東野圭吾')
    })
    act(() => {
      result.current.removeHistory('村上春樹')
    })
    expect(result.current.history).toEqual(['東野圭吾'])
  })

  it('clears all history', () => {
    const { result } = renderHook(() => useSearchHistory('book'))
    act(() => {
      result.current.addHistory('村上春樹')
    })
    act(() => {
      result.current.addHistory('東野圭吾')
    })
    act(() => {
      result.current.clearHistory()
    })
    expect(result.current.history).toEqual([])
  })

  it('persists history to localStorage', () => {
    const { result } = renderHook(() => useSearchHistory('book'))
    act(() => {
      result.current.addHistory('村上春樹')
    })
    const stored = localStorage.getItem('search-history-book')
    expect(stored).toBeTruthy()
    const parsed = JSON.parse(stored!) as Array<{
      keyword: string
      timestamp: number
    }>
    expect(parsed[0].keyword).toBe('村上春樹')
    expect(parsed[0].timestamp).toBeGreaterThan(0)
  })

  it('loads history from localStorage on mount', () => {
    const items = [
      { keyword: '村上春樹', timestamp: Date.now() },
      { keyword: '東野圭吾', timestamp: Date.now() - 1000 },
    ]
    localStorage.setItem('search-history-book', JSON.stringify(items))

    const { result } = renderHook(() => useSearchHistory('book'))
    expect(result.current.history).toEqual(['村上春樹', '東野圭吾'])
  })

  it('stores history independently per category', () => {
    const { result: bookResult } = renderHook(() => useSearchHistory('book'))
    const { result: musicResult } = renderHook(() => useSearchHistory('music'))

    act(() => {
      bookResult.current.addHistory('book keyword')
    })
    act(() => {
      musicResult.current.addHistory('music keyword')
    })

    expect(bookResult.current.history).toEqual(['book keyword'])
    expect(musicResult.current.history).toEqual(['music keyword'])
  })

  it('handles corrupted localStorage data gracefully', () => {
    localStorage.setItem('search-history-book', 'not valid json')
    const { result } = renderHook(() => useSearchHistory('book'))
    expect(result.current.history).toEqual([])
  })

  it('handles valid JSON that is not an array', () => {
    localStorage.setItem('search-history-book', '{"key": "value"}')
    const { result } = renderHook(() => useSearchHistory('book'))
    expect(result.current.history).toEqual([])
  })

  it('filters out malformed items from localStorage', () => {
    const items = [
      { keyword: '村上春樹', timestamp: Date.now() },
      null,
      42,
      { keyword: 123 },
      { keyword: '東野圭吾', timestamp: Date.now() - 1000 },
    ]
    localStorage.setItem('search-history-book', JSON.stringify(items))
    const { result } = renderHook(() => useSearchHistory('book'))
    expect(result.current.history).toEqual(['村上春樹', '東野圭吾'])
  })

  it('persists removal to localStorage', () => {
    const { result } = renderHook(() => useSearchHistory('book'))
    act(() => {
      result.current.addHistory('村上春樹')
    })
    act(() => {
      result.current.addHistory('東野圭吾')
    })
    act(() => {
      result.current.removeHistory('村上春樹')
    })
    const stored = JSON.parse(
      localStorage.getItem('search-history-book')!,
    ) as Array<{ keyword: string }>
    expect(stored).toHaveLength(1)
    expect(stored[0].keyword).toBe('東野圭吾')
  })

  it('persists clearHistory to localStorage', () => {
    const { result } = renderHook(() => useSearchHistory('book'))
    act(() => {
      result.current.addHistory('村上春樹')
    })
    act(() => {
      result.current.clearHistory()
    })
    const stored = JSON.parse(
      localStorage.getItem('search-history-book')!,
    ) as Array<unknown>
    expect(stored).toEqual([])
  })

  it('does not throw when removing a non-existent keyword', () => {
    const { result } = renderHook(() => useSearchHistory('book'))
    act(() => {
      result.current.addHistory('村上春樹')
    })
    act(() => {
      result.current.removeHistory('存在しないキーワード')
    })
    expect(result.current.history).toEqual(['村上春樹'])
  })

  it('reloads history when category changes', () => {
    localStorage.setItem(
      'search-history-book',
      JSON.stringify([{ keyword: 'book keyword', timestamp: Date.now() }]),
    )
    localStorage.setItem(
      'search-history-music',
      JSON.stringify([{ keyword: 'music keyword', timestamp: Date.now() }]),
    )

    const { result, rerender } = renderHook(
      ({ category }) => useSearchHistory(category),
      { initialProps: { category: 'book' as const } },
    )
    expect(result.current.history).toEqual(['book keyword'])

    rerender({ category: 'music' as const })
    expect(result.current.history).toEqual(['music keyword'])
  })
})
