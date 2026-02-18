import { describe, it, expect } from 'vitest'
import { MESSAGES } from './messages'

describe('MESSAGES', () => {
  it('has RATE_LIMITED as a string', () => {
    expect(typeof MESSAGES.RATE_LIMITED).toBe('string')
    expect(MESSAGES.RATE_LIMITED.length).toBeGreaterThan(0)
  })

  it('FETCH_FAILED returns formatted message', () => {
    expect(MESSAGES.FETCH_FAILED('書籍')).toBe('書籍の取得に失敗しました')
  })

  it('NOT_FOUND returns formatted message with ID', () => {
    expect(MESSAGES.NOT_FOUND('書籍', 'abc123')).toBe(
      '書籍が見つかりませんでした (ID: abc123)',
    )
  })

  it('all static messages are non-empty strings', () => {
    const staticKeys = Object.entries(MESSAGES).filter(
      ([, v]) => typeof v === 'string',
    )
    for (const [key, value] of staticKeys) {
      expect(value, `MESSAGES.${key}`).toBeTruthy()
    }
  })
})
