import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme, MAX_THEME_LENGTH } from './useTheme'

describe('useTheme', () => {
  it('has empty initial state', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('')
    expect(result.current.isValid).toBe(true)
  })

  it('updates theme value', () => {
    const { result } = renderHook(() => useTheme())
    act(() => {
      result.current.setTheme('テスト')
    })
    expect(result.current.theme).toBe('テスト')
  })

  it('is valid at max length', () => {
    const { result } = renderHook(() => useTheme())
    act(() => {
      result.current.setTheme('a'.repeat(MAX_THEME_LENGTH))
    })
    expect(result.current.isValid).toBe(true)
  })

  it('is invalid over max length', () => {
    const { result } = renderHook(() => useTheme())
    act(() => {
      result.current.setTheme('a'.repeat(MAX_THEME_LENGTH + 1))
    })
    expect(result.current.isValid).toBe(false)
  })

  it('exports MAX_THEME_LENGTH as 50', () => {
    expect(MAX_THEME_LENGTH).toBe(50)
  })
})
