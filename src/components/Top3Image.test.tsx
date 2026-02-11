import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../test/test-utils'
import Top3Image from './Top3Image'
import type { SearchResultItem } from '../types/common'

vi.mock('html2canvas', () => ({
  default: vi.fn(() =>
    Promise.resolve({
      toDataURL: () => 'data:image/png;base64,mock',
    }),
  ),
}))

// Mock ResizeObserver for responsive scale tests
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', MockResizeObserver)

const mockBook: SearchResultItem = {
  id: 'book1',
  category: 'book',
  title: 'Test Book',
  subtitle: 'Author Name',
  thumbnailUrl: 'https://example.com/book.jpg',
  externalUrl: 'https://example.com/book',
}

const mockMusic: SearchResultItem = {
  id: 'music1',
  category: 'music',
  title: 'Test Album',
  subtitle: 'Artist Name',
  thumbnailUrl: 'https://example.com/music.jpg',
  externalUrl: 'https://example.com/music',
}

const mockMovie: SearchResultItem = {
  id: 'movie1',
  category: 'movie',
  title: 'Test Movie',
  subtitle: 'Director Name',
  thumbnailUrl: 'https://example.com/movie.jpg',
  externalUrl: 'https://example.com/movie',
}

const originalCreateElement = document.createElement.bind(document)

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

function mockCreateElementForAnchor() {
  const clickSpy = vi.fn()
  let capturedDownload = ''
  let capturedHref = ''

  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'a') {
      return {
        click: clickSpy,
        set download(v: string) {
          capturedDownload = v
        },
        get download() {
          return capturedDownload
        },
        set href(v: string) {
          capturedHref = v
        },
        get href() {
          return capturedHref
        },
      } as unknown as HTMLAnchorElement
    }
    return originalCreateElement(tag)
  })

  return {
    clickSpy,
    getDownload: () => capturedDownload,
    getHref: () => capturedHref,
  }
}

