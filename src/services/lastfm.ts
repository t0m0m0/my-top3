import type {
  PaginatedResponse,
  Result,
  SearchResultItem,
} from '../types/common.ts'
import { fetchJson } from '../utils/fetch-client.ts'
import { assertObject, assertField } from './validation-helpers.ts'

const BASE_URL = 'https://ws.audioscrobbler.com/2.0'
const DEFAULT_MAX_RESULTS = 20

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
  const results = obj['results'] as Record<string, unknown>
  assertField<object>(
    results,
    'albummatches',
    'object',
    'Last.fm search results',
  )
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
  if (trimmed === '') {
    return {
      ok: true,
      data: { items: [], totalItems: 0, startIndex: 0 },
    }
  }

  // Last.fm uses 1-based page numbers
  const page = Math.floor(startIndex / maxResults) + 1

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

  return {
    ok: true,
    data: {
      items: mapped,
      totalItems: total,
      startIndex,
    },
  }
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

  const params = new URLSearchParams({
    method: 'album.getinfo',
    mbid,
    api_key: apiKey,
    format: 'json',
  })

  const result = await fetchJson<LastfmAlbumInfo>(
    `${BASE_URL}?${params.toString()}`,
    {
      signal,
      validate: validateAlbumInfoResponse,
    },
  )

  if (!result.ok) return result

  const { album } = result.data
  return {
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
}

// ── Mapping ─────────────────────────────────────────────────────────

function mapSearchAlbumToResult(album: LastfmAlbumSearch): SearchResultItem {
  const id = album.mbid || generateFallbackId(album.name, album.artist)
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

function generateFallbackId(name: string, artist: string): string {
  const raw = `${artist}::${name}`
  // Simple hash for uniqueness
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 31 + raw.charCodeAt(i)) | 0
  }
  return `lastfm-${Math.abs(hash).toString(36)}`
}
