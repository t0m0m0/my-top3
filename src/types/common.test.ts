import { describe, it, expect } from 'vitest'
import { hasMore } from './common'

describe('hasMore', () => {
  it('returns true when more items exist', () => {
    expect(hasMore({ items: [1, 2, 3], totalItems: 10, startIndex: 0 })).toBe(
      true,
    )
  })

  it('returns false when all items loaded', () => {
    expect(hasMore({ items: [1, 2, 3], totalItems: 3, startIndex: 0 })).toBe(
      false,
    )
  })

  it('returns false when at boundary with offset', () => {
    expect(hasMore({ items: [1, 2], totalItems: 5, startIndex: 3 })).toBe(false)
  })

  it('handles empty items', () => {
    expect(hasMore({ items: [], totalItems: 0, startIndex: 0 })).toBe(false)
  })

  it('returns true with offset and remaining items', () => {
    expect(hasMore({ items: [1, 2], totalItems: 10, startIndex: 3 })).toBe(true)
  })
})
