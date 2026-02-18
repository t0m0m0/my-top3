import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { usePreGeneratedImage } from './usePreGeneratedImage'
import type { RefObject } from 'react'

vi.mock('../utils/image-helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/image-helpers')>()
  return {
    ...actual,
    generateImageBlob: vi.fn(),
  }
})

import { generateImageBlob } from '../utils/image-helpers'

describe('usePreGeneratedImage', () => {
  const fakeBlob = new Blob(['fake'], { type: 'image/png' })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null initially', () => {
    const ref = { current: null } as RefObject<HTMLDivElement | null>
    const { result } = renderHook(() => usePreGeneratedImage(ref))
    expect(result.current).toBeNull()
  })

  it('generates image blob when ref has a DOM element', async () => {
    vi.mocked(generateImageBlob).mockResolvedValue(fakeBlob)
    const el = document.createElement('div')
    const ref = { current: el } as RefObject<HTMLDivElement | null>

    const { result } = renderHook(() => usePreGeneratedImage(ref))

    await waitFor(() => {
      expect(result.current).toBe(fakeBlob)
    })
    expect(generateImageBlob).toHaveBeenCalledWith(el)
  })

  it('returns null when ref is undefined', () => {
    const { result } = renderHook(() => usePreGeneratedImage(undefined))
    expect(result.current).toBeNull()
    expect(generateImageBlob).not.toHaveBeenCalled()
  })

  it('returns null when generation fails', async () => {
    vi.mocked(generateImageBlob).mockRejectedValue(new Error('fail'))
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const el = document.createElement('div')
    const ref = { current: el } as RefObject<HTMLDivElement | null>

    const { result } = renderHook(() => usePreGeneratedImage(ref))

    // Wait for the async effect to settle
    await waitFor(() => {
      expect(generateImageBlob).toHaveBeenCalled()
    })
    expect(result.current).toBeNull()
  })

  it('regenerates when ref element changes', async () => {
    const blob1 = new Blob(['img1'], { type: 'image/png' })
    const blob2 = new Blob(['img2'], { type: 'image/png' })
    vi.mocked(generateImageBlob)
      .mockResolvedValueOnce(blob1)
      .mockResolvedValueOnce(blob2)

    const el1 = document.createElement('div')
    const ref = { current: el1 } as RefObject<HTMLDivElement | null>

    const { result, rerender } = renderHook(
      ({ r }) => usePreGeneratedImage(r),
      { initialProps: { r: ref } },
    )

    await waitFor(() => {
      expect(result.current).toBe(blob1)
    })

    const el2 = document.createElement('div')
    const ref2 = { current: el2 } as RefObject<HTMLDivElement | null>
    rerender({ r: ref2 })

    await waitFor(() => {
      expect(result.current).toBe(blob2)
    })
  })
})