describe('Top3Image', () => {
  describe('rendering', () => {
    it('renders capture area with 1080x1080 dimensions', () => {
      render(
        <Top3Image
          theme=""
          book={mockBook}
          music={mockMusic}
          movie={mockMovie}
        />,
      )
      const captureArea = screen.getByTestId('top3-image-capture')
      expect(captureArea).toBeInTheDocument()
      expect(captureArea.style.width).toBe('1080px')
      expect(captureArea.style.height).toBe('1080px')
    })

    it('displays theme text when provided', () => {
      render(
        <Top3Image
          theme="雨の日に楽しむ"
          book={mockBook}
          music={mockMusic}
          movie={mockMovie}
        />,
      )
      expect(screen.getByText('「雨の日に楽しむ」')).toBeInTheDocument()
    })

    it('does not display theme when empty', () => {
      render(
        <Top3Image
          theme=""
          book={mockBook}
          music={mockMusic}
          movie={mockMovie}
        />,
      )
      expect(screen.queryByText(/「.*」/)).not.toBeInTheDocument()
    })

    it('displays all three work titles and subtitles', () => {
      render(
        <Top3Image
          theme=""
          book={mockBook}
          music={mockMusic}
          movie={mockMovie}
        />,
      )
      expect(screen.getByText('Test Book')).toBeInTheDocument()
      expect(screen.getByText('Test Album')).toBeInTheDocument()
      expect(screen.getByText('Test Movie')).toBeInTheDocument()
      expect(screen.getByText('Author Name')).toBeInTheDocument()
      expect(screen.getByText('Artist Name')).toBeInTheDocument()
      expect(screen.getByText('Director Name')).toBeInTheDocument()
    })

    it('displays category labels and #1 badges', () => {
      render(
        <Top3Image
          theme=""
          book={mockBook}
          music={mockMusic}
          movie={mockMovie}
        />,
      )
      expect(screen.getByText('BOOK')).toBeInTheDocument()
      expect(screen.getByText('MUSIC')).toBeInTheDocument()
      expect(screen.getByText('MOVIE')).toBeInTheDocument()
      expect(screen.getAllByText('#1')).toHaveLength(3)
    })

    it('shows download button', () => {
      render(
        <Top3Image
          theme=""
          book={mockBook}
          music={mockMusic}
          movie={mockMovie}
        />,
      )
      expect(screen.getByText('画像をダウンロード')).toBeInTheDocument()
    })

    it('handles null items gracefully', () => {
      render(<Top3Image theme="" book={null} music={null} movie={null} />)
      expect(screen.getAllByText('No Data')).toHaveLength(3)
    })

    it('handles mixed null and non-null items', () => {
      render(
        <Top3Image theme="" book={mockBook} music={null} movie={mockMovie} />,
      )
      expect(screen.getByText('Test Book')).toBeInTheDocument()
      expect(screen.getByText('Test Movie')).toBeInTheDocument()
      expect(screen.getAllByText('No Data')).toHaveLength(1)
    })
  })

  describe('download', () => {
    it('calls html2canvas with correct options and triggers download', async () => {
      const html2canvas = (await import('html2canvas')).default
      const { clickSpy } = mockCreateElementForAnchor()

      render(
        <Top3Image
          theme=""
          book={mockBook}
          music={mockMusic}
          movie={mockMovie}
        />,
      )

      fireEvent.click(screen.getByText('画像をダウンロード'))

      await waitFor(() => {
        expect(html2canvas).toHaveBeenCalledTimes(1)
      })

      const callArgs = vi.mocked(html2canvas).mock.calls[0][1]
      expect(callArgs).toMatchObject({
        width: 1080,
        height: 1080,
        useCORS: true,
        allowTaint: false,
      })

      expect(clickSpy).toHaveBeenCalledTimes(1)
    })

    it('uses theme in download filename when provided', async () => {
      const html2canvas = (await import('html2canvas')).default
      const { getDownload } = mockCreateElementForAnchor()

      render(
        <Top3Image
          theme="テストテーマ"
          book={mockBook}
          music={mockMusic}
          movie={mockMovie}
        />,
      )

      fireEvent.click(screen.getByText('画像をダウンロード'))

      await waitFor(() => {
        expect(html2canvas).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(getDownload()).toBe('my-top3-テストテーマ.png')
      })
    })

    it('sanitizes special characters in theme for filename', async () => {
      const html2canvas = (await import('html2canvas')).default
      const { getDownload } = mockCreateElementForAnchor()

      render(
        <Top3Image
          theme='test/path:name*"bad'
          book={mockBook}
          music={mockMusic}
          movie={mockMovie}
        />,
      )

      fireEvent.click(screen.getByText('画像をダウンロード'))

      await waitFor(() => {
        expect(html2canvas).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(getDownload()).toBe('my-top3-test_path_name__bad.png')
      })
    })

    it('shows loading state and disables button during generation', async () => {
      const html2canvas = (await import('html2canvas')).default
      let resolveCanvas!: (value: HTMLCanvasElement) => void
      vi.mocked(html2canvas).mockReturnValueOnce(
        new Promise<HTMLCanvasElement>((resolve) => {
          resolveCanvas = resolve
        }),
      )

      render(
        <Top3Image
          theme=""
          book={mockBook}
          music={mockMusic}
          movie={mockMovie}
        />,
      )

      fireEvent.click(screen.getByText('画像をダウンロード'))

      await waitFor(() => {
        expect(screen.getByText('生成中...')).toBeInTheDocument()
      })
      expect(screen.getByRole('button')).toBeDisabled()

      resolveCanvas({
        toDataURL: () => 'data:image/png;base64,mock',
      } as unknown as HTMLCanvasElement)

      await waitFor(() => {
        expect(screen.getByText('画像をダウンロード')).toBeInTheDocument()
      })
      expect(screen.getByRole('button')).toBeEnabled()
    })

    it('shows error when toDataURL returns empty', async () => {
      const html2canvas = (await import('html2canvas')).default
      vi.mocked(html2canvas).mockResolvedValueOnce({
        toDataURL: () => 'data:,',
      } as unknown as HTMLCanvasElement)

      render(
        <Top3Image
          theme=""
          book={mockBook}
          music={mockMusic}
          movie={mockMovie}
        />,
      )

      fireEvent.click(screen.getByText('画像をダウンロード'))

      await waitFor(() => {
        expect(
          screen.getByText('画像の生成に失敗しました。画像データが空です。'),
        ).toBeInTheDocument()
      })
    })
  })

  describe('error handling', () => {
    it('shows error message when html2canvas fails', async () => {
      const html2canvas = (await import('html2canvas')).default
      vi.mocked(html2canvas).mockRejectedValueOnce(new Error('Canvas failed'))
      vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <Top3Image
          theme=""
          book={mockBook}
          music={mockMusic}
          movie={mockMovie}
        />,
      )

      fireEvent.click(screen.getByText('画像をダウンロード'))

      await waitFor(() => {
        expect(
          screen.getByText(
            '画像の生成に失敗しました。もう一度お試しください。',
          ),
        ).toBeInTheDocument()
      })
    })

    it('shows CORS-specific error for SecurityError', async () => {
      const html2canvas = (await import('html2canvas')).default
      const securityError = new DOMException('Tainted canvas', 'SecurityError')
      vi.mocked(html2canvas).mockRejectedValueOnce(securityError)
      vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <Top3Image
          theme=""
          book={mockBook}
          music={mockMusic}
          movie={mockMovie}
        />,
      )

      fireEvent.click(screen.getByText('画像をダウンロード'))

      await waitFor(() => {
        expect(
          screen.getByText(
            '画像の取得に失敗しました。外部画像のCORS設定が原因の可能性があります。',
          ),
        ).toBeInTheDocument()
      })
    })

    it('resets generating state after error', async () => {
      const html2canvas = (await import('html2canvas')).default
      vi.mocked(html2canvas).mockRejectedValueOnce(new Error('fail'))
      vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <Top3Image
          theme=""
          book={mockBook}
          music={mockMusic}
          movie={mockMovie}
        />,
      )

      fireEvent.click(screen.getByText('画像をダウンロード'))

      await waitFor(() => {
        expect(screen.getByText('画像をダウンロード')).toBeInTheDocument()
      })
      expect(screen.getByRole('button')).toBeEnabled()
    })

    it('clears previous error on new download attempt', async () => {
      const html2canvas = (await import('html2canvas')).default
      vi.mocked(html2canvas).mockRejectedValueOnce(new Error('fail'))
      vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <Top3Image
          theme=""
          book={mockBook}
          music={mockMusic}
          movie={mockMovie}
        />,
      )

      fireEvent.click(screen.getByText('画像をダウンロード'))

      await waitFor(() => {
        expect(
          screen.getByText(
            '画像の生成に失敗しました。もう一度お試しください。',
          ),
        ).toBeInTheDocument()
      })

      // Second attempt succeeds
      vi.mocked(html2canvas).mockResolvedValueOnce({
        toDataURL: () => 'data:image/png;base64,mock',
      } as unknown as HTMLCanvasElement)

      fireEvent.click(screen.getByText('画像をダウンロード'))

      await waitFor(() => {
        expect(
          screen.queryByText(
            '画像の生成に失敗しました。もう一度お試しください。',
          ),
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('responsive scaling', () => {
    it('renders capture area with dynamic scale based on container width', () => {
      render(
        <Top3Image
          theme=""
          book={mockBook}
          music={mockMusic}
          movie={mockMovie}
        />,
      )
      const captureArea = screen.getByTestId('top3-image-capture')
      // Scale should be applied (default 0.5 or based on container width)
      expect(captureArea.style.transform).toMatch(/^scale\(/)
      expect(captureArea.style.transformOrigin).toBe('top left')
    })
  })
})
