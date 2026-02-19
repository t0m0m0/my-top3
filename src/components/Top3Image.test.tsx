import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../test/test-utils'
import Top3Image from './Top3Image'
import type { SearchResultItem } from '../types/common'

const fakeBlob = new Blob(['fake-image'], { type: 'image/png' })

function createMockCanvas() {
  return {
    toDataURL: () => 'data:image/png;base64,mock',
    toBlob: (cb: (blob: Blob | null) => void) => cb(fakeBlob),
  }
}

vi.mock('html2canvas', () => ({
  default: vi.fn(() => Promise.resolve(createMockCanvas())),
}))

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
  vi.stubGlobal('URL', {
    ...globalThis.URL,
    createObjectURL: vi.fn(() => 'blob:mock-url'),
    revokeObjectURL: vi.fn(),
  })
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

function getTodayDate(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
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
      expect(screen.getByText('「 雨の日に楽しむ 」')).toBeInTheDocument()
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

    it('displays category labels', () => {
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
    })

    it('does not display #1 badges', () => {
      render(
        <Top3Image
          theme=""
          book={mockBook}
          music={mockMusic}
          movie={mockMovie}
        />,
      )
      expect(screen.queryByText('#1')).not.toBeInTheDocument()
    })

    it('does not display My No.1s title', () => {
      render(
        <Top3Image
          theme=""
          book={mockBook}
          music={mockMusic}
          movie={mockMovie}
        />,
      )
      expect(screen.queryByText('My No.1s')).not.toBeInTheDocument()
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

    it('handles null items gracefully with fallback', () => {
      render(<Top3Image theme="" book={null} music={null} movie={null} />)
      expect(screen.getAllByText('No Data')).toHaveLength(3)
    })

    it('displays data credits text in the capture area', () => {
      render(
        <Top3Image
          theme=""
          book={mockBook}
          music={mockMusic}
          movie={mockMovie}
        />,
      )
      const captureArea = screen.getByTestId('top3-image-capture')
      expect(captureArea).toHaveTextContent('Data by TMDb & Last.fm')
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

  describe('layout configuration', () => {
    it('renders layout selector with 3 slots', () => {
      render(
        <Top3Image
          theme=""
          book={mockBook}
          music={mockMusic}
          movie={mockMovie}
        />,
      )
      expect(screen.getByTestId('layout-selector')).toBeInTheDocument()
    })

    it('defaults to music on top, book bottom-left, movie bottom-right', () => {
      render(
        <Top3Image
          theme=""
          book={mockBook}
          music={mockMusic}
          movie={mockMovie}
        />,
      )
      const topSlot = screen.getByTestId('slot-top')
      const bottomLeftSlot = screen.getByTestId('slot-bottom-left')
      const bottomRightSlot = screen.getByTestId('slot-bottom-right')
      expect(topSlot).toHaveTextContent('Test Album')
      expect(bottomLeftSlot).toHaveTextContent('Test Book')
      expect(bottomRightSlot).toHaveTextContent('Test Movie')
    })

    it('can change layout by swapping slots', () => {
      render(
        <Top3Image
          theme=""
          book={mockBook}
          music={mockMusic}
          movie={mockMovie}
        />,
      )
      // Click the top slot select and change to book
      const topSelect = screen.getByTestId('select-top')
      fireEvent.change(topSelect, { target: { value: 'book' } })

      const topSlot = screen.getByTestId('slot-top')
      expect(topSlot).toHaveTextContent('Test Book')
    })

    it('swaps categories when selecting one already in use', () => {
      render(
        <Top3Image
          theme=""
          book={mockBook}
          music={mockMusic}
          movie={mockMovie}
        />,
      )
      // Default: top=music, bottom-left=book, bottom-right=movie
      // Change top to book → music should go to bottom-left (where book was)
      const topSelect = screen.getByTestId('select-top')
      fireEvent.change(topSelect, { target: { value: 'book' } })

      const topSlot = screen.getByTestId('slot-top')
      const bottomLeftSlot = screen.getByTestId('slot-bottom-left')
      expect(topSlot).toHaveTextContent('Test Book')
      expect(bottomLeftSlot).toHaveTextContent('Test Album')
    })
  })

  describe('full-bleed image layout', () => {
    it('renders thumbnail images in each slot', () => {
      render(
        <Top3Image
          theme=""
          book={mockBook}
          music={mockMusic}
          movie={mockMovie}
        />,
      )
      const images = screen.getAllByRole('img')
      const bgs = images.map((img) => img.style.backgroundImage)
      expect(bgs.some((bg) => bg.includes('example.com/book.jpg'))).toBe(true)
      expect(bgs.some((bg) => bg.includes('example.com/music.jpg'))).toBe(true)
      expect(bgs.some((bg) => bg.includes('example.com/movie.jpg'))).toBe(true)
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
        expect(getDownload()).toBe(`my-no1s-${getTodayDate()}-テストテーマ.png`)
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
        expect(getDownload()).toBe(
          `my-no1s-${getTodayDate()}-test_path_name__bad.png`,
        )
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
      expect(screen.getByRole('button', { name: /生成中/ })).toBeDisabled()

      resolveCanvas(createMockCanvas() as unknown as HTMLCanvasElement)

      await waitFor(() => {
        expect(screen.getByText('画像をダウンロード')).toBeInTheDocument()
      })
      expect(
        screen.getByRole('button', { name: /画像をダウンロード/ }),
      ).toBeEnabled()
    })

    it('shows error when toBlob returns null', async () => {
      const html2canvas = (await import('html2canvas')).default
      vi.mocked(html2canvas).mockResolvedValueOnce({
        toDataURL: () => 'data:,',
        toBlob: (cb: (blob: Blob | null) => void) => cb(null),
      } as unknown as HTMLCanvasElement)
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
      expect(
        screen.getByRole('button', { name: /画像をダウンロード/ }),
      ).toBeEnabled()
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

      vi.mocked(html2canvas).mockResolvedValueOnce(
        createMockCanvas() as unknown as HTMLCanvasElement,
      )

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
      expect(captureArea.style.transform).toMatch(/^scale\(/)
      expect(captureArea.style.transformOrigin).toBe('top left')
    })
  })
})
