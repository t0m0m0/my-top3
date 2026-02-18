import { describe, it, expect } from 'vitest'
import { render, screen } from '../test/test-utils'
import { ImageSlot } from './ImageSlot'
import type { SearchResultItem } from '../types/common'
import { SLOT_STYLES } from '../constants/image-layout'

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

describe('ImageSlot', () => {
  describe('when item is null', () => {
    it('shows category label and No Data', () => {
      render(<ImageSlot item={null} category="book" slot="top" />)
      expect(screen.getByText('BOOK')).toBeInTheDocument()
      expect(screen.getByText('No Data')).toBeInTheDocument()
    })

    it('renders with correct slot testid', () => {
      render(<ImageSlot item={null} category="music" slot="bottom-left" />)
      expect(screen.getByTestId('slot-bottom-left')).toBeInTheDocument()
    })
  })

  describe('when item is provided', () => {
    it('renders title and subtitle', () => {
      render(<ImageSlot item={mockBook} category="book" slot="top" />)
      expect(screen.getByText('Test Book')).toBeInTheDocument()
      expect(screen.getByText('Author Name')).toBeInTheDocument()
    })

    it('renders thumbnail as background image', () => {
      render(<ImageSlot item={mockBook} category="book" slot="top" />)
      const img = screen.getByRole('img')
      expect(img.style.backgroundImage).toContain(
        'https://example.com/book.jpg',
      )
      expect(img.style.backgroundSize).toBe('cover')
    })

    it('renders category badge', () => {
      render(<ImageSlot item={mockBook} category="book" slot="bottom-left" />)
      expect(screen.getByText('BOOK')).toBeInTheDocument()
    })

    it('shows theme text on top slot when theme is provided', () => {
      render(
        <ImageSlot
          item={mockMusic}
          category="music"
          slot="top"
          theme="雨の日に楽しむ"
        />,
      )
      expect(screen.getByText('「 雨の日に楽しむ 」')).toBeInTheDocument()
    })

    it('does not show theme text on non-top slots', () => {
      render(
        <ImageSlot
          item={mockBook}
          category="book"
          slot="bottom-left"
          theme="テスト"
        />,
      )
      expect(screen.queryByText(/「.*」/)).not.toBeInTheDocument()
    })

    it('positions correctly based on slot style', () => {
      render(<ImageSlot item={mockBook} category="book" slot="bottom-right" />)
      const slot = screen.getByTestId('slot-bottom-right')
      const style = SLOT_STYLES['bottom-right']
      expect(slot.style.top).toBe(`${style.top}px`)
      expect(slot.style.left).toBe(`${style.left}px`)
      expect(slot.style.width).toBe(`${style.width}px`)
      expect(slot.style.height).toBe(`${style.height}px`)
    })
  })
})
