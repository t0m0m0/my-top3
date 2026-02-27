import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../test/test-utils'
import userEvent from '@testing-library/user-event'
import WorkCard from './WorkCard'
import { createSearchResultItem } from '../test/fixtures'

describe('WorkCard', () => {
  it('renders work title and subtitle', () => {
    const work = createSearchResultItem({
      title: 'Test Book',
      subtitle: 'Author',
    })
    render(
      <WorkCard
        work={work}
        loading={false}
        error={null}
        label="\ud83d\udcda \u672c"
      />,
    )
    expect(screen.getByText('Test Book')).toBeInTheDocument()
    expect(screen.getByText('Author')).toBeInTheDocument()
  })

  it('opens externalUrl in new tab when card is clicked', async () => {
    const user = userEvent.setup()
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    const work = createSearchResultItem({
      externalUrl: 'https://example.com/detail',
    })
    render(
      <WorkCard
        work={work}
        loading={false}
        error={null}
        label="\ud83d\udcda \u672c"
      />,
    )
    await user.click(screen.getByRole('img', { name: 'Test Title' }))
    expect(openSpy).toHaveBeenCalledWith(
      'https://example.com/detail',
      '_blank',
      'noopener,noreferrer',
    )
    openSpy.mockRestore()
  })

  it('does not open window when externalUrl is empty', async () => {
    const user = userEvent.setup()
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    const work = createSearchResultItem({ externalUrl: '' })
    render(
      <WorkCard
        work={work}
        loading={false}
        error={null}
        label="\ud83d\udcda \u672c"
      />,
    )
    await user.click(screen.getByRole('img', { name: 'Test Title' }))
    expect(openSpy).not.toHaveBeenCalled()
    openSpy.mockRestore()
  })

  it('shows external link icon on thumbnail when externalUrl exists', () => {
    const work = createSearchResultItem({
      externalUrl: 'https://example.com/detail',
    })
    render(
      <WorkCard
        work={work}
        loading={false}
        error={null}
        label="\ud83d\udcda \u672c"
      />,
    )
    expect(
      screen.getByLabelText('\u5916\u90e8\u30ea\u30f3\u30af'),
    ).toBeInTheDocument()
  })

  it('does not show external link icon when externalUrl is empty', () => {
    const work = createSearchResultItem({ externalUrl: '' })
    render(
      <WorkCard
        work={work}
        loading={false}
        error={null}
        label="\ud83d\udcda \u672c"
      />,
    )
    expect(
      screen.queryByLabelText('\u5916\u90e8\u30ea\u30f3\u30af'),
    ).not.toBeInTheDocument()
  })

  it('has cursor-pointer only when externalUrl exists', () => {
    const work = createSearchResultItem({
      externalUrl: 'https://example.com/detail',
    })
    const { container } = render(
      <WorkCard
        work={work}
        loading={false}
        error={null}
        label="\ud83d\udcda \u672c"
      />,
    )
    const card = container.firstElementChild as HTMLElement
    expect(card.className).toContain('cursor-pointer')
  })

  it('renders explicit external link button with service name', () => {
    const work = createSearchResultItem({
      externalUrl: 'https://books.google.com/books?id=abc',
    })
    render(
      <WorkCard
        work={work}
        loading={false}
        error={null}
        label="\ud83d\udcda \u672c"
      />,
    )
    const link = screen.getByRole('link', {
      name: /Google Books \u3067\u898b\u308b/,
    })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute(
      'href',
      'https://books.google.com/books?id=abc',
    )
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('does not render external link button when externalUrl is empty', () => {
    const work = createSearchResultItem({ externalUrl: '' })
    render(
      <WorkCard
        work={work}
        loading={false}
        error={null}
        label="\ud83d\udcda \u672c"
      />,
    )
    expect(
      screen.queryByRole('link', {
        name: /\u3067\u898b\u308b|\u8a73\u3057\u304f\u898b\u308b/,
      }),
    ).not.toBeInTheDocument()
  })

  it('renders service-specific label for Last.fm URL', () => {
    const work = createSearchResultItem({
      externalUrl: 'https://www.last.fm/music/Artist/Album',
      category: 'music',
    })
    render(
      <WorkCard
        work={work}
        loading={false}
        error={null}
        label="\ud83c\udfb5 \u97f3\u697d"
      />,
    )
    expect(
      screen.getByRole('link', { name: /Last\.fm \u3067\u898b\u308b/ }),
    ).toBeInTheDocument()
  })

  it('renders service-specific label for IMDb URL', () => {
    const work = createSearchResultItem({
      externalUrl: 'https://www.imdb.com/title/tt1234567',
      category: 'movie',
    })
    render(
      <WorkCard
        work={work}
        loading={false}
        error={null}
        label="\ud83c\udfac \u6620\u753b"
      />,
    )
    expect(
      screen.getByRole('link', { name: /IMDb \u3067\u898b\u308b/ }),
    ).toBeInTheDocument()
  })

  it('shows loading skeleton', () => {
    render(
      <WorkCard
        work={null}
        loading={true}
        error={null}
        label="\ud83d\udcda \u672c"
      />,
    )
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument()
  })

  it('shows error message with retry button', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(
      <WorkCard
        work={null}
        loading={false}
        error="Failed"
        label="\ud83d\udcda \u672c"
        onRetry={onRetry}
      />,
    )
    expect(screen.getByText('Failed')).toBeInTheDocument()
    await user.click(screen.getByText('\u518d\u8a66\u884c'))
    expect(onRetry).toHaveBeenCalled()
  })

  it('shows no-data state when work is null and not loading', () => {
    render(
      <WorkCard
        work={null}
        loading={false}
        error={null}
        label="\ud83d\udcda \u672c"
      />,
    )
    expect(
      screen.getByText(/\u30c7\u30fc\u30bf\u306a\u3057/),
    ).toBeInTheDocument()
  })
})
