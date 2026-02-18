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

import { generateImageBlob } from '../utils/image-helpers'

describe('ShareButtons', () => {
  let originalClipboard: Clipboard
  let originalShare: typeof navigator.share

  beforeEach(() => {
    originalClipboard = navigator.clipboard
    originalShare = navigator.share
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
    })
    vi.restoreAllMocks()
  })

  it('renders URL copy button', () => {
    render(<ShareButtons />)
    expect(screen.getByLabelText('URLをコピー')).toBeInTheDocument()
  })

  it('renders X share button', () => {
    render(<ShareButtons />)
    expect(screen.getByLabelText('Xでシェア')).toBeInTheDocument()
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

  it('opens X intent URL on share click', () => {
    vi.spyOn(window, 'open').mockReturnValue({} as Window)
    render(<ShareButtons theme="テスト" />)
    fireEvent.click(screen.getByLabelText('Xでシェア'))

    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('includes theme and #MyNo1s hashtag in X share text', () => {
    vi.spyOn(window, 'open').mockReturnValue({} as Window)
    render(<ShareButtons theme="雨の日に" />)
    fireEvent.click(screen.getByLabelText('Xでシェア'))

    const url = (window.open as ReturnType<typeof vi.fn>).mock
      .calls[0]?.[0] as string
    expect(url).toContain(encodeURIComponent('My No.1s 「雨の日に」'))
    expect(url).toContain(encodeURIComponent('#MyNo1s'))
  })

  it('includes #MyNo1s hashtag when theme is not provided', () => {
    vi.spyOn(window, 'open').mockReturnValue({} as Window)
    render(<ShareButtons />)
    fireEvent.click(screen.getByLabelText('Xでシェア'))

    const url = (window.open as ReturnType<typeof vi.fn>).mock
      .calls[0]?.[0] as string
    expect(url).toContain(encodeURIComponent('My No.1s'))
    expect(url).toContain(encodeURIComponent('#MyNo1s'))
    expect(url).not.toContain(encodeURIComponent('「'))
  })

  it('falls back to same-tab navigation when popup is blocked', () => {
    vi.spyOn(window, 'open').mockReturnValue(null)
    const locationSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      href: 'http://localhost/',
    })
    const hrefSetter = vi.fn()
    Object.defineProperty(window.location, 'href', {
      set: hrefSetter,
      configurable: true,
    })

    render(<ShareButtons />)
    fireEvent.click(screen.getByLabelText('Xでシェア'))

    expect(window.open).toHaveBeenCalled()
    expect(hrefSetter).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
    )

    locationSpy.mockRestore()
  })

  describe('X share with image', () => {
    const mockCaptureRef = {
      current: document.createElement('div'),
    } as RefObject<HTMLDivElement>
    const fakeBlob = new Blob(['fake-image'], { type: 'image/png' })

    it('downloads image and opens X intent when captureRef is provided (even when Web Share API supports files)', async () => {
      vi.mocked(generateImageBlob).mockResolvedValue(fakeBlob)
      const shareMock = vi.fn().mockResolvedValue(undefined)
      const canShareMock = vi.fn().mockReturnValue(true)
      Object.assign(navigator, { share: shareMock, canShare: canShareMock })
      vi.spyOn(window, 'open').mockReturnValue({} as Window)
      vi.stubGlobal('URL', {
        ...globalThis.URL,
        createObjectURL: vi.fn(() => 'blob:mock-url'),
        revokeObjectURL: vi.fn(),
      })

      render(<ShareButtons theme="テスト" captureRef={mockCaptureRef} />)
      fireEvent.click(screen.getByLabelText('Xでシェア'))

      await waitFor(() => {
        expect(generateImageBlob).toHaveBeenCalledWith(mockCaptureRef.current)
      })

      // Should NOT use navigator.share — always open X intent directly
      expect(shareMock).not.toHaveBeenCalled()

      await waitFor(() => {
        expect(window.open).toHaveBeenCalledWith(
          expect.stringContaining('twitter.com/intent/tweet'),
          '_blank',
          'noopener,noreferrer',
        )
      })

      await waitFor(() => {
        expect(
          screen.getByText(
            '画像をダウンロードしました。X投稿画面で添付してください。',
          ),
        ).toBeInTheDocument()
      })
    })

    it('falls back to download + intent URL when Web Share API does not support files', async () => {
      vi.mocked(generateImageBlob).mockResolvedValue(fakeBlob)
      Object.assign(navigator, { share: undefined, canShare: undefined })
      vi.spyOn(window, 'open').mockReturnValue({} as Window)
      vi.stubGlobal('URL', {
        ...globalThis.URL,
        createObjectURL: vi.fn(() => 'blob:mock-url'),
        revokeObjectURL: vi.fn(),
      })

      render(<ShareButtons theme="テスト" captureRef={mockCaptureRef} />)
      fireEvent.click(screen.getByLabelText('Xでシェア'))

      await waitFor(() => {
        expect(generateImageBlob).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(window.open).toHaveBeenCalledWith(
          expect.stringContaining('twitter.com/intent/tweet'),
          '_blank',
          'noopener,noreferrer',
        )
      })

      // Should show guidance snackbar about downloaded image
      await waitFor(() => {
        expect(
          screen.getByText(
            '画像をダウンロードしました。X投稿画面で添付してください。',
          ),
        ).toBeInTheDocument()
      })
    })

    it('shows generating state while creating image', async () => {
      let resolveBlob!: (blob: Blob) => void
      vi.mocked(generateImageBlob).mockReturnValue(
        new Promise((resolve) => {
          resolveBlob = resolve
        }),
      )
      const shareMock = vi.fn().mockResolvedValue(undefined)
      const canShareMock = vi.fn().mockReturnValue(true)
      Object.assign(navigator, { share: shareMock, canShare: canShareMock })

      render(<ShareButtons theme="テスト" captureRef={mockCaptureRef} />)
      fireEvent.click(screen.getByLabelText('Xでシェア'))

      // Button should be disabled during generation
      await waitFor(() => {
        expect(screen.getByLabelText('Xでシェア')).toBeDisabled()
      })

      resolveBlob(fakeBlob)

      await waitFor(() => {
        expect(screen.getByLabelText('Xでシェア')).toBeEnabled()
      })
    })

    it('never uses navigator.share for X share — always downloads + opens intent', async () => {
      vi.mocked(generateImageBlob).mockResolvedValue(fakeBlob)
      const shareMock = vi.fn().mockResolvedValue(undefined)
      const canShareMock = vi.fn().mockReturnValue(true)
      Object.assign(navigator, { share: shareMock, canShare: canShareMock })
      vi.spyOn(window, 'open').mockReturnValue({} as Window)
      vi.stubGlobal('URL', {
        ...globalThis.URL,
        createObjectURL: vi.fn(() => 'blob:mock-url'),
        revokeObjectURL: vi.fn(),
      })

      render(<ShareButtons theme="テスト" captureRef={mockCaptureRef} />)
      fireEvent.click(screen.getByLabelText('Xでシェア'))

      await waitFor(() => {
        expect(window.open).toHaveBeenCalledWith(
          expect.stringContaining('twitter.com/intent/tweet'),
          '_blank',
          'noopener,noreferrer',
        )
      })

      // navigator.share should never be called from the X button
      expect(shareMock).not.toHaveBeenCalled()

      await waitFor(() => {
        expect(
          screen.getByText(
            '画像をダウンロードしました。X投稿画面で添付してください。',
          ),
        ).toBeInTheDocument()
      })
    })

    it('shows error snackbar when image generation fails', async () => {
      vi.mocked(generateImageBlob).mockRejectedValue(
        new Error('generation failed'),
      )
      vi.spyOn(console, 'error').mockImplementation(() => {})

      render(<ShareButtons theme="テスト" captureRef={mockCaptureRef} />)
      fireEvent.click(screen.getByLabelText('Xでシェア'))

      await waitFor(() => {
        expect(
          screen.getByText(
            '画像の生成に失敗しました。もう一度お試しください。',
          ),
        ).toBeInTheDocument()
      })
    })

    it('uses preGeneratedBlob without calling generateImageBlob when available', async () => {
      const preBlob = new Blob(['pre-generated'], { type: 'image/png' })
      vi.mocked(generateImageBlob).mockClear()
      vi.spyOn(window, 'open').mockReturnValue({} as Window)
      vi.stubGlobal('URL', {
        ...globalThis.URL,
        createObjectURL: vi.fn(() => 'blob:mock-url'),
        revokeObjectURL: vi.fn(),
      })

      render(
        <ShareButtons
          theme="テスト"
          captureRef={mockCaptureRef}
          preGeneratedBlob={preBlob}
        />,
      )
      fireEvent.click(screen.getByLabelText('Xでシェア'))

      await waitFor(() => {
        expect(window.open).toHaveBeenCalledWith(
          expect.stringContaining('twitter.com/intent/tweet'),
          '_blank',
          'noopener,noreferrer',
        )
      })

      // Should NOT have called generateImageBlob since preGeneratedBlob was provided
      expect(generateImageBlob).not.toHaveBeenCalled()
    })

    it('falls back to text-only X intent when captureRef is not provided', () => {
      vi.mocked(generateImageBlob).mockClear()
      vi.spyOn(window, 'open').mockReturnValue({} as Window)
      render(<ShareButtons theme="テスト" />)
      fireEvent.click(screen.getByLabelText('Xでシェア'))

      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('twitter.com/intent/tweet'),
        '_blank',
        'noopener,noreferrer',
      )
      expect(generateImageBlob).not.toHaveBeenCalled()
    })
  })

  describe('Web Share API', () => {
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

    it('calls navigator.share with correct data including theme', async () => {
      const shareMock = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, { share: shareMock })

      render(<ShareButtons theme="雨の日に" />)
      fireEvent.click(screen.getByLabelText('シェア'))

      await waitFor(() => {
        expect(shareMock).toHaveBeenCalledWith({
          title: 'My No.1s',
          text: 'My No.1s 「雨の日に」 #MyNo1s',
          url: window.location.href,
        })
      })
    })

    it('calls navigator.share with correct data without theme', async () => {
      const shareMock = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, { share: shareMock })

      render(<ShareButtons />)
      fireEvent.click(screen.getByLabelText('シェア'))

      await waitFor(() => {
        expect(shareMock).toHaveBeenCalledWith({
          title: 'My No.1s',
          text: 'My No.1s #MyNo1s',
          url: window.location.href,
        })
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
      // AbortError should not show error snackbar
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
})
