import { describe, it, expect, vi } from 'vitest'
import { generateImageBlob } from './image-helpers'

vi.mock('html2canvas', () => ({
  default: vi.fn(),
}))

import html2canvas from 'html2canvas'

describe('generateImageBlob', () => {
  it('returns a PNG Blob from the given element', async () => {
    const fakeBlob = new Blob(['fake'], { type: 'image/png' })
    const fakeCanvas = document.createElement('canvas')
    vi.spyOn(fakeCanvas, 'toBlob').mockImplementation((cb: BlobCallback) => {
      cb(fakeBlob)
    })
    vi.mocked(html2canvas).mockResolvedValue(fakeCanvas)

    const el = document.createElement('div')
    const blob = await generateImageBlob(el)

    expect(blob).toBe(fakeBlob)
  })

  it('temporarily resets CSS transform during capture', async () => {
    const fakeBlob = new Blob(['fake'], { type: 'image/png' })
    const fakeCanvas = document.createElement('canvas')
    vi.spyOn(fakeCanvas, 'toBlob').mockImplementation((cb: BlobCallback) => {
      cb(fakeBlob)
    })

    let capturedTransform: string | undefined
    vi.mocked(html2canvas).mockImplementation(async (el) => {
      capturedTransform = (el as HTMLElement).style.transform
      return fakeCanvas
    })

    const el = document.createElement('div')
    el.style.transform = 'scale(0.5)'
    el.style.transformOrigin = 'top left'

    await generateImageBlob(el)

    // During capture, transform should be 'none'
    expect(capturedTransform).toBe('none')
    // After capture, transform should be restored
    expect(el.style.transform).toBe('scale(0.5)')
    expect(el.style.transformOrigin).toBe('top left')
  })

  it('restores transform even when html2canvas throws', async () => {
    vi.mocked(html2canvas).mockRejectedValue(new Error('canvas error'))

    const el = document.createElement('div')
    el.style.transform = 'scale(0.3)'

    await expect(generateImageBlob(el)).rejects.toThrow('canvas error')
    expect(el.style.transform).toBe('scale(0.3)')
  })

  it('throws when html2canvas fails', async () => {
    vi.mocked(html2canvas).mockRejectedValue(new Error('canvas error'))

    const el = document.createElement('div')
    await expect(generateImageBlob(el)).rejects.toThrow('canvas error')
  })

  it('passes custom size to html2canvas', async () => {
    const fakeBlob = new Blob(['fake'], { type: 'image/png' })
    const fakeCanvas = document.createElement('canvas')
    vi.spyOn(fakeCanvas, 'toBlob').mockImplementation((cb: BlobCallback) => {
      cb(fakeBlob)
    })
    vi.mocked(html2canvas).mockResolvedValue(fakeCanvas)

    const el = document.createElement('div')
    await generateImageBlob(el, { width: 1080, height: 1920 })

    expect(html2canvas).toHaveBeenCalledWith(
      el,
      expect.objectContaining({
        width: 1080,
        height: 1920,
      }),
    )
  })

  it('defaults to 1080x1080 when no size given', async () => {
    const fakeBlob = new Blob(['fake'], { type: 'image/png' })
    const fakeCanvas = document.createElement('canvas')
    vi.spyOn(fakeCanvas, 'toBlob').mockImplementation((cb: BlobCallback) => {
      cb(fakeBlob)
    })
    vi.mocked(html2canvas).mockResolvedValue(fakeCanvas)

    const el = document.createElement('div')
    await generateImageBlob(el)

    expect(html2canvas).toHaveBeenCalledWith(
      el,
      expect.objectContaining({
        width: 1080,
        height: 1080,
      }),
    )
  })

  it('throws when canvas produces empty data', async () => {
    const fakeCanvas = document.createElement('canvas')
    fakeCanvas.width = 0
    fakeCanvas.height = 0
    // toBlob with 0-size canvas returns null
    vi.spyOn(fakeCanvas, 'toBlob').mockImplementation((cb: BlobCallback) => {
      cb(null)
    })
    vi.mocked(html2canvas).mockResolvedValue(fakeCanvas)

    const el = document.createElement('div')
    await expect(generateImageBlob(el)).rejects.toThrow(
      '画像の生成に失敗しました',
    )
  })
})
