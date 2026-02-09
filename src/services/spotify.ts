import type {
  PaginatedResponse,
  Result,
  SearchResultItem,
} from '../types/common.ts'
import { fetchJson } from '../utils/fetch-client.ts'

const SEARCH_URL = 'https://api.spotify.com/v1/search'
const ALBUMS_URL = 'https://api.spotify.com/v1/albums'
const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const DEFAULT_MAX_RESULTS = 20

// ── Spotify API response types ──────────────────────────────────────

type SpotifyImage = {
  url: string
  height: number | null
  width: number | null
}

type SpotifyArtist = {
  id: string
  name: string
}

type SpotifyExternalUrls = {
  spotify?: string
}

type SpotifyAlbum = {
  id: string
  name: string
  artists: SpotifyArtist[]
  images: SpotifyImage[]
  external_urls: SpotifyExternalUrls
  release_date?: string
}

type SpotifyAlbumSearchResult = {
  href: string
  items: SpotifyAlbum[]
  limit: number
  offset: number
  total: number
}

type SpotifySearchResponse = {
  albums: SpotifyAlbumSearchResult
}

type SpotifyTokenResponse = {
  access_token: string
  token_type: string
  expires_in: number
}

// ── Token cache ─────────────────────────────────────────────────────

let cachedToken: string | null = null
let tokenExpiresAt = 0

export async function getAccessToken(
  clientId: string,
  clientSecret: string,
): Promise<Result<string>> {
  const now = Date.now()
  if (cachedToken && now < tokenExpiresAt) {
    return { ok: true, data: cachedToken }
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    'base64',
  )

  const result = await fetchJson<SpotifyTokenResponse>(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    validate: validateTokenResponse,
  })

  if (!result.ok) return result

  cachedToken = result.data.access_token
  // Refresh 60 seconds before actual expiry
  tokenExpiresAt = now + (result.data.expires_in - 60) * 1000

  return { ok: true, data: cachedToken }
}

// ── Validation functions ────────────────────────────────────────────

function validateTokenResponse(data: unknown): SpotifyTokenResponse {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Expected object response from Spotify token endpoint')
  }
  const obj = data as Record<string, unknown>
  if (typeof obj['access_token'] !== 'string') {
    throw new Error('Missing or invalid access_token in Spotify token response')
  }
  if (typeof obj['expires_in'] !== 'number') {
    throw new Error('Missing or invalid expires_in in Spotify token response')
  }
  return data as SpotifyTokenResponse
}

function validateSearchResponse(data: unknown): SpotifySearchResponse {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Expected object response from Spotify search API')
  }
  const obj = data as Record<string, unknown>
  if (typeof obj['albums'] !== 'object' || obj['albums'] === null) {
    throw new Error('Missing or invalid albums in Spotify search response')
  }
  const albums = obj['albums'] as Record<string, unknown>
  if (typeof albums['total'] !== 'number') {
    throw new Error('Missing or invalid total in Spotify albums response')
  }
  if (!Array.isArray(albums['items'])) {
    throw new Error('Missing or invalid items in Spotify albums response')
  }
  return data as SpotifySearchResponse
}

function validateAlbum(data: unknown): SpotifyAlbum {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Expected object response from Spotify album API')
  }
  const obj = data as Record<string, unknown>
  if (typeof obj['id'] !== 'string' || obj['id'] === '') {
    throw new Error('Missing or empty id in Spotify album response')
  }
  if (typeof obj['name'] !== 'string') {
    throw new Error('Missing name in Spotify album response')
  }
  return data as SpotifyAlbum
}

// ── Public API ──────────────────────────────────────────────────────

export async function searchMusic(
  token: string,
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
    type: 'album',
    offset: String(startIndex),
    limit: String(maxResults),
  })

  const result = await fetchJson<SpotifySearchResponse>(
    `${SEARCH_URL}?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      signal,
      validate: validateSearchResponse,
    },
  )

  if (!result.ok) return result

  const { total, items } = result.data.albums
  const mapped = items.map(mapAlbumToSearchResult)

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
  token: string,
  id: string,
  signal?: AbortSignal,
): Promise<Result<SearchResultItem>> {
  if (!/^[\w]+$/.test(id)) {
    return {
      ok: false,
      error: { kind: 'not-found', message: 'Invalid Spotify album ID format' },
    }
  }

  const result = await fetchJson<SpotifyAlbum>(
    `${ALBUMS_URL}/${encodeURIComponent(id)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      signal,
      validate: validateAlbum,
    },
  )

  if (!result.ok) return result

  return { ok: true, data: mapAlbumToSearchResult(result.data) }
}

// ── Mapping ─────────────────────────────────────────────────────────

function mapAlbumToSearchResult(album: SpotifyAlbum): SearchResultItem {
  return {
    id: album.id,
    category: 'music',
    title: album.name,
    subtitle: album.artists.map((a) => a.name).join(', ') || 'アーティスト不明',
    thumbnailUrl: getLargestImage(album.images),
    externalUrl: album.external_urls.spotify ?? '',
  }
}

function getLargestImage(images: SpotifyImage[]): string {
  if (images.length === 0) return ''
  const sorted = [...images].sort((a, b) => {
    const aSize = (a.width ?? 0) * (a.height ?? 0)
    const bSize = (b.width ?? 0) * (b.height ?? 0)
    return bSize - aSize
  })
  return sorted[0]?.url ?? ''
}
