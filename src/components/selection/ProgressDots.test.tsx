import { describe, it, expect } from 'vitest'
import { render } from '../../test/test-utils'
import { ProgressDots } from './ProgressDots'

describe('ProgressDots', () => {
  it('3つのドットをレンダリングする', () => {
    const { container } = render(<ProgressDots selectedCount={0} />)
    const dots = container.querySelectorAll('span > span')
    expect(dots).toHaveLength(3)
  })

  it('selectedCount 分のドットがアクティブ色になる', () => {
    const { container } = render(<ProgressDots selectedCount={2} />)
    const dots = container.querySelectorAll('span > span')
    // First 2 dots should have primary color, 3rd should have border color
    expect(dots[0]).toHaveStyle({ backgroundColor: 'var(--color-primary)' })
    expect(dots[1]).toHaveStyle({ backgroundColor: 'var(--color-primary)' })
    expect(dots[2]).toHaveStyle({ backgroundColor: 'var(--color-border)' })
  })

  it('0選択時は全ドットが非アクティブ', () => {
    const { container } = render(<ProgressDots selectedCount={0} />)
    const dots = container.querySelectorAll('span > span')
    dots.forEach((dot) => {
      expect(dot).toHaveStyle({ backgroundColor: 'var(--color-border)' })
    })
  })
})
