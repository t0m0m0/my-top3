import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../test/test-utils'
import ShareButtons from './ShareButtons'

describe('ShareButtons', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('renders URL copy button', () => {
    render(<ShareButtons />)
    expect(screen.getByText('URLをコピー')).toBeInTheDocument()
  })

  it('renders X share button', () => {
    render(<ShareButtons />)
    expect(screen.getByText('Xでシェア')).toBeInTheDocument()
  })

  it('copies URL to clipboard on click', async () => {
    render(<ShareButtons />)
    fireEvent.click(screen.getByText('URLをコピー'))

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        window.location.href,
      )
    })
  })

  it('shows success snackbar after copy', async () => {
    render(<ShareButtons />)
    fireEvent.click(screen.getByText('URLをコピー'))

    await waitFor(() => {
      expect(screen.getByText('URLをコピーしました')).toBeInTheDocument()
    })
  })

  it('opens X intent URL on share click', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(<ShareButtons theme="テスト" />)
    fireEvent.click(screen.getByText('Xでシェア'))

    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank',
      'noopener,noreferrer',
    )
    openSpy.mockRestore()
  })

  it('includes theme in X share text', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(<ShareButtons theme="雨の日に" />)
    fireEvent.click(screen.getByText('Xでシェア'))

    const url = openSpy.mock.calls[0]?.[0] as string
    expect(url).toContain(encodeURIComponent('My Top 3 「雨の日に」'))
    openSpy.mockRestore()
  })
})
