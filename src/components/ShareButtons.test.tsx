import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../test/test-utils'
import ShareButtons from './ShareButtons'
import type { RefObject } from 'react'

vi.mock('../utils/image-helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/image-helpers')>()
  return {
    ...actual,
    generateImageBlob: vi.fn(),
  }
})

vi.mock('../utils/share-url', () => ({
  createShortUrl: vi.fn(),
}))

import { generateImageBlob } from '../utils/image-helpers'
import { createShortUrl } from '../utils/share-url'

describe('ShareButtons', () => {
  let originalClipboard: Clipboard
  let originalShare: typeof navigator.share
  let originalCanShare: typeof navigator.canShare

  beforeEach(() => {
    originalClipboard = navigator.clipboard
    originalShare = navigator.share
    originalCanShare = navigator.canShare
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  afterEach(() => {
    Object.assign(navigator, {
      clipboard: originalClipboard,
      share: originalShare,
      canShare: originalCanShare,
    })
    vi.restoreAllMocks()
  })

  it('renders URL copy button', () => {
    render(<ShareButtons />)
    expect(screen.getByLabelText('URLをコピー')).toBeInTheDocument()
  })

  it('does not render X share button', () => {
    render(<ShareButtons />)
    expect(screen.queryByLabelText('Xでシェア')).not.toBeInTheDocument()
  })

  it('copies URL to clipboard on click', async () => {
    render(<ShareButtons />)
    fireEvent.click(screen.getByLabelText('URLをコピー'))

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        window.location.href,
      )
    })
  })

  it('shows success snackbar after copy', async () => {
    render(<ShareButtons />)
    fireEvent.click(screen.getByLabelText('URLをコピー'))

    await waitFor(() => {
      expect(screen.getByText('URLをコピーしました')).toBeInTheDocument()
    })
  })

  it('falls back to execCommand when clipboard API fails', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('Not allowed')),
      },
    })
    const execCommandMock = vi.fn().mockReturnValue(true)
    document.execCommand = execCommandMock

    render(<ShareButtons />)
    fireEvent.click(screen.getByLabelText('URLをコピー'))

    await waitFor(() => {
      expect(execCommandMock).toHaveBeenCalledWith('copy')
      expect(screen.getByText('URLをコピーしました')).toBeInTheDocument()
    })
  })

  it('shows error snackbar when both clipboard methods fail', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('Not allowed')),
      },
    })
    document.execCommand = vi.fn().mockReturnValue(false)

    render(<ShareButtons />)
    fireEvent.click(screen.getByLabelText('URLをコピー'))

    await waitFor(() => {
      expect(
        screen.getByText(
          'URLのコピーに失敗しました。アドレスバーから手動でコピーしてください。',
        ),
      ).toBeInTheDocument()
    })
  })

  describe('Share button (Web Share API)', () => {
    it('renders share button when Web Share API is available', () => {
      Object.assign(navigator, { share: vi.fn() })
      render(<ShareButtons />)
      expect(screen.getByLabelText('シェア')).toBeInTheDocument()
    })

    it('does not render share button when Web Share API is unavailable', () => {
      Object.assign(navigator, { share: undefined })
      render(<ShareButtons />)
      expect(screen.queryByLabelText('シェア')).not.toBeInTheDocument()
    })

    it('shares text and URL with theme (URL embedded in text)', async () => {
      const shareMock = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, { share: shareMock })

      render(<ShareButtons theme="雨の日に" />)
      fireEvent.click(screen.getByLabelText('シェア'))

      await waitFor(() => {
        expect(shareMock).toHaveBeenCalledWith({
          title: 'My No.1s',
          text: `「雨の日に」 #MyNo1s\n${window.location.href}`,
          url: window.location.href,
        })
      })
    })

    it('shares text and URL without theme (URL embedded in text)', async () => {
      const shareMock = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, { share: shareMock })

      render(<ShareButtons />)
      fireEvent.click(screen.getByLabelText('シェア'))

      await waitFor(() => {
        expect(shareMock).toHaveBeenCalledWith({
          title: 'My No.1s',
          text: `#MyNo1s\n${window.location.href}`,
          url: window.location.href,
        })
      })
    })

    it('shares with image file when captureRef is provided and canShare supports files', async () => {
      const fakeBlob = new Blob(['fake-image'], { type: 'image/png' })
      vi.mocked(generateImageBlob).mockResolvedValue(fakeBlob)
      const shareMock = vi.fn().mockResolvedValue(undefined)
      const canShareMock = vi.fn().mockReturnValue(true)
      Object.assign(navigator, { share: shareMock, canShare: canShareMock })

      const mockCaptureRef = {
        current: document.createElement('div'),
      } as RefObject<HTMLDivElement>

      render(<ShareButtons theme="テスト" captureRef={mockCaptureRef} />)
      fireEvent.click(screen.getByLabelText('シェア'))

      await waitFor(() => {
        expect(shareMock).toHaveBeenCalledWith(
          expect.objectContaining({
            text: `「テスト」 #MyNo1s\n${window.location.href}`,
            url: window.location.href,
            files: expect.arrayContaining([expect.any(File)]),
          }),
        )
      })
    })

    it('uses preGeneratedBlob instead of calling generateImageBlob', async () => {
      const preBlob = new Blob(['pre-generated'], { type: 'image/png' })
      vi.mocked(generateImageBlob).mockClear()
      const shareMock = vi.fn().mockResolvedValue(undefined)
      const canShareMock = vi.fn().mockReturnValue(true)
      Object.assign(navigator, { share: shareMock, canShare: canShareMock })

      const mockCaptureRef = {
        current: document.createElement('div'),
      } as RefObject<HTMLDivElement>

      render(
        <ShareButtons
          theme="テスト"
          captureRef={mockCaptureRef}
          preGeneratedBlob={preBlob}
        />,
      )
      fireEvent.click(screen.getByLabelText('シェア'))

      await waitFor(() => {
        expect(shareMock).toHaveBeenCalled()
      })

      expect(generateImageBlob).not.toHaveBeenCalled()
    })

    it('falls back to text+URL share when canShare does not support files', async () => {
      const fakeBlob = new Blob(['fake-image'], { type: 'image/png' })
      vi.mocked(generateImageBlob).mockResolvedValue(fakeBlob)
      const shareMock = vi.fn().mockResolvedValue(undefined)
      const canShareMock = vi.fn().mockReturnValue(false)
      Object.assign(navigator, { share: shareMock, canShare: canShareMock })

      const mockCaptureRef = {
        current: document.createElement('div'),
      } as RefObject<HTMLDivElement>

      render(<ShareButtons theme="テスト" captureRef={mockCaptureRef} />)
      fireEvent.click(screen.getByLabelText('シェア'))

      await waitFor(() => {
        expect(shareMock).toHaveBeenCalledWith({
          title: 'My No.1s',
          text: `「テスト」 #MyNo1s\n${window.location.href}`,
          url: window.location.href,
        })
      })
    })

    it('falls back to text+URL share when canShare is not available', async () => {
      const shareMock = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, { share: shareMock, canShare: undefined })

      const mockCaptureRef = {
        current: document.createElement('div'),
      } as RefObject<HTMLDivElement>

      render(<ShareButtons theme="テスト" captureRef={mockCaptureRef} />)
      fireEvent.click(screen.getByLabelText('シェア'))

      await waitFor(() => {
        expect(shareMock).toHaveBeenCalledWith({
          title: 'My No.1s',
          text: `「テスト」 #MyNo1s\n${window.location.href}`,
          url: window.location.href,
        })
      })
    })

    it('shows generating state while creating image for share', async () => {
      let resolveBlob!: (blob: Blob) => void
      vi.mocked(generateImageBlob).mockReturnValue(
        new Promise((resolve) => {
          resolveBlob = resolve
        }),
      )
      const shareMock = vi.fn().mockResolvedValue(undefined)
      const canShareMock = vi.fn().mockReturnValue(true)
      Object.assign(navigator, { share: shareMock, canShare: canShareMock })

      const mockCaptureRef = {
        current: document.createElement('div'),
      } as RefObject<HTMLDivElement>

      render(<ShareButtons theme="テスト" captureRef={mockCaptureRef} />)
      fireEvent.click(screen.getByLabelText('シェア'))

      await waitFor(() => {
        expect(screen.getByLabelText('シェア')).toBeDisabled()
      })

      const fakeBlob = new Blob(['fake'], { type: 'image/png' })
      resolveBlob(fakeBlob)

      await waitFor(() => {
        expect(screen.getByLabelText('シェア')).toBeEnabled()
      })
    })

    it('handles share cancellation gracefully (AbortError)', async () => {
      const abortError = new DOMException('Share canceled', 'AbortError')
      const shareMock = vi.fn().mockRejectedValue(abortError)
      Object.assign(navigator, { share: shareMock })

      render(<ShareButtons />)
      fireEvent.click(screen.getByLabelText('シェア'))

      await waitFor(() => {
        expect(shareMock).toHaveBeenCalled()
      })
      expect(screen.queryByText(/シェアに失敗しました/)).not.toBeInTheDocument()
    })

    it('shows error snackbar when share fails', async () => {
      const shareMock = vi.fn().mockRejectedValue(new Error('Share failed'))
      Object.assign(navigator, { share: shareMock })

      render(<ShareButtons />)
      fireEvent.click(screen.getByLabelText('シェア'))

      await waitFor(() => {
        expect(
          screen.getByText(
            'シェアに失敗しました。URLをコピーして手動でシェアしてください。',
          ),
        ).toBeInTheDocument()
      })
    })

    it('shows error snackbar when image generation fails during share', async () => {
      vi.mocked(generateImageBlob).mockRejectedValue(
        new Error('generation failed'),
      )
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const canShareMock = vi.fn().mockReturnValue(true)
      Object.assign(navigator, { share: vi.fn(), canShare: canShareMock })

      const mockCaptureRef = {
        current: document.createElement('div'),
      } as RefObject<HTMLDivElement>

      render(<ShareButtons theme="テスト" captureRef={mockCaptureRef} />)
      fireEvent.click(screen.getByLabelText('シェア'))

      await waitFor(() => {
        expect(
          screen.getByText(
            'シェアに失敗しました。URLをコピーして手動でシェアしてください。',
          ),
        ).toBeInTheDocument()
      })
    })

    it('retries with text-only share when image share fails with NotAllowedError', async () => {
      const preBlob = new Blob(['pre-generated'], { type: 'image/png' })
      const shareMock = vi
        .fn()
        .mockRejectedValueOnce(
          new DOMException('not allowed', 'NotAllowedError'),
        )
        .mockResolvedValueOnce(undefined)
      const canShareMock = vi.fn().mockReturnValue(true)
      Object.assign(navigator, { share: shareMock, canShare: canShareMock })

      const mockCaptureRef = {
        current: document.createElement('div'),
      } as RefObject<HTMLDivElement>

      render(
        <ShareButtons
          theme="テスト"
          captureRef={mockCaptureRef}
          preGeneratedBlob={preBlob}
        />,
      )
      fireEvent.click(screen.getByLabelText('シェア'))

      await waitFor(() => {
        expect(shareMock).toHaveBeenCalledTimes(2)
        expect(shareMock).toHaveBeenLastCalledWith({
          title: 'My No.1s',
          text: `「テスト」 #MyNo1s\n${window.location.href}`,
          url: window.location.href,
        })
      })
    })
  })

  describe('Short URL pre-resolution', () => {
    it('pre-resolves short URL on mount when shareParams are provided', async () => {
      vi.mocked(createShortUrl).mockResolvedValue('/s/abc123')
      const shareMock = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, { share: shareMock })

      const shareParams = {
        theme: 'テスト',
        bookId: 'b1',
        musicId: 'm1',
        movieId: 'mv1',
      }

      render(<ShareButtons theme="テスト" shareParams={shareParams} />)

      // Wait for pre-resolution to complete
      await waitFor(() => {
        expect(createShortUrl).toHaveBeenCalledWith(shareParams)
      })

      // Now click share — should use the pre-resolved URL, not call createShortUrl again
      fireEvent.click(screen.getByLabelText('シェア'))

      await waitFor(() => {
        expect(shareMock).toHaveBeenCalledWith(
          expect.objectContaining({
            text: `「テスト」 #MyNo1s\n${window.location.origin}/s/abc123`,
            url: `${window.location.origin}/s/abc123`,
          }),
        )
      })

      // createShortUrl should only have been called once (on mount), not again on share
      expect(createShortUrl).toHaveBeenCalledTimes(1)
    })

    it('falls back to current URL when pre-resolution fails', async () => {
      vi.mocked(createShortUrl).mockRejectedValue(new Error('network error'))
      const shareMock = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, { share: shareMock })

      const shareParams = {
        theme: 'テスト',
        bookId: 'b1',
        musicId: 'm1',
        movieId: 'mv1',
      }

      render(<ShareButtons theme="テスト" shareParams={shareParams} />)

      // Wait for the failed pre-resolution attempt
      await waitFor(() => {
        expect(createShortUrl).toHaveBeenCalled()
      })

      fireEvent.click(screen.getByLabelText('シェア'))

      await waitFor(() => {
        expect(shareMock).toHaveBeenCalledWith(
          expect.objectContaining({
            url: window.location.href,
          }),
        )
      })
    })
  })
})
