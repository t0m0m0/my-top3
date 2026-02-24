import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test/test-utils'
import userEvent from '@testing-library/user-event'
import { MobileCollapsedBar } from './MobileCollapsedBar'

describe('MobileCollapsedBar', () => {
  it('0選択時に「作品を選ぼう」を表示する', () => {
    render(
      <MobileCollapsedBar
        selectedCount={0}
        expanded={true}
        onToggle={vi.fn()}
      />,
    )
    expect(screen.getByText('セレクト 0/3')).toBeInTheDocument()
    expect(screen.getByText('作品を選ぼう')).toBeInTheDocument()
  })

  it('1選択時に「あと2つ選ぼう」を表示する', () => {
    render(
      <MobileCollapsedBar
        selectedCount={1}
        expanded={false}
        onToggle={vi.fn()}
      />,
    )
    expect(screen.getByText('セレクト 1/3')).toBeInTheDocument()
    expect(screen.getByText('あと2つ選ぼう')).toBeInTheDocument()
  })

  it('3選択時に「準備完了！」を表示する', () => {
    render(
      <MobileCollapsedBar
        selectedCount={3}
        expanded={true}
        onToggle={vi.fn()}
      />,
    )
    expect(screen.getByText('準備完了！')).toBeInTheDocument()
  })

  it('aria-expanded が expanded prop を反映する', () => {
    render(
      <MobileCollapsedBar
        selectedCount={0}
        expanded={false}
        onToggle={vi.fn()}
      />,
    )
    expect(
      screen.getByRole('button', { name: /選択エリアを展開/ }),
    ).toHaveAttribute('aria-expanded', 'false')
  })

  it('クリックで onToggle が呼ばれる', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(
      <MobileCollapsedBar
        selectedCount={0}
        expanded={true}
        onToggle={onToggle}
      />,
    )
    await user.click(screen.getByRole('button', { name: /選択エリアを展開/ }))
    expect(onToggle).toHaveBeenCalledOnce()
  })
})
