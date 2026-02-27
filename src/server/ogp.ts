import { getBookById } from '../services/google-books.ts'
import { CATEGORY_LABELS_DISPLAY, CATEGORIES } from '../constants/category.ts'
import type { MediaCategory, SearchResultItem } from '../types/common.ts'
import {
  createWorkTitleCache,
  type WorkInfo,
  type WorkTitleCache,
} from './work-title-cache.ts'

const MAX_THEME_LENGTH = 50
const DEFAULT_SITE_NAME = 'すきコレ'
const DEFAULT_DESCRIPTION = '好きな作品を3つ選んで、みんなにシェアしよう！'

// Module-level cache instance (6-hour TTL, up to 10k entries)
let workTitleCacheInstance: WorkTitleCache | null = null

function getCache(): WorkTitleCache {
  if (!workTitleCacheInstance) {
    workTitleCacheInstance = createWorkTitleCache()
  }
  return workTitleCacheInstance
}

/** Replace the cache instance (for testing) */
export function setWorkTitleCache(cache: WorkTitleCache | null): void {
  workTitleCacheInstance = cache
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export function buildOgTitle(theme: string): string {
  if (theme) {
    return `${theme} | ${DEFAULT_SITE_NAME}`
  }
  return DEFAULT_SITE_NAME
}

export function buildOgDescription(works: WorkInfo[]): string {
  if (works.length === 0) {
    return DEFAULT_DESCRIPTION
  }
  const parts = works.map((w) => `${w.category}: ${w.title}`)
  return parts.join(' / ')
}

export function buildMetaTags(options: {
  title: string
  description: string
  url: string
  imageUrl?: string
}): string {
  const { title, description, url, imageUrl } = options
  const cardType = imageUrl ? 'summary_large_image' : 'summary'
  const tags = [
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta property="og:site_name" content="${DEFAULT_SITE_NAME}" />`,
    `<meta name="twitter:card" content="${cardType}" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
  ]
  if (imageUrl) {
    tags.push(
      `<meta property="og:image" content="${escapeHtml(imageUrl)}" />`,
      `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`,
    )
  }
  return tags.join('\n    ')
}

type CategoryConfig = {
  envKey: string
  getById: (
    apiKey: string,
    id: string,
  ) => Promise<{ ok: boolean; data?: SearchResultItem }>
}

const CATEGORY_CONFIG: Record<MediaCategory, () => Promise<CategoryConfig>> = {
  book: async () => ({
    envKey: 'GOOGLE_BOOKS_API_KEY',
    getById: getBookById,
  }),
  music: async () => {
    const { getMusicById } = await import('../services/lastfm.ts')
    return { envKey: 'LASTFM_API_KEY', getById: getMusicById }
  },
  movie: async () => {
    const { getMovieById } = await import('../services/tmdb.ts')
    return { envKey: 'TMDB_API_KEY', getById: getMovieById }
  },
}

function buildCategoryLabel(category: MediaCategory): string {
  return CATEGORY_LABELS_DISPLAY[category]
}

async function fetchWorkTitle(
  category: MediaCategory,
  id: string,
): Promise<WorkInfo | null> {
  const cache = getCache()

  // Check cache first
  const cached = cache.get(category, id)
  if (cached !== undefined) {
    return cached
  }

  try {
    const { envKey, getById } = await CATEGORY_CONFIG[category]()
    const apiKey = process.env[envKey] ?? ''
    if (!apiKey) return null

    const result = await getById(apiKey, id)
    if (result.ok && result.data) {
      const info: WorkInfo = {
        title: result.data.title,
        category: buildCategoryLabel(category),
      }
      cache.set(category, id, info)
      return info
    }
  } catch (e) {
    console.error(`[ogp] Failed to fetch ${category} (id: ${id}):`, e)
  }
  // Cache the null result to avoid repeated failed lookups
  cache.set(category, id, null)
  return null
}

export async function injectOgpTags(
  html: string,
  url: string,
  searchParams: URLSearchParams,
  imageUrl?: string,
): Promise<string> {
  const rawTheme = searchParams.get('theme') ?? ''
  const theme = rawTheme.slice(0, MAX_THEME_LENGTH)
  const bookId = searchParams.get('book') ?? ''
  const musicId = searchParams.get('music') ?? ''
  const movieId = searchParams.get('movie') ?? ''

  const idByCategory: Record<MediaCategory, string> = {
    book: bookId,
    music: musicId,
    movie: movieId,
  }

  // Fetch work titles in parallel
  const fetchPromises = CATEGORIES.filter((cat) => idByCategory[cat]).map(
    (cat) => fetchWorkTitle(cat, idByCategory[cat]),
  )

  // Wait with timeout to avoid blocking crawlers for too long
  const timeout = new Promise<(WorkInfo | null)[]>((resolve) =>
    setTimeout(() => resolve(fetchPromises.map(() => null)), 3000),
  )
  const results = await Promise.race([Promise.all(fetchPromises), timeout])
  const works = results.filter((w): w is WorkInfo => w !== null)

  const title = buildOgTitle(theme)
  const description = buildOgDescription(works)
  const metaTags = buildMetaTags({ title, description, url, imageUrl })

  return html.replace('</head>', `    ${metaTags}\n  </head>`)
}
