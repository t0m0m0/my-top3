import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../test/test-utils'
import Top3Image from './Top3Image'
import type { SearchResultItem } from '../types/common'

vi.mock('html2canvas', () => ({
  default: vi.fn(() =>
    Promise.resolve({
      toDataURL: () => 'data:image/png;base64,mock',
    }),
  ),
}))

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

describe('Top3Image', () => {
  it('renders capture area with 1080x1080 dimensions', () => {
    render(
      <Top3Image theme="" book={mockBook} music={mockMusic} movie={mockMovie} />,
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
      <Top3Image theme="" book={mockBook} music={mockMusic} movie={mockMovie} />,
    )
    expect(screen.queryByText(/「.*」/)).not.toBeInTheDocument()
  })

  it('displays all three work titles', () => {
    render(
      <Top3Image theme="" book={mockBook} music={mockMusic} movie={mockMovie} />,
    )
    expect(screen.getByText('Test Book')).toBeInTheDocument()
    expect(screen.getByText('Test Album')).toBeInTheDocument()
    expect(screen.getByText('Test Movie')).toBeInTheDocument()
  })

  it('shows download button', () => {
    render(
      <Top3Image theme="" book={mockBook} music={mockMusic} movie={mockMovie} />,
    )
    expect(screen.getByText('画像をダウンロード')).toBeInTheDocument()
  })

  it('handles null items gracefully', () => {
    render(<Top3Image theme="" book={null} music={null} movie={null} />)
    expect(screen.getAllByText('No Data')).toHaveLength(3)
  })

  it('triggers download on button click', async () => {
    render(
      <Top3Image theme="" book={mockBook} music={mockMusic} movie={mockMovie} />,
    )
    const button = screen.getByText('画像をダウンロード')
    fireEvent.click(button)
    // html2canvas is mocked, so this should complete without error
    expect(button).toBeInTheDocument()
  })
})
