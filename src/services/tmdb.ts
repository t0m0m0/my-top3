import type {
  PaginatedResponse,
  Result,
  SearchResultItem,
} from '../types/common.ts'
import { fetchJson } from '../utils/fetch-client.ts'

const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w300'
const DEFAULT_MAX_RESULTS = 20
const TMDB_PAGE_SIZE = 20

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
  if (typeof data !== 'object' || data === null) {
    throw new Error('Expected object response from TMDb search API')
  }
  const obj = data as Record<string, unknown>
  if (typeof obj['total_results'] !== 'number') {
    throw new Error('Missing or invalid total_results in TMDb search response')
  }
  if (typeof obj['page'] !== 'number') {
    throw new Error('Missing or invalid page in TMDb search response')
  }
  if (!Array.isArray(obj['results'])) {
    throw new Error('Missing or invalid results in TMDb search response')
  }
  return data as TMDbSearchResponse
}

function validateMovieDetail(data: unknown): TMDbMovieDetail {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Expected object response from TMDb movie API')
  }
  const obj = data as Record<string, unknown>
  if (typeof obj['id'] !== 'number') {
    throw new Error('Missing or invalid id in TMDb movie response')
  }
  if (typeof obj['title'] !== 'string') {
    throw new Error('Missing title in TMDb movie response')
  }
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
  if (trimmed === '') {
    return {
      ok: true,
      data: { items: [], totalItems: 0, startIndex: 0 },
    }
  }

  const page = startIndexToPage(startIndex)

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
  const mapped = sliced.map(mapMovieToSearchResult)

  return {
    ok: true,
    data: {
      items: mapped,
      totalItems: total_results,
      startIndex,
    },
  }
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

  return { ok: true, data: mapMovieDetailToSearchResult(result.data) }
}

// ── Mapping ─────────────────────────────────────────────────────────

function mapMovieToSearchResult(movie: TMDbMovie): SearchResultItem {
  return {
    id: String(movie.id),
    category: 'movie',
    title: movie.title || 'タイトル不明',
    subtitle: '監督不明',
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
