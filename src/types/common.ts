export type MediaCategory = 'book' | 'music' | 'movie'

export type SearchResultItem = {
  id: string
  category: MediaCategory
  title: string
  subtitle: string
  thumbnailUrl: string
  externalUrl: string
}

export type PaginatedResponse<T> = {
  items: T[]
  totalItems: number
  startIndex: number
}

export function hasMore<T>(page: PaginatedResponse<T>): boolean {
  return page.startIndex + page.items.length < page.totalItems
}

export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'rate-limited'
  | 'not-found'
  | 'auth-error'
  | 'server-error'
  | 'parse-error'
  | 'aborted'
  | 'unknown'

export type ApiError = {
  kind: ApiErrorKind
  message: string
  status?: number
}

export type Result<T, E = ApiError> =
  | { ok: true; data: T }
  | { ok: false; error: E }
