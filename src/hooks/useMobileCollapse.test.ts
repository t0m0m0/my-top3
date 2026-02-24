import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMobileCollapse } from './useMobileCollapse'

describe('useMobileCollapse', () => {
  it('選択数 0 のとき expanded=true', () => {
    const { result } = renderHook(() => useMobileCollapse(0))
    expect(result.current.expanded).toBe(true)
  })

  it('選択数 1以上のとき expanded=false', () => {
    const { result } = renderHook(() => useMobileCollapse(1))
    expect(result.current.expanded).toBe(false)
  })

  it('toggle で手動切り替えできる', () => {
    const { result } = renderHook(() => useMobileCollapse(0))
    expect(result.current.expanded).toBe(true)
    act(() => result.current.toggle())
    expect(result.current.expanded).toBe(false)
    act(() => result.current.toggle())
    expect(result.current.expanded).toBe(true)
  })

  it('選択数が変わると手動オーバーライドがリセットされる', () => {
    const { result, rerender } = renderHook(
      ({ count }) => useMobileCollapse(count),
      { initialProps: { count: 0 } },
    )
    // Manually collapse
    act(() => result.current.toggle())
    expect(result.current.expanded).toBe(false)
    // Selection count changes -> reset to auto (count=1 -> auto collapsed)
    rerender({ count: 1 })
    expect(result.current.expanded).toBe(false)
    // Selection count back to 0 -> auto expanded
    rerender({ count: 0 })
    expect(result.current.expanded).toBe(true)
  })
})
