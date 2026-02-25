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

  it('does not render text link', () => {
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
      screen.queryByRole('link', {
        name: /\u30c1\u30a7\u30c3\u30af\u3059\u308b/,
      }),
    ).not.toBeInTheDocument()
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
