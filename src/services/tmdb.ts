import type {
  PaginatedResponse,
  Result,
  SearchResultItem,
} from '../types/common.ts'
import { fetchJson } from '../utils/fetch-client.ts'
import { assertObject, assertField, assertArray } from './validation-helpers.ts'
import { createServiceCaches, EMPTY_SEARCH_RESULT } from './service-cache.ts'

const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w300'
const DEFAULT_MAX_RESULTS = 20
const TMDB_PAGE_SIZE = 20

const { searchCache, getByIdCache, clearCaches } = createServiceCaches<
  Result<PaginatedResponse<SearchResultItem>>,
  Result<SearchResultItem>
>()

// ── TMDb API response types ────────────────────────────────────────

type TMDbMovie = {
  id: number
  title: string
  original_title?: string
  poster_path: string | null
  release_date?: string
  overview?: string
}

type TMDbSearchResponse = {
  page: number
  results: TMDbMovie[]
  total_pages: number
  total_results: number
}

type TMDbCrewMember = {
  id: number
  name: string
  job: string
}

type TMDbCredits = {
  crew: TMDbCrewMember[]
}

type TMDbMovieDetail = {
  id: number
  title: string
  original_title?: string
  poster_path: string | null
  release_date?: string
  overview?: string
  imdb_id?: string | null
  credits?: TMDbCredits
}

// ── Validation functions ────────────────────────────────────────────

function validateSearchResponse(data: unknown): TMDbSearchResponse {
  const obj = assertObject(data, 'TMDb search API')
  assertField<number>(obj, 'total_results', 'number', 'TMDb search response')
  assertField<number>(obj, 'page', 'number', 'TMDb search response')
  const results = assertArray(obj, 'results', 'TMDb search response')
  for (const item of results) {
    const movie = assertObject(item, 'TMDb search result item')
    assertField<number>(movie, 'id', 'number', 'TMDb search result item')
    assertField<string>(movie, 'title', 'string', 'TMDb search result item')
  }
  return data as TMDbSearchResponse
}

function validateMovieDetail(data: unknown): TMDbMovieDetail {
  const obj = assertObject(data, 'TMDb movie API')
  assertField<number>(obj, 'id', 'number', 'TMDb movie response')
  assertField<string>(obj, 'title', 'string', 'TMDb movie response')
  return data as TMDbMovieDetail
}

// ── Pagination helpers ──────────────────────────────────────────────

function startIndexToPage(startIndex: number): number {
  return Math.floor(startIndex / TMDB_PAGE_SIZE) + 1
}

function sliceResultsForOffset(
  results: TMDbMovie[],
  startIndex: number,
  maxResults: number,
): TMDbMovie[] {
  const offsetInPage = startIndex % TMDB_PAGE_SIZE
  return results.slice(offsetInPage, offsetInPage + maxResults)
}

// ── Public API ──────────────────────────────────────────────────────

export async function searchMovies(
  apiKey: string,
  query: string,
  options: {
    startIndex?: number
    maxResults?: number
    signal?: AbortSignal
  } = {},
): Promise<Result<PaginatedResponse<SearchResultItem>>> {
  const { startIndex = 0, maxResults = DEFAULT_MAX_RESULTS, signal } = options

  const trimmed = query.trim()
  if (trimmed === '') return EMPTY_SEARCH_RESULT

  const page = startIndexToPage(startIndex)
  const cacheKey = `${trimmed}:${page}:${maxResults}`

  const cached = searchCache.get(cacheKey)
  if (cached) return cached

  const params = new URLSearchParams({
    api_key: apiKey,
    query: trimmed,
    language: 'ja-JP',
    page: String(page),
  })

  const result = await fetchJson<TMDbSearchResponse>(
    `${BASE_URL}/search/movie?${params.toString()}`,
    { signal, validate: validateSearchResponse },
  )

  if (!result.ok) return result

  const { total_results, results } = result.data
  const sliced = sliceResultsForOffset(results, startIndex, maxResults)

  const mapped = sliced.map((movie) => mapMovieToSearchResult(movie))

  const response: Result<PaginatedResponse<SearchResultItem>> = {
    ok: true,
    data: {
      items: mapped,
      totalItems: total_results,
      startIndex,
    },
  }

  searchCache.set(cacheKey, response)
  return response
}

export async function getMovieById(
  apiKey: string,
  id: string,
  signal?: AbortSignal,
): Promise<Result<SearchResultItem>> {
  if (!/^\d+$/.test(id)) {
    return {
      ok: false,
      error: { kind: 'not-found', message: 'Invalid TMDb movie ID format' },
    }
  }

  const cached = getByIdCache.get(id)
  if (cached) return cached

  const params = new URLSearchParams({
    api_key: apiKey,
    language: 'ja-JP',
    append_to_response: 'credits',
  })

  const result = await fetchJson<TMDbMovieDetail>(
    `${BASE_URL}/movie/${encodeURIComponent(id)}?${params.toString()}`,
    { signal, validate: validateMovieDetail },
  )

  if (!result.ok) return result

  const response: Result<SearchResultItem> = {
    ok: true,
    data: mapMovieDetailToSearchResult(result.data),
  }

  getByIdCache.set(id, response)
  return response
}

// ── Mapping ─────────────────────────────────────────────────────────

function extractYear(releaseDate?: string): string {
  if (!releaseDate) return ''
  const year = releaseDate.slice(0, 4)
  return /^\d{4}$/.test(year) ? year : ''
}

/** @internal Clear caches (for testing only) */
export const _clearCaches = clearCaches

function mapMovieToSearchResult(movie: TMDbMovie): SearchResultItem {
  return {
    id: String(movie.id),
    category: 'movie',
    title: movie.title || 'タイトル不明',
    subtitle: extractYear(movie.release_date),
    thumbnailUrl: movie.poster_path
      ? `${IMAGE_BASE_URL}${movie.poster_path}`
      : '',
    externalUrl: `https://www.themoviedb.org/movie/${movie.id}`,
  }
}

function mapMovieDetailToSearchResult(
  movie: TMDbMovieDetail,
): SearchResultItem {
  const director = movie.credits?.crew.find((c) => c.job === 'Director')

  const externalUrl = movie.imdb_id
    ? `https://www.imdb.com/title/${movie.imdb_id}`
    : `https://www.themoviedb.org/movie/${movie.id}`

  return {
    id: String(movie.id),
    category: 'movie',
    title: movie.title || 'タイトル不明',
    subtitle: director?.name ?? '監督不明',
    thumbnailUrl: movie.poster_path
      ? `${IMAGE_BASE_URL}${movie.poster_path}`
      : '',
    externalUrl,
  }
}
