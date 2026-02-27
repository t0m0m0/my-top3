import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../test/test-utils'
import ShareButtons from './ShareButtons'

vi.mock('../utils/share-url', () => ({
  createShortUrl: vi.fn(),
  uploadShareImage: vi.fn().mockResolvedValue(true),
}))

import { createShortUrl, uploadShareImage } from '../utils/share-url'

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
    vi.mocked(createShortUrl).mockReset()
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
          title: 'すきコレ',
          text: `「雨の日に」 #すきコレ\n${window.location.href}`,
          url: window.location.href,
        })
      })
    })

    it('shares text without quotes when theme is empty string', async () => {
      const shareMock = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, { share: shareMock })

      render(<ShareButtons theme="" />)
      fireEvent.click(screen.getByLabelText('シェア'))

      await waitFor(() => {
        expect(shareMock).toHaveBeenCalledWith(
          expect.objectContaining({
            text: `#すきコレ\n${window.location.href}`,
          }),
        )
      })
    })

    it('shares text and URL without theme (URL embedded in text)', async () => {
      const shareMock = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, { share: shareMock })

      render(<ShareButtons />)
      fireEvent.click(screen.getByLabelText('シェア'))

      await waitFor(() => {
        expect(shareMock).toHaveBeenCalledWith({
          title: 'すきコレ',
          text: `#すきコレ\n${window.location.href}`,
          url: window.location.href,
        })
      })
    })

    it('shares text+URL only (no image attachment)', async () => {
      const shareMock = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, { share: shareMock })

      render(<ShareButtons theme="テスト" />)
      fireEvent.click(screen.getByLabelText('シェア'))

      await waitFor(() => {
        expect(shareMock).toHaveBeenCalledWith({
          title: 'すきコレ',
          text: `「テスト」 #すきコレ\n${window.location.href}`,
          url: window.location.href,
        })
      })
      // No files property
      expect(shareMock.mock.calls[0][0]).not.toHaveProperty('files')
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
  })

  describe('OGP image upload', () => {
    it('uploads preGeneratedBlob for OGP when existingShareId is available', async () => {
      vi.mocked(uploadShareImage).mockClear()
      const preBlob = new Blob(['image-data'], { type: 'image/png' })

      render(
        <ShareButtons
          theme="テスト"
          preGeneratedBlob={preBlob}
          existingShareId="abc123"
        />,
      )

      await waitFor(() => {
        expect(uploadShareImage).toHaveBeenCalledWith('abc123', preBlob)
      })
    })

    it('does not upload when preGeneratedBlob is not provided', async () => {
      vi.mocked(uploadShareImage).mockClear()

      render(<ShareButtons theme="テスト" existingShareId="abc123" />)

      // Wait a tick
      await new Promise((r) => setTimeout(r, 50))
      expect(uploadShareImage).not.toHaveBeenCalled()
    })

    it('handles upload failure gracefully', async () => {
      vi.mocked(uploadShareImage).mockRejectedValue(new Error('upload failed'))
      const preBlob = new Blob(['image-data'], { type: 'image/png' })

      // Should not throw
      render(
        <ShareButtons
          theme="テスト"
          preGeneratedBlob={preBlob}
          existingShareId="abc123"
        />,
      )

      await waitFor(() => {
        expect(uploadShareImage).toHaveBeenCalled()
      })
    })
  })

  describe('Short URL pre-resolution', () => {
    it('skips createShortUrl when existingShareId is provided', async () => {
      vi.mocked(createShortUrl).mockResolvedValue('/s/new123')
      const shareMock = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, { share: shareMock })

      const shareParams = {
        theme: 'テスト',
        bookId: 'b1',
        musicId: 'm1',
        movieId: 'mv1',
      }

      render(
        <ShareButtons
          theme="テスト"
          shareParams={shareParams}
          existingShareId="abc123"
        />,
      )

      // Should NOT call createShortUrl at all
      await waitFor(() => {
        expect(createShortUrl).not.toHaveBeenCalled()
      })

      // Click share — should use the existing share URL
      fireEvent.click(screen.getByLabelText('シェア'))

      await waitFor(() => {
        expect(shareMock).toHaveBeenCalledWith(
          expect.objectContaining({
            url: `${window.location.origin}/s/abc123`,
          }),
        )
      })
    })

    it('pre-resolves short URL on mount when shareParams are provided', async () => {
      vi.mocked(createShortUrl).mockResolvedValue('/s/abc123')
      const shareMock = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, { share: shareMock })

      const shareParams = {
        theme: 'テスト',
        bookId: 'b1',
        musicId: 'm1',
        movieId: 'mv1',
        bookThumb: 'https://example.com/book.jpg',
        musicThumb: 'https://example.com/music.jpg',
        movieThumb: 'https://example.com/movie.jpg',
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
            text: `「テスト」 #すきコレ\n${window.location.origin}/s/abc123`,
            url: `${window.location.origin}/s/abc123`,
          }),
        )
      })

      // createShortUrl should only have been called once (on mount), not again on share
      expect(createShortUrl).toHaveBeenCalledTimes(1)
    })

    it('does not call createShortUrl when thumbnails are all empty', async () => {
      vi.mocked(createShortUrl).mockResolvedValue('/s/abc123')

      const shareParams = {
        theme: 'テスト',
        bookId: 'b1',
        musicId: 'm1',
        movieId: 'mv1',
        bookThumb: '',
        musicThumb: '',
        movieThumb: '',
      }

      render(<ShareButtons theme="テスト" shareParams={shareParams} />)

      // Wait a tick to confirm no call is made
      await new Promise((r) => setTimeout(r, 50))
      expect(createShortUrl).not.toHaveBeenCalled()
    })

    it('calls createShortUrl once thumbnails are provided', async () => {
      vi.mocked(createShortUrl).mockResolvedValue('/s/abc123')

      const paramsWithoutThumbs = {
        theme: 'テスト',
        bookId: 'b1',
        musicId: 'm1',
        movieId: 'mv1',
        bookThumb: '',
        musicThumb: '',
        movieThumb: '',
      }

      const paramsWithThumbs = {
        ...paramsWithoutThumbs,
        bookThumb: 'https://example.com/book.jpg',
        musicThumb: 'https://example.com/music.jpg',
        movieThumb: 'https://example.com/movie.jpg',
      }

      const { rerender } = render(
        <ShareButtons theme="テスト" shareParams={paramsWithoutThumbs} />,
      )

      // Should not call yet
      await new Promise((r) => setTimeout(r, 50))
      expect(createShortUrl).not.toHaveBeenCalled()

      // Re-render with thumbnails provided
      rerender(<ShareButtons theme="テスト" shareParams={paramsWithThumbs} />)

      await waitFor(() => {
        expect(createShortUrl).toHaveBeenCalledWith(paramsWithThumbs)
      })
    })

    it('calls createShortUrl when some categories have no ID (partial selection)', async () => {
      vi.mocked(createShortUrl).mockResolvedValue('/s/abc123')

      // Only book is selected, music and movie are empty
      const shareParams = {
        theme: 'テスト',
        bookId: 'b1',
        musicId: '',
        movieId: '',
        bookThumb: 'https://example.com/book.jpg',
        musicThumb: '',
        movieThumb: '',
      }

      render(<ShareButtons theme="テスト" shareParams={shareParams} />)

      await waitFor(() => {
        expect(createShortUrl).toHaveBeenCalledWith(shareParams)
      })
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
        bookThumb: 'https://example.com/book.jpg',
        musicThumb: 'https://example.com/music.jpg',
        movieThumb: 'https://example.com/movie.jpg',
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
