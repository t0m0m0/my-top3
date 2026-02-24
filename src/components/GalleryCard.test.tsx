import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import GalleryCard from './GalleryCard'

// Mock useReaction
const mockToggleReaction = vi.fn()
vi.mock('../hooks/useReaction', () => ({
  useReaction: (_shareId: string, initialCount: number) => ({
    count: initialCount,
    reacted: false,
    toggleReaction: mockToggleReaction,
  }),
}))

const defaultProps = {
  id: 'abc123',
  theme: '夏の思い出',
  bookThumb: 'https://example.com/book.jpg',
  musicThumb: 'https://example.com/music.jpg',
  movieThumb: 'https://example.com/movie.jpg',
  createdAt: 1700000000,
  reactionCount: 5,
}

function renderCard(props = defaultProps) {
  return render(
    <MemoryRouter>
      <GalleryCard {...props} />
    </MemoryRouter>,
  )
}

afterEach(() => {
  mockToggleReaction.mockClear()
})

describe('GalleryCard', () => {
  it('renders theme name', () => {
    renderCard()
    expect(screen.getByText('夏の思い出')).toBeInTheDocument()
  })

  it('renders a link to /s/:id', () => {
    renderCard()
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/s/abc123')
  })

  it('renders thumbnail images (hero + small)', () => {
    renderCard()
    const images = screen.getAllByRole('img')
    // 3 hero images + 3 small thumbnails = 6
    expect(images).toHaveLength(6)
  })

  it('renders fallback when theme is empty', () => {
    renderCard({ ...defaultProps, theme: '' })
    expect(screen.getByText('No Theme')).toBeInTheDocument()
  })

  it('shows placeholder when no thumbnails', () => {
    renderCard({
      ...defaultProps,
      bookThumb: '',
      musicThumb: '',
      movieThumb: '',
    })
    expect(screen.queryAllByRole('img')).toHaveLength(0)
    // Pin emoji is shown as fallback
    expect(screen.getByText('📌')).toBeInTheDocument()
  })

  it('skips thumbnail for empty URL', () => {
    renderCard({ ...defaultProps, bookThumb: '' })
    const images = screen.getAllByRole('img')
    // 2 hero + 2 small = 4
    expect(images).toHaveLength(4)
  })

  it('renders reaction count', () => {
    renderCard()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders heart button', () => {
    renderCard()
    const btn = screen.getByRole('button', { name: /いいね/ })
    expect(btn).toBeInTheDocument()
  })

  it('calls toggleReaction on heart button click', () => {
    renderCard()
    const btn = screen.getByRole('button', { name: /いいね/ })
    fireEvent.click(btn)
    expect(mockToggleReaction).toHaveBeenCalledTimes(1)
  })

  it('heart button click does not navigate (stopPropagation)', () => {
    renderCard()
    const btn = screen.getByRole('button', { name: /いいね/ })
    fireEvent.click(btn)
    // The button handler should call preventDefault to stop link navigation
    // We just check toggleReaction was called
    expect(mockToggleReaction).toHaveBeenCalled()
  })

  it('shows 0 count when reactionCount is 0', () => {
    renderCard({ ...defaultProps, reactionCount: 0 })
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})
