import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '../test/msw/server'
import GalleryCard from './GalleryCard'

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const defaultProps = {
  id: 'abc123',
  theme: '夏の思い出',
  bookId: 'book-123',
  musicId: 'music-456',
  movieId: 'movie-789',
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

  it('renders 3 thumbnail images after loading', async () => {
    renderCard()
    const images = await screen.findAllByRole('img')
    expect(images).toHaveLength(3)
  })

  it('renders fallback when theme is empty', () => {
    renderCard({ ...defaultProps, theme: '' })
    expect(screen.getByText('No Theme')).toBeInTheDocument()
  })

  it('handles missing work IDs gracefully', () => {
    server.use(
      http.get('/api/books/:id', () => new HttpResponse(null, { status: 404 })),
    )
    renderCard({ ...defaultProps, bookId: '' })
    // Should still render without crashing
    expect(screen.getByText('夏の思い出')).toBeInTheDocument()
  })
})
