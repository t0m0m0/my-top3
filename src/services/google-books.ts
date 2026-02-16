import type {
  PaginatedResponse,
  Result,
  SearchResultItem,
} from '../types/common.ts'
import { fetchJson } from '../utils/fetch-client.ts'
import {
  assertObject,
  assertField,
  assertOptionalArray,
} from './validation-helpers.ts'

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
  const obj = assertObject(data, 'Google Books API')
  assertField<number>(obj, 'totalItems', 'number', 'Google Books response')
  assertOptionalArray(obj, 'items', 'Google Books response')
  return data as GoogleBooksSearchResponse
}

function validateVolume(data: unknown): GoogleBooksVolume {
  const obj = assertObject(data, 'Google Books API')
  const id = assertField<string>(
    obj,
    'id',
    'string',
    'Google Books volume response',
  )
  if (id === '') {
    throw new Error('Missing or empty id in Google Books volume response')
  }
  assertField<object>(
    obj,
    'volumeInfo',
    'object',
    'Google Books volume response',
  )
  return data as GoogleBooksVolume
}

function buildSearchUrl(
  apiKey: string,
  query: string,
  field: 'intitle' | 'inauthor',
  startIndex: number,
  maxResults: number,
): string {
  const params = new URLSearchParams({
    q: `${field}:${query}`,
    startIndex: String(startIndex),
    maxResults: String(maxResults),
    langRestrict: 'ja',
    key: apiKey,
  })
  return `${BASE_URL}?${params.toString()}`
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

  // Search by title and author in parallel, then merge results
  const [titleResult, authorResult] = await Promise.all([
    fetchJson<GoogleBooksSearchResponse>(
      buildSearchUrl(apiKey, trimmed, 'intitle', startIndex, maxResults),
      { signal, validate: validateSearchResponse },
    ),
    fetchJson<GoogleBooksSearchResponse>(
      buildSearchUrl(apiKey, trimmed, 'inauthor', startIndex, maxResults),
      { signal, validate: validateSearchResponse },
    ),
  ])

  // If both fail, return the title search error
  if (!titleResult.ok && !authorResult.ok) return titleResult

  const titleItems = titleResult.ok ? (titleResult.data.items ?? []) : []
  const authorItems = authorResult.ok ? (authorResult.data.items ?? []) : []

  // Merge: title results first, then author-only results (deduplicated)
  const seen = new Set<string>()
  const merged: GoogleBooksVolume[] = []
  for (const item of [...titleItems, ...authorItems]) {
    if (!seen.has(item.id)) {
      seen.add(item.id)
      merged.push(item)
    }
  }

  const mapped = merged.slice(0, maxResults).map(mapVolumeToSearchResult)

  // Use the larger totalItems as an approximation
  const titleTotal = titleResult.ok ? titleResult.data.totalItems : 0
  const authorTotal = authorResult.ok ? authorResult.data.totalItems : 0
  const totalItems = Math.max(titleTotal, authorTotal)

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
