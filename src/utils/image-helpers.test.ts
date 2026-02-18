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
    vi.spyOn(fakeCanvas, 'toBlob').mockImplementation((cb) => {
      cb(fakeBlob)
    })
    vi.mocked(html2canvas).mockResolvedValue(fakeCanvas)

    const el = document.createElement('div')
    const blob = await generateImageBlob(el)

    expect(blob).toBe(fakeBlob)
  })

  it('throws when html2canvas fails', async () => {
    vi.mocked(html2canvas).mockRejectedValue(new Error('canvas error'))

    const el = document.createElement('div')
    await expect(generateImageBlob(el)).rejects.toThrow('canvas error')
  })

  it('throws when canvas produces empty data', async () => {
    const fakeCanvas = document.createElement('canvas')
    fakeCanvas.width = 0
    fakeCanvas.height = 0
    // toBlob with 0-size canvas returns null
    vi.spyOn(fakeCanvas, 'toBlob').mockImplementation((cb) => {
      cb(null)
    })
    vi.mocked(html2canvas).mockResolvedValue(fakeCanvas)

    const el = document.createElement('div')
    await expect(generateImageBlob(el)).rejects.toThrow(
      '画像の生成に失敗しました',
    )
  })
})
