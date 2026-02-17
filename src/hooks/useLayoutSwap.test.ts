import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLayoutSwap } from './useLayoutSwap'
import { DEFAULT_LAYOUT } from '../constants/image-layout'

describe('useLayoutSwap', () => {
  it('starts with default layout', () => {
    const { result } = renderHook(() => useLayoutSwap())
    expect(result.current.layout).toEqual(DEFAULT_LAYOUT)
  })

  it('swaps categories when changing a slot', () => {
    const { result } = renderHook(() => useLayoutSwap())
    // Default: top=music, bottom-left=book, bottom-right=movie
    act(() => {
      result.current.handleLayoutChange('top', 'book')
    })
    // book goes to top, music goes to where book was (bottom-left)
    expect(result.current.layout.top).toBe('book')
    expect(result.current.layout['bottom-left']).toBe('music')
    expect(result.current.layout['bottom-right']).toBe('movie')
  })

  it('does nothing when selecting the same category already in slot', () => {
    const { result } = renderHook(() => useLayoutSwap())
    act(() => {
      result.current.handleLayoutChange('top', 'music') // already music
    })
    expect(result.current.layout).toEqual(DEFAULT_LAYOUT)
  })

  it('handles triple swap correctly', () => {
    const { result } = renderHook(() => useLayoutSwap())
    // Move movie to top
    act(() => {
      result.current.handleLayoutChange('top', 'movie')
    })
    expect(result.current.layout.top).toBe('movie')
    expect(result.current.layout['bottom-right']).toBe('music')

    // Move book to top
    act(() => {
      result.current.handleLayoutChange('top', 'book')
    })
    expect(result.current.layout.top).toBe('book')
    expect(result.current.layout['bottom-left']).toBe('movie')
    expect(result.current.layout['bottom-right']).toBe('music')
  })
})
