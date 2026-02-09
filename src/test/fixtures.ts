import type { SearchResultItem, MediaCategory } from '../types/common'

export function createSearchResultItem(
  overrides: Partial<SearchResultItem> & { category?: MediaCategory } = {},
): SearchResultItem {
  return {
    id: 'test-id-1',
    category: 'book',
    title: 'Test Title',
    subtitle: 'Test Author',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    externalUrl: 'https://example.com/external',
    ...overrides,
  }
}
