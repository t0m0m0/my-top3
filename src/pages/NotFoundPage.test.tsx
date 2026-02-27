import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '../test/test-utils'
import NotFoundPage from './NotFoundPage'

describe('NotFoundPage', () => {
  it('404メッセージを表示する', () => {
    render(<NotFoundPage />)
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('ページが見つかりません')).toBeInTheDocument()
  })

  it('説明テキストを表示する', () => {
    render(<NotFoundPage />)
    expect(
      screen.getByText(
        'お探しのページは存在しないか、移動した可能性があります。',
      ),
    ).toBeInTheDocument()
  })

  it('トップページへのリンクを表示する', () => {
    render(<NotFoundPage />)
    const topLink = screen.getByRole('link', { name: /作品を選ぶ/ })
    expect(topLink).toBeInTheDocument()
    expect(topLink).toHaveAttribute('href', '/')
  })

  it('ギャラリーページへのリンクを表示する', () => {
    render(<NotFoundPage />)
    const galleryLink = screen.getByRole('link', { name: /ギャラリー/ })
    expect(galleryLink).toBeInTheDocument()
    expect(galleryLink).toHaveAttribute('href', '/gallery')
  })
})
