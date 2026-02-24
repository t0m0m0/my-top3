// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  escapeHtml,
  buildOgTitle,
  buildOgDescription,
  buildMetaTags,
  injectOgpTags,
} from './ogp.ts'

vi.mock('../services/google-books.ts', () => ({
  getBookById: vi.fn(),
}))
vi.mock('../services/lastfm.ts', () => ({
  getMusicById: vi.fn(),
}))
vi.mock('../services/tmdb.ts', () => ({
  getMovieById: vi.fn(),
}))

const SAMPLE_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My No.1s</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`

describe('escapeHtml', () => {
  it('escapes HTML special characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    )
  })

  it('escapes ampersands', () => {
    expect(escapeHtml('A & B')).toBe('A &amp; B')
  })

  it('escapes single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#x27;s')
  })

  it('returns empty string for empty input', () => {
    expect(escapeHtml('')).toBe('')
  })
})

describe('buildOgTitle', () => {
  it('includes theme name and site name', () => {
    expect(buildOgTitle('夏の思い出')).toBe('夏の思い出 | My No.1s')
  })

  it('returns site name when theme is empty', () => {
    expect(buildOgTitle('')).toBe('My No.1s')
  })
})

describe('buildOgDescription', () => {
  it('returns default description when no works', () => {
    expect(buildOgDescription([])).toBe(
      '本・音楽・映画からあなたのNo.1を選んで、みんなにシェアしよう！',
    )
  })

  it('joins work titles with slash separator', () => {
    const works = [
      { title: '1Q84', category: '📖Book' },
      { title: 'Bohemian Rhapsody', category: '🎵Music' },
    ]
    expect(buildOgDescription(works)).toBe(
      '📖Book: 1Q84 / 🎵Music: Bohemian Rhapsody',
    )
  })

  it('handles single work', () => {
    const works = [{ title: 'Inception', category: '🎬Movie' }]
    expect(buildOgDescription(works)).toBe('🎬Movie: Inception')
  })

  it('handles all three works', () => {
    const works = [
      { title: '1Q84', category: '📖Book' },
      { title: 'Shape of You', category: '🎵Music' },
      { title: 'Inception', category: '🎬Movie' },
    ]
    expect(buildOgDescription(works)).toBe(
      '📖Book: 1Q84 / 🎵Music: Shape of You / 🎬Movie: Inception',
    )
  })
})

describe('buildMetaTags', () => {
  it('generates all required OGP and Twitter meta tags', () => {
    const result = buildMetaTags({
      title: 'テスト | My No.1s',
      description: '📖Book: 1Q84',
      url: 'https://example.com/my-no1s?theme=test',
    })

    expect(result).toContain('og:title')
    expect(result).toContain('og:description')
    expect(result).toContain('og:type')
    expect(result).toContain('og:url')
    expect(result).toContain('og:site_name')
    expect(result).toContain('twitter:card')
    expect(result).toContain('twitter:title')
    expect(result).toContain('twitter:description')
  })

  it('escapes HTML in values', () => {
    const result = buildMetaTags({
      title: '<script>alert(1)</script>',
      description: 'test & "quoted"',
      url: 'https://example.com',
    })

    expect(result).toContain('&lt;script&gt;')
    expect(result).toContain('test &amp; &quot;quoted&quot;')
  })

  it('includes twitter:card as summary', () => {
    const result = buildMetaTags({
      title: 'Test',
      description: 'Desc',
      url: 'https://example.com',
    })

    expect(result).toContain('content="summary"')
  })
})

describe('injectOgpTags', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    delete process.env['GOOGLE_BOOKS_API_KEY']
    delete process.env['LASTFM_API_KEY']
    delete process.env['TMDB_API_KEY']
  })

  it('injects OGP meta tags before </head>', async () => {
    const params = new URLSearchParams({ theme: '夏の思い出' })
    const result = await injectOgpTags(
      SAMPLE_HTML,
      'https://example.com/my-no1s?theme=夏の思い出',
      params,
    )

    expect(result).toContain('og:title')
    expect(result).toContain('夏の思い出 | My No.1s')
    expect(result).toContain('</head>')
    // Meta tags should be before </head>
    const ogIndex = result.indexOf('og:title')
    const headCloseIndex = result.indexOf('</head>')
    expect(ogIndex).toBeLessThan(headCloseIndex)
  })

  it('uses default title when no theme is provided', async () => {
    const params = new URLSearchParams()
    const result = await injectOgpTags(
      SAMPLE_HTML,
      'https://example.com/my-no1s',
      params,
    )

    expect(result).toContain('content="My No.1s"')
  })

  it('truncates theme to 50 characters', async () => {
    const longTheme = 'あ'.repeat(60)
    const params = new URLSearchParams({ theme: longTheme })
    const result = await injectOgpTags(
      SAMPLE_HTML,
      'https://example.com/my-no1s',
      params,
    )

    const truncated = 'あ'.repeat(50)
    expect(result).toContain(`${truncated} | My No.1s`)
  })

  it('fetches book title and includes it in description', async () => {
    process.env['GOOGLE_BOOKS_API_KEY'] = 'test-key'

    const { getBookById } = await import('../services/google-books.ts')
    vi.mocked(getBookById).mockResolvedValue({
      ok: true,
      data: {
        id: 'book1',
        category: 'book',
        title: '1Q84',
        subtitle: '村上春樹',
        thumbnailUrl: '',
        externalUrl: '',
      },
    })

    const params = new URLSearchParams({
      theme: 'おすすめ',
      book: 'book1',
    })
    const result = await injectOgpTags(
      SAMPLE_HTML,
      'https://example.com/my-no1s?theme=おすすめ&book=book1',
      params,
    )

    expect(result).toContain('📖Book: 1Q84')
    expect(getBookById).toHaveBeenCalledWith('test-key', 'book1')
  })

  it('fetches all three works and includes them in description', async () => {
    process.env['GOOGLE_BOOKS_API_KEY'] = 'test-key'
    process.env['LASTFM_API_KEY'] = 'lastfm-key'
    process.env['TMDB_API_KEY'] = 'tmdb-key'

    const { getBookById } = await import('../services/google-books.ts')
    const { getMusicById } = await import('../services/lastfm.ts')
    const { getMovieById } = await import('../services/tmdb.ts')

    vi.mocked(getBookById).mockResolvedValue({
      ok: true,
      data: {
        id: 'book1',
        category: 'book',
        title: '1Q84',
        subtitle: '村上春樹',
        thumbnailUrl: '',
        externalUrl: '',
      },
    })
    vi.mocked(getMusicById).mockResolvedValue({
      ok: true,
      data: {
        id: 'music1',
        category: 'music',
        title: 'Shape of You',
        subtitle: 'Ed Sheeran',
        thumbnailUrl: '',
        externalUrl: '',
      },
    })
    vi.mocked(getMovieById).mockResolvedValue({
      ok: true,
      data: {
        id: 'movie1',
        category: 'movie',
        title: 'Inception',
        subtitle: 'Christopher Nolan',
        thumbnailUrl: '',
        externalUrl: '',
      },
    })

    const params = new URLSearchParams({
      theme: '好きな作品',
      book: 'book1',
      music: 'music1',
      movie: 'movie1',
    })
    const result = await injectOgpTags(
      SAMPLE_HTML,
      'https://example.com/my-no1s',
      params,
    )

    expect(result).toContain('📖Book: 1Q84')
    expect(result).toContain('🎵Music: Shape of You')
    expect(result).toContain('🎬Movie: Inception')
  })

  it('gracefully handles API errors', async () => {
    process.env['GOOGLE_BOOKS_API_KEY'] = 'test-key'

    const { getBookById } = await import('../services/google-books.ts')
    vi.mocked(getBookById).mockResolvedValue({
      ok: false,
      error: { kind: 'server-error', message: 'API error' },
    })

    const params = new URLSearchParams({
      theme: 'テスト',
      book: 'invalid-id',
    })
    const result = await injectOgpTags(
      SAMPLE_HTML,
      'https://example.com/my-no1s',
      params,
    )

    // Should still inject OGP tags, just with default description
    expect(result).toContain('og:title')
    expect(result).toContain('テスト | My No.1s')
    expect(result).toContain(
      '本・音楽・映画からあなたのNo.1を選んで、みんなにシェアしよう！',
    )
  })

  it('skips fetching when API keys are not set', async () => {
    // No env vars set
    const { getBookById } = await import('../services/google-books.ts')

    const params = new URLSearchParams({
      theme: 'テスト',
      book: 'book1',
    })
    const result = await injectOgpTags(
      SAMPLE_HTML,
      'https://example.com/my-no1s',
      params,
    )

    expect(getBookById).not.toHaveBeenCalled()
    expect(result).toContain('og:title')
  })

  it('includes og:url with the full URL', async () => {
    const url = 'https://example.com/my-no1s?theme=test'
    const params = new URLSearchParams({ theme: 'test' })
    const result = await injectOgpTags(SAMPLE_HTML, url, params)

    expect(result).toContain(`content="https://example.com/my-no1s?theme=test"`)
  })

  it('handles exception in fetchWorkTitle gracefully', async () => {
    process.env['GOOGLE_BOOKS_API_KEY'] = 'test-key'

    const { getBookById } = await import('../services/google-books.ts')
    vi.mocked(getBookById).mockRejectedValue(new Error('Network error'))

    const params = new URLSearchParams({
      theme: 'テスト',
      book: 'book1',
    })
    const result = await injectOgpTags(
      SAMPLE_HTML,
      'https://example.com/my-no1s',
      params,
    )

    // Should not throw, should still return valid HTML with OGP tags
    expect(result).toContain('og:title')
    expect(result).toContain('</head>')
  })
})
