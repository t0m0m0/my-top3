import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import GalleryCard from './GalleryCard'

const defaultProps = {
  id: 'abc123',
  theme: '夏の思い出',
  bookThumb: 'https://example.com/book.jpg',
  musicThumb: 'https://example.com/music.jpg',
  movieThumb: 'https://example.com/movie.jpg',
  createdAt: 1700000000,
}

function renderCard(props = defaultProps) {
  return render(
    <MemoryRouter>
      <GalleryCard {...props} />
    </MemoryRouter>,
  )
}

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

  it('renders 3 thumbnail images', () => {
    renderCard()
    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(3)
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
    expect(screen.getByText('タップして見る')).toBeInTheDocument()
  })

  it('skips thumbnail for empty URL', () => {
    renderCard({ ...defaultProps, bookThumb: '' })
    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(2)
  })
})
