import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '../test/test-utils'
import Top3Content from './Top3Content'

// Mock heavy child components to isolate Top3Content logic
vi.mock('./Top3Image', () => ({
  default: ({ readOnly }: { readOnly?: boolean }) => (
    <div data-testid="top3-image">
      {readOnly && <span data-testid="image-read-only">readOnly</span>}
    </div>
  ),
}))

vi.mock('./ShareButtons', () => ({
  default: () => <div data-testid="share-buttons" />,
}))

vi.mock('../hooks/useWorkFetch', () => ({
  useWorkFetch: (_cat: string, id: string) => ({
    data: id
      ? {
          id,
          category: _cat,
          title: `Title ${id}`,
          subtitle: 'Sub',
          thumbnailUrl: 'https://example.com/thumb.jpg',
          externalUrl: 'https://example.com',
        }
      : null,
    loading: false,
    error: null,
    retry: vi.fn(),
  }),
}))

vi.mock('../hooks/usePreGeneratedImage', () => ({
  usePreGeneratedImage: () => null,
}))

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', MockResizeObserver)

const baseParams = {
  theme: 'テストテーマ',
  bookId: 'b1',
  musicId: 'm1',
  movieId: 'mv1',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Top3Content', () => {
  describe('default (editable) mode', () => {
    it('shows edit back link (\u2190 戻る) pointing to edit URL', () => {
      render(<Top3Content params={baseParams} />)
      const backLink = screen.getByText('← 戻る')
      expect(backLink).toBeInTheDocument()
      expect(backLink.closest('a')).toHaveAttribute(
        'href',
        expect.stringContaining('edit=1'),
      )
    })

    it('passes readOnly=undefined to Top3Image', () => {
      render(<Top3Content params={baseParams} />)
      expect(screen.getByTestId('top3-image')).toBeInTheDocument()
      expect(screen.queryByTestId('image-read-only')).not.toBeInTheDocument()
    })
  })

  describe('readOnly mode', () => {
    it('does not show edit back link', () => {
      render(<Top3Content params={baseParams} readOnly />)
      expect(screen.queryByText('← 戻る')).not.toBeInTheDocument()
    })

    it('shows gallery back link instead', () => {
      render(<Top3Content params={baseParams} readOnly />)
      const galleryLinks = screen.getAllByText(/みんなのボード/)
      // At least one should be in the bottom navigation area
      expect(galleryLinks.length).toBeGreaterThanOrEqual(1)
    })

    it('passes readOnly to Top3Image', () => {
      render(<Top3Content params={baseParams} readOnly />)
      expect(screen.getByTestId('image-read-only')).toBeInTheDocument()
    })
  })
})
