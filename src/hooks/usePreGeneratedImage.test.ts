import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { usePreGeneratedImage } from './usePreGeneratedImage'

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

  it('returns null when element is null', () => {
    const { result } = renderHook(() => usePreGeneratedImage(null))
    expect(result.current).toBeNull()
  })

  it('returns null when element is undefined', () => {
    const { result } = renderHook(() => usePreGeneratedImage(undefined))
    expect(result.current).toBeNull()
    expect(generateImageBlob).not.toHaveBeenCalled()
  })

  it('generates image blob when element is provided', async () => {
    vi.mocked(generateImageBlob).mockResolvedValue(fakeBlob)
    const el = document.createElement('div')

    const { result } = renderHook(() => usePreGeneratedImage(el))

    await waitFor(() => {
      expect(result.current).toBe(fakeBlob)
    })
    expect(generateImageBlob).toHaveBeenCalledWith(el)
  })

  it('returns null when generation fails', async () => {
    vi.mocked(generateImageBlob).mockRejectedValue(new Error('fail'))
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const el = document.createElement('div')

    const { result } = renderHook(() => usePreGeneratedImage(el))

    await waitFor(() => {
      expect(generateImageBlob).toHaveBeenCalled()
    })
    expect(result.current).toBeNull()
  })

  it('regenerates when element changes', async () => {
    const blob1 = new Blob(['img1'], { type: 'image/png' })
    const blob2 = new Blob(['img2'], { type: 'image/png' })
    vi.mocked(generateImageBlob)
      .mockResolvedValueOnce(blob1)
      .mockResolvedValueOnce(blob2)

    const el1 = document.createElement('div')

    const { result, rerender } = renderHook(
      ({ el }) => usePreGeneratedImage(el),
      { initialProps: { el: el1 as HTMLDivElement | null } },
    )

    await waitFor(() => {
      expect(result.current).toBe(blob1)
    })

    const el2 = document.createElement('div')
    rerender({ el: el2 })

    await waitFor(() => {
      expect(result.current).toBe(blob2)
    })
  })
})
