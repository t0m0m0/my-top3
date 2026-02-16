import type {
  PaginatedResponse,
  Result,
  SearchResultItem,
} from '../types/common.ts'
import { fetchJson } from '../utils/fetch-client.ts'

const BASE_URL = 'https://www.googleapis.com/books/v1/volumes'
const DEFAULT_MAX_RESULTS = 20

type GoogleBooksImageLinks = {
  smallThumbnail?: string
  thumbnail?: string
}

type GoogleBooksVolumeInfo = {
  title?: string
  authors?: string[]
  imageLinks?: GoogleBooksImageLinks
  publishedDate?: string
  description?: string
  industryIdentifiers?: Array<{
    type: string
    identifier: string
  }>
}

type GoogleBooksVolume = {
  id: string
  selfLink: string
  volumeInfo: GoogleBooksVolumeInfo
}

type GoogleBooksSearchResponse = {
  kind: string
  totalItems: number
  items?: GoogleBooksVolume[]
}

function validateSearchResponse(data: unknown): GoogleBooksSearchResponse {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Expected object response from Google Books API')
  }
  const obj = data as Record<string, unknown>
  if (typeof obj['totalItems'] !== 'number') {
    throw new Error('Missing or invalid totalItems in Google Books response')
  }
  if (obj['items'] !== undefined && !Array.isArray(obj['items'])) {
    throw new Error('Invalid items field in Google Books response')
  }
  return data as GoogleBooksSearchResponse
}

function validateVolume(data: unknown): GoogleBooksVolume {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Expected object response from Google Books API')
  }
  const obj = data as Record<string, unknown>
  if (typeof obj['id'] !== 'string' || obj['id'] === '') {
    throw new Error('Missing or empty id in Google Books volume response')
  }
  if (typeof obj['volumeInfo'] !== 'object' || obj['volumeInfo'] === null) {
    throw new Error('Missing volumeInfo in Google Books volume response')
  }
  return data as GoogleBooksVolume
}

export async function searchBooks(
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

  const params = new URLSearchParams({
    q: trimmed,
    startIndex: String(startIndex),
    maxResults: String(maxResults),
    langRestrict: 'ja',
    key: apiKey,
  })

  const result = await fetchJson<GoogleBooksSearchResponse>(
    `${BASE_URL}?${params.toString()}`,
    { signal, validate: validateSearchResponse },
  )

  if (!result.ok) return result

  const { totalItems, items = [] } = result.data
  const mapped = items.map(mapVolumeToSearchResult)

  return {
    ok: true,
    data: {
      items: mapped,
      totalItems,
      startIndex,
    },
  }
}

export async function getBookById(
  apiKey: string,
  volumeId: string,
  signal?: AbortSignal,
): Promise<Result<SearchResultItem>> {
  if (!/^[\w-]+$/.test(volumeId)) {
    return {
      ok: false,
      error: { kind: 'not-found', message: 'Invalid volume ID format' },
    }
  }

  const params = new URLSearchParams({ key: apiKey })

  const result = await fetchJson<GoogleBooksVolume>(
    `${BASE_URL}/${encodeURIComponent(volumeId)}?${params.toString()}`,
    { signal, validate: validateVolume },
  )

  if (!result.ok) return result

  return { ok: true, data: mapVolumeToSearchResult(result.data) }
}

function mapVolumeToSearchResult(volume: GoogleBooksVolume): SearchResultItem {
  const info = volume.volumeInfo
  return {
    id: volume.id,
    category: 'book',
    title: info.title ?? 'タイトル不明',
    subtitle: info.authors?.join(', ') ?? '著者不明',
    thumbnailUrl: upgradeThumbnailUrl(info.imageLinks?.thumbnail ?? ''),
    externalUrl: buildExternalUrl(volume.id, info.industryIdentifiers),
  }
}

function upgradeThumbnailUrl(url: string): string {
  if (url === '') return ''
  return url.replace(/^http:\/\//, 'https://')
}

function buildExternalUrl(
  volumeId: string,
  identifiers?: Array<{ type: string; identifier: string }>,
): string {
  const isbn10 = identifiers?.find((id) => id.type === 'ISBN_10')
  if (isbn10) {
    return `https://www.amazon.co.jp/dp/${isbn10.identifier}`
  }

  const isbn13 = identifiers?.find((id) => id.type === 'ISBN_13')
  if (isbn13) {
    return `https://www.amazon.co.jp/dp/${isbn13.identifier}`
  }

  return `https://books.google.co.jp/books?id=${encodeURIComponent(volumeId)}`
}
