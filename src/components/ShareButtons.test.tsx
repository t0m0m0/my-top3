import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../test/test-utils'
import ShareButtons from './ShareButtons'

describe('ShareButtons', () => {
  let originalClipboard: Clipboard

  beforeEach(() => {
    originalClipboard = navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  afterEach(() => {
    Object.assign(navigator, { clipboard: originalClipboard })
    vi.restoreAllMocks()
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

  it('falls back to execCommand when clipboard API fails', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('Not allowed')),
      },
    })
    const execCommandMock = vi.fn().mockReturnValue(true)
    document.execCommand = execCommandMock

    render(<ShareButtons />)
    fireEvent.click(screen.getByText('URLをコピー'))

    await waitFor(() => {
      expect(execCommandMock).toHaveBeenCalledWith('copy')
      expect(screen.getByText('URLをコピーしました')).toBeInTheDocument()
    })
  })

  it('shows error snackbar when both clipboard methods fail', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('Not allowed')),
      },
    })
    document.execCommand = vi.fn().mockReturnValue(false)

    render(<ShareButtons />)
    fireEvent.click(screen.getByText('URLをコピー'))

    await waitFor(() => {
      expect(
        screen.getByText(
          'URLのコピーに失敗しました。アドレスバーから手動でコピーしてください。',
        ),
      ).toBeInTheDocument()
    })
  })

  it('opens X intent URL on share click', () => {
    vi.spyOn(window, 'open').mockReturnValue({} as Window)
    render(<ShareButtons theme="テスト" />)
    fireEvent.click(screen.getByText('Xでシェア'))

    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('includes theme in X share text', () => {
    vi.spyOn(window, 'open').mockReturnValue({} as Window)
    render(<ShareButtons theme="雨の日に" />)
    fireEvent.click(screen.getByText('Xでシェア'))

    const url = (window.open as ReturnType<typeof vi.fn>).mock
      .calls[0]?.[0] as string
    expect(url).toContain(encodeURIComponent('My Top 3 「雨の日に」'))
  })

  it('uses default text when theme is not provided', () => {
    vi.spyOn(window, 'open').mockReturnValue({} as Window)
    render(<ShareButtons />)
    fireEvent.click(screen.getByText('Xでシェア'))

    const url = (window.open as ReturnType<typeof vi.fn>).mock
      .calls[0]?.[0] as string
    expect(url).toContain(encodeURIComponent('My Top 3'))
    expect(url).not.toContain(encodeURIComponent('「'))
  })

  it('falls back to same-tab navigation when popup is blocked', () => {
    vi.spyOn(window, 'open').mockReturnValue(null)
    const locationSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      href: 'http://localhost/',
    })
    const hrefSetter = vi.fn()
    Object.defineProperty(window.location, 'href', {
      set: hrefSetter,
      configurable: true,
    })

    render(<ShareButtons />)
    fireEvent.click(screen.getByText('Xでシェア'))

    expect(window.open).toHaveBeenCalled()
    expect(hrefSetter).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
    )

    locationSpy.mockRestore()
  })
})
