import { getBookById } from '../services/google-books.ts'
import type { SearchResultItem } from '../types/common.ts'

const MAX_THEME_LENGTH = 50
const DEFAULT_SITE_NAME = 'My No.1s'
const DEFAULT_DESCRIPTION =
  '本・音楽・映画からあなたのNo.1を選んで、みんなにシェアしよう！'

type WorkInfo = {
  title: string
  category: string
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
}): string {
  const { title, description, url } = options
  const tags = [
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta property="og:site_name" content="${DEFAULT_SITE_NAME}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
  ]
  return tags.join('\n    ')
}

async function fetchWorkTitle(
  category: 'book' | 'music' | 'movie',
  id: string,
): Promise<WorkInfo | null> {
  const categoryLabels = { book: '📚Book', music: '🎵Music', movie: '🎬Movie' }

  try {
    let result: { ok: boolean; data?: SearchResultItem }

    if (category === 'book') {
      const apiKey = process.env['GOOGLE_BOOKS_API_KEY'] ?? ''
      if (!apiKey) return null
      result = await getBookById(apiKey, id)
    } else if (category === 'music') {
      const apiKey = process.env['LASTFM_API_KEY'] ?? ''
      if (!apiKey) return null
      const { getMusicById } = await import('../services/lastfm.ts')
      result = await getMusicById(apiKey, id)
    } else {
      const apiKey = process.env['TMDB_API_KEY'] ?? ''
      if (!apiKey) return null
      const { getMovieById } = await import('../services/tmdb.ts')
      result = await getMovieById(apiKey, id)
    }

    if (result.ok && result.data) {
      return { title: result.data.title, category: categoryLabels[category] }
    }
  } catch (e) {
    console.error(`[ogp] Failed to fetch ${category} (id: ${id}):`, e)
  }
  return null
}

export async function injectOgpTags(
  html: string,
  url: string,
  searchParams: URLSearchParams,
): Promise<string> {
  const rawTheme = searchParams.get('theme') ?? ''
  const theme = rawTheme.slice(0, MAX_THEME_LENGTH)
  const bookId = searchParams.get('book') ?? ''
  const musicId = searchParams.get('music') ?? ''
  const movieId = searchParams.get('movie') ?? ''

  const works: WorkInfo[] = []

  // Fetch work titles in parallel
  const fetchPromises: Promise<void>[] = []

  if (bookId) {
    fetchPromises.push(
      fetchWorkTitle('book', bookId).then((w) => {
        if (w) works.push(w)
      }),
    )
  }
  if (musicId) {
    fetchPromises.push(
      fetchWorkTitle('music', musicId).then((w) => {
        if (w) works.push(w)
      }),
    )
  }
  if (movieId) {
    fetchPromises.push(
      fetchWorkTitle('movie', movieId).then((w) => {
        if (w) works.push(w)
      }),
    )
  }

  // Wait with timeout to avoid blocking crawlers for too long
  await Promise.race([
    Promise.allSettled(fetchPromises),
    new Promise((resolve) => setTimeout(resolve, 3000)),
  ])

  // Sort works in consistent order: book, music, movie
  const categoryOrder = ['📚Book', '🎵Music', '🎬Movie']
  works.sort(
    (a, b) =>
      categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category),
  )

  const title = buildOgTitle(theme)
  const description = buildOgDescription(works)
  const metaTags = buildMetaTags({ title, description, url })

  return html.replace('</head>', `    ${metaTags}\n  </head>`)
}
