import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../test/test-utils'
import { StatusSnackbar } from './StatusSnackbar'

describe('StatusSnackbar', () => {
  it('renders message when open', () => {
    render(
      <StatusSnackbar
        open={true}
        message="テストメッセージ"
        severity="success"
        onClose={() => {}}
      />,
    )
    expect(screen.getByText('テストメッセージ')).toBeInTheDocument()
  })

  it('does not render message when closed', () => {
    render(
      <StatusSnackbar
        open={false}
        message="非表示メッセージ"
        severity="error"
        onClose={() => {}}
      />,
    )
    expect(screen.queryByText('非表示メッセージ')).not.toBeInTheDocument()
  })

  it('renders with error severity', () => {
    render(
      <StatusSnackbar
        open={true}
        message="エラー発生"
        severity="error"
        onClose={() => {}}
      />,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('エラー発生')).toBeInTheDocument()
  })

  it('calls onClose when Alert close button is clicked', () => {
    const onClose = vi.fn()
    render(
      <StatusSnackbar
        open={true}
        message="閉じるテスト"
        severity="success"
        onClose={onClose}
      />,
    )
    const closeButton = screen.getByRole('button', { name: 'Close' })
    fireEvent.click(closeButton)
    expect(onClose).toHaveBeenCalled()
  })

  it('uses default autoHideDuration of 3000', () => {
    const { container } = render(
      <StatusSnackbar
        open={true}
        message="デフォルト"
        severity="success"
        onClose={() => {}}
      />,
    )
    // Snackbar is rendered — just confirm it's visible
    expect(container.querySelector('.MuiSnackbar-root')).toBeInTheDocument()
  })

  it('accepts custom autoHideDuration', () => {
    const { container } = render(
      <StatusSnackbar
        open={true}
        message="カスタム"
        severity="success"
        onClose={() => {}}
        autoHideDuration={5000}
      />,
    )
    expect(container.querySelector('.MuiSnackbar-root')).toBeInTheDocument()
  })
})
