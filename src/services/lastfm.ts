import type {
  PaginatedResponse,
  Result,
  SearchResultItem,
} from '../types/common.ts'
import { fetchJson } from '../utils/fetch-client.ts'
import { assertObject, assertField, assertArray } from './validation-helpers.ts'
import { createServiceCaches, EMPTY_SEARCH_RESULT } from './service-cache.ts'

const BASE_URL = 'https://ws.audioscrobbler.com/2.0'
const DEFAULT_MAX_RESULTS = 20

const { searchCache, getByIdCache, clearCaches } = createServiceCaches<
  Result<PaginatedResponse<SearchResultItem>>,
  Result<SearchResultItem>
>()

// ── Last.fm API response types ──────────────────────────────────────

type LastfmImage = {
  '#text': string
  size: string
}

type LastfmAlbumSearch = {
  name: string
  artist: string
  mbid: string
  url: string
  image: LastfmImage[]
}

type LastfmSearchResponse = {
  results: {
    'opensearch:totalResults': string
    albummatches: {
      album: LastfmAlbumSearch[]
    }
  }
}

type LastfmAlbumInfo = {
  album: {
    name: string
    artist: string
    mbid: string
    url: string
    image: LastfmImage[]
  }
}

type LastfmErrorResponse = {
  error: number
  message: string
}

// ── Validation functions ────────────────────────────────────────────

function validateSearchResponse(data: unknown): LastfmSearchResponse {
  const obj = assertObject(data, 'Last.fm search API')
  assertField<object>(obj, 'results', 'object', 'Last.fm search response')
  const results = assertObject(obj['results'], 'Last.fm search results')
  assertField<object>(
    results,
    'albummatches',
    'object',
    'Last.fm search results',
  )
  const albummatches = assertObject(
    results['albummatches'],
    'Last.fm albummatches',
  )
  const albums = assertArray(albummatches, 'album', 'Last.fm albummatches')
  for (const item of albums) {
    const album = assertObject(item, 'Last.fm album item')
    assertField<string>(album, 'name', 'string', 'Last.fm album item')
  }
  return data as LastfmSearchResponse
}

function validateAlbumInfoResponse(data: unknown): LastfmAlbumInfo {
  const obj = assertObject(data, 'Last.fm album.getinfo API')

  // Last.fm returns { error: N, message: "..." } on failure
  if ('error' in obj) {
    const errData = obj as unknown as LastfmErrorResponse
    throw new Error(errData.message || 'Last.fm API error')
  }

  assertField<object>(obj, 'album', 'object', 'Last.fm album.getinfo response')
  return data as LastfmAlbumInfo
}

// ── Public API ──────────────────────────────────────────────────────

export async function searchMusic(
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

  // Last.fm uses 1-based page numbers
  const page = Math.floor(startIndex / maxResults) + 1
  const cacheKey = `${trimmed}:${page}:${maxResults}`

  const cached = searchCache.get(cacheKey)
  if (cached) return cached

  const params = new URLSearchParams({
    method: 'album.search',
    album: trimmed,
    api_key: apiKey,
    format: 'json',
    page: String(page),
    limit: String(maxResults),
  })

  const result = await fetchJson<LastfmSearchResponse>(
    `${BASE_URL}?${params.toString()}`,
    {
      signal,
      validate: validateSearchResponse,
    },
  )

  if (!result.ok) return result

  const { results } = result.data
  const total = parseInt(results['opensearch:totalResults'], 10) || 0
  const albums = results.albummatches.album || []

  const mapped = albums
    .map(mapSearchAlbumToResult)
    .filter((item) => item.thumbnailUrl !== '')

  // Adjust totalItems to prevent infinite pagination loops:
  // If filtering reduced the item count and the raw results were fewer
  // than a full page, we've reached the end of meaningful results.
  let adjustedTotal = total
  if (mapped.length < albums.length) {
    if (albums.length < maxResults) {
      // Last page: cap totalItems to actual items returned
      adjustedTotal = startIndex + mapped.length
    } else if (mapped.length === 0) {
      // Full page but all filtered out: signal end to prevent loop
      adjustedTotal = startIndex
    }
  }

  const response: Result<PaginatedResponse<SearchResultItem>> = {
    ok: true,
    data: {
      items: mapped,
      totalItems: adjustedTotal,
      startIndex,
    },
  }

  searchCache.set(cacheKey, response)
  return response
}

