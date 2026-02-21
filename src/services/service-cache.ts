import type {
  PaginatedResponse,
  Result,
  SearchResultItem,
} from '../types/common.ts'
import { TtlCache } from '../utils/cache.ts'

// ── Shared constants ────────────────────────────────────────────────

export const SEARCH_TTL_MS = 5 * 60 * 1000 // 5 minutes
export const GET_BY_ID_TTL_MS = 60 * 60 * 1000 // 1 hour
export const SEARCH_MAX_ENTRIES = 200
export const GET_BY_ID_MAX_ENTRIES = 500

export const EMPTY_SEARCH_RESULT: Result<PaginatedResponse<SearchResultItem>> =
  {
    ok: true,
    data: { items: [], totalItems: 0, startIndex: 0 },
  }

// ── Cache factory ───────────────────────────────────────────────────

export type ServiceCaches<TSearch, TGetById> = {
  searchCache: TtlCache<TSearch>
  getByIdCache: TtlCache<TGetById>
  clearCaches: () => void
}

export function createServiceCaches<TSearch, TGetById>(): ServiceCaches<
  TSearch,
  TGetById
> {
  const searchCache = new TtlCache<TSearch>({
    ttlMs: SEARCH_TTL_MS,
    maxEntries: SEARCH_MAX_ENTRIES,
  })
  const getByIdCache = new TtlCache<TGetById>({
    ttlMs: GET_BY_ID_TTL_MS,
    maxEntries: GET_BY_ID_MAX_ENTRIES,
  })

  return {
    searchCache,
    getByIdCache,
    clearCaches: () => {
      searchCache.clear()
      getByIdCache.clear()
    },
  }
}
