import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CommentSection from './CommentSection'

// Mock localStorage
const mockStorage: Record<string, string> = {}
beforeEach(() => {
  vi.restoreAllMocks()
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k])
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
    (key) => mockStorage[key] ?? null,
  )
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
    mockStorage[key] = value
  })
})

describe('CommentSection', () => {
  it('renders heading and empty state', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, data: { items: [], total: 0 } }),
    } as Response)

    render(<CommentSection shareId="test-id" />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      /コメント/,
    )
    await waitFor(() => {
      expect(
        screen.getByText(/まだコメントはありません/),
      ).toBeInTheDocument()
    })
  })

  it('renders comments from API', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        data: {
          items: [
            {
              id: 1,
              nickname: 'ユーザー',
              body: 'いいね！',
              clientId: 'other',
              createdAt: Math.floor(Date.now() / 1000) - 60,
            },
          ],
          total: 1,
        },
      }),
    } as Response)

    render(<CommentSection shareId="test-id" />)
    await waitFor(() => {
      expect(screen.getByText('いいね！')).toBeInTheDocument()
      expect(screen.getByText('ユーザー')).toBeInTheDocument()
    })
  })

  it('shows character count', () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, data: { items: [], total: 0 } }),
    } as Response)

    render(<CommentSection shareId="test-id" />)
    expect(screen.getByText('0/140')).toBeInTheDocument()
  })

  it('disables submit button when body is empty', () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, data: { items: [], total: 0 } }),
    } as Response)

    render(<CommentSection shareId="test-id" />)
    const submitButton = screen.getByRole('button', { name: '送信' })
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when body has text', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, data: { items: [], total: 0 } }),
    } as Response)

    render(<CommentSection shareId="test-id" />)
    const bodyInput = screen.getByLabelText('コメントを入力...')
    fireEvent.change(bodyInput, { target: { value: 'テスト' } })
    const submitButton = screen.getByRole('button', { name: '送信' })
    expect(submitButton).not.toBeDisabled()
  })

  it('submits a comment and clears body', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, data: { items: [], total: 0 } }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          ok: true,
          data: {
            id: 1,
            nickname: '匿名',
            body: 'いいね',
            clientId: 'test-client',
            createdAt: Math.floor(Date.now() / 1000),
          },
        }),
      } as Response)

    render(<CommentSection shareId="test-id" />)

    await waitFor(() => {
      expect(
        screen.getByText(/まだコメントはありません/),
      ).toBeInTheDocument()
    })

    const bodyInput = screen.getByLabelText('コメントを入力...')
    fireEvent.change(bodyInput, { target: { value: 'いいね' } })
    fireEvent.click(screen.getByRole('button', { name: '送信' }))

    await waitFor(() => {
      expect(screen.getByText('いいね')).toBeInTheDocument()
    })

    // At least 2 fetch calls: initial load + submit
    expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(2)
  })
})
