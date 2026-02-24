import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { createRef } from 'react'
import { useMergedRef } from './useMergedRef'

describe('useMergedRef', () => {
  it('updates a RefObject', () => {
    const ref = createRef<HTMLDivElement>()
    const { result } = renderHook(() => useMergedRef(ref))

    const node = document.createElement('div')
    result.current(node)

    expect(ref.current).toBe(node)
  })

  it('calls a callback ref', () => {
    const callbackRef = vi.fn()
    const { result } = renderHook(() => useMergedRef(callbackRef))

    const node = document.createElement('div')
    result.current(node)

    expect(callbackRef).toHaveBeenCalledWith(node)
  })

  it('merges multiple refs', () => {
    const refObject = createRef<HTMLDivElement>()
    const callbackRef = vi.fn()
    const { result } = renderHook(() => useMergedRef(refObject, callbackRef))

    const node = document.createElement('div')
    result.current(node)

    expect(refObject.current).toBe(node)
    expect(callbackRef).toHaveBeenCalledWith(node)
  })

  it('handles null refs gracefully', () => {
    const callbackRef = vi.fn()
    const { result } = renderHook(() =>
      useMergedRef(null, undefined, callbackRef),
    )

    const node = document.createElement('div')
    result.current(node)

    expect(callbackRef).toHaveBeenCalledWith(node)
  })

  it('sets node to null on unmount', () => {
    const refObject = createRef<HTMLDivElement>()
    const callbackRef = vi.fn()
    const { result } = renderHook(() => useMergedRef(refObject, callbackRef))

    const node = document.createElement('div')
    result.current(node)
    result.current(null)

    expect(refObject.current).toBeNull()
    expect(callbackRef).toHaveBeenCalledWith(null)
  })

  it('returns a stable callback when refs do not change', () => {
    const ref = createRef<HTMLDivElement>()
    const { result, rerender } = renderHook(() => useMergedRef(ref))

    const first = result.current
    rerender()

    expect(result.current).toBe(first)
  })
})