export async function getMusicById(
  apiKey: string,
  mbid: string,
  signal?: AbortSignal,
): Promise<Result<SearchResultItem>> {
  if (!mbid) {
    return {
      ok: false,
      error: { kind: 'not-found', message: 'Invalid album ID' },
    }
  }

  const cached = getByIdCache.get(mbid)
  if (cached) return cached

  const fallback = decodeFallbackId(mbid)
  const params = new URLSearchParams({
    method: 'album.getinfo',
    api_key: apiKey,
    format: 'json',
  })
  if (fallback) {
    params.set('artist', fallback.artist)
    params.set('album', fallback.album)
  } else {
    params.set('mbid', mbid)
  }

  const result = await fetchJson<LastfmAlbumInfo>(
    `${BASE_URL}?${params.toString()}`,
    {
      signal,
      validate: validateAlbumInfoResponse,
    },
  )

  if (!result.ok) return result

  const { album } = result.data
  const response: Result<SearchResultItem> = {
    ok: true,
    data: {
      id: album.mbid || mbid,
      category: 'music',
      title: album.name,
      subtitle: album.artist || 'アーティスト不明',
      thumbnailUrl: getBestImage(album.image),
      externalUrl: album.url ?? '',
    },
  }

  getByIdCache.set(mbid, response)
  return response
}

/** @internal Clear caches (for testing only) */
export const _clearCaches = clearCaches

// ── Mapping ─────────────────────────────────────────────────────────

function mapSearchAlbumToResult(album: LastfmAlbumSearch): SearchResultItem {
  const id = album.mbid || encodeFallbackId(album.name, album.artist)
  return {
    id,
    category: 'music',
    title: album.name,
    subtitle: album.artist || 'アーティスト不明',
    thumbnailUrl: getBestImage(album.image),
    externalUrl: album.url ?? '',
  }
}

function getBestImage(images: LastfmImage[]): string {
  if (!images || images.length === 0) return ''
  // Prefer extralarge > large > medium > small
  const sizeOrder = ['extralarge', 'large', 'medium', 'small']
  for (const size of sizeOrder) {
    const img = images.find((i) => i.size === size)
    if (img && img['#text']) return img['#text']
  }
  return ''
}

const FALLBACK_PREFIX = 'lastfm-'
const FALLBACK_SEPARATOR = '::'

/** URL-safe Base64 encode (no padding, +→-, /→_) */
function toBase64Url(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** URL-safe Base64 decode */
function fromBase64Url(str: string): string {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = (4 - (padded.length % 4)) % 4
  return atob(padded + '='.repeat(pad))
}

export function encodeFallbackId(name: string, artist: string): string {
  const raw = `${artist}${FALLBACK_SEPARATOR}${name}`
  return `${FALLBACK_PREFIX}${toBase64Url(encodeURIComponent(raw))}`
}

function decodeFallbackId(
  id: string,
): { artist: string; album: string } | null {
  if (!id.startsWith(FALLBACK_PREFIX)) return null
  try {
    const encoded = id.slice(FALLBACK_PREFIX.length)
    const raw = decodeURIComponent(fromBase64Url(encoded))
    const sepIndex = raw.indexOf(FALLBACK_SEPARATOR)
    if (sepIndex === -1) return null
    return {
      artist: raw.slice(0, sepIndex),
      album: raw.slice(sepIndex + FALLBACK_SEPARATOR.length),
    }
  } catch {
    return null
  }
}
