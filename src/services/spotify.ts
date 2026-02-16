import type {
  PaginatedResponse,
  Result,
  SearchResultItem,
} from '../types/common.ts'
import { fetchJson } from '../utils/fetch-client.ts'
import { assertObject, assertField, assertArray } from './validation-helpers.ts'

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
let tokenPromise: Promise<Result<string>> | null = null

export async function getAccessToken(
  clientId: string,
  clientSecret: string,
): Promise<Result<string>> {
  const now = Date.now()
  if (cachedToken && now < tokenExpiresAt) {
    return { ok: true, data: cachedToken }
  }

  if (tokenPromise) {
    return tokenPromise
  }

  tokenPromise = fetchNewToken(clientId, clientSecret).finally(() => {
    tokenPromise = null
  })

  return tokenPromise
}

async function fetchNewToken(
  clientId: string,
  clientSecret: string,
): Promise<Result<string>> {
  const credentials = btoa(`${clientId}:${clientSecret}`)

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
  tokenExpiresAt = Date.now() + (result.data.expires_in - 60) * 1000

  return { ok: true, data: cachedToken }
}

// ── Validation functions ────────────────────────────────────────────

function validateTokenResponse(data: unknown): SpotifyTokenResponse {
  const obj = assertObject(data, 'Spotify token endpoint')
  assertField<string>(obj, 'access_token', 'string', 'Spotify token response')
  assertField<number>(obj, 'expires_in', 'number', 'Spotify token response')
  return data as SpotifyTokenResponse
}

function validateSearchResponse(data: unknown): SpotifySearchResponse {
  const obj = assertObject(data, 'Spotify search API')
  assertField<object>(obj, 'albums', 'object', 'Spotify search response')
  const albums = obj['albums'] as Record<string, unknown>
  assertField<number>(albums, 'total', 'number', 'Spotify albums response')
  assertArray(albums, 'items', 'Spotify albums response')
  return data as SpotifySearchResponse
}

function validateAlbum(data: unknown): SpotifyAlbum {
  const obj = assertObject(data, 'Spotify album API')
  const id = assertField<string>(obj, 'id', 'string', 'Spotify album response')
  if (id === '') {
    throw new Error('Missing or empty id in Spotify album response')
  }
  assertField<string>(obj, 'name', 'string', 'Spotify album response')
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
