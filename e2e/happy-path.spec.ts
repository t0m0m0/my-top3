import { test, expect, type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

function makeItem(
  category: 'book' | 'music' | 'movie',
  id: string,
  title: string,
  subtitle: string,
) {
  return {
    id,
    category,
    title,
    subtitle,
    thumbnailUrl: `https://via.placeholder.com/120x160?text=${encodeURIComponent(title)}`,
    externalUrl: `https://example.com/${category}/${id}`,
  }
}

const BOOK = makeItem('book', 'book-1', '銀河鉄道の夜', '宮沢賢治')
const MUSIC = makeItem('music', 'music-1', 'Bohemian Rhapsody', 'Queen')
const MOVIE = makeItem('movie', 'movie-1', '千と千尋の神隠し', 'スタジオジブリ')

function searchResponse(
  items: ReturnType<typeof makeItem>[],
  totalItems: number,
  startIndex = 0,
) {
  return { ok: true, data: { items, totalItems, startIndex } }
}

function detailResponse(item: ReturnType<typeof makeItem>) {
  return { ok: true, data: item }
}

function makeBatch(
  category: 'book' | 'music' | 'movie',
  count: number,
  offset = 0,
) {
  return Array.from({ length: count }, (_, i) => {
    const n = offset + i + 1
    return makeItem(
      category,
      `${category}-${n}`,
      `${category === 'book' ? '書籍' : category === 'music' ? 'アルバム' : '映画'}作品${n}`,
      `著者${n}`,
    )
  })
}

// ---------------------------------------------------------------------------
// Route helpers
// ---------------------------------------------------------------------------

async function mockAllSearches(page: Page) {
  await page.route('**/api/books/search**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(searchResponse([BOOK], 1)),
    }),
  )
  await page.route('**/api/music/search**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(searchResponse([MUSIC], 1)),
    }),
  )
  await page.route('**/api/movies/search**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(searchResponse([MOVIE], 1)),
    }),
  )
}

async function mockAllDetails(page: Page) {
  await page.route('**/api/books/book-1', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(detailResponse(BOOK)),
    }),
  )
  await page.route('**/api/music/music-1', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(detailResponse(MUSIC)),
    }),
  )
  await page.route('**/api/movies/movie-1', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(detailResponse(MOVIE)),
    }),
  )
}

// ---------------------------------------------------------------------------
// 1. Happy path: search → select 3 works → navigate to Top3Page
// ---------------------------------------------------------------------------

test.describe('Happy path', () => {
  test('search and select 3 works then navigate to Top3Page', async ({
    page,
  }) => {
    await mockAllSearches(page)
    await mockAllDetails(page)

    await page.goto('/')

    const searchInput = page.getByPlaceholder('好きな作品を検索 🔍')

    // --- Book (default tab) ---
    await searchInput.fill('銀河鉄道')
    await expect(page.getByText(BOOK.title)).toBeVisible()
    await page.getByRole('button', { name: '推す！💜', exact: true }).click()

    // --- Music ---
    await page.getByRole('tab', { name: /音楽/ }).click()
    await searchInput.fill('Bohemian')
    await expect(page.getByText(MUSIC.title)).toBeVisible()
    await page.getByRole('button', { name: '推す！💜', exact: true }).click()

    // --- Movie ---
    await page.getByRole('tab', { name: /映画/ }).click()
    await searchInput.fill('千と千尋')
    await expect(page.getByText(MOVIE.title)).toBeVisible()
    await page.getByRole('button', { name: '推す！💜', exact: true }).click()

    // Click create button
    const createButton = page.getByRole('button', { name: /できた！シェアする/ })
    await createButton.first().click()

    await page.waitForURL('**/my-no1s?**')

    // Verify URL params
    const url = new URL(page.url())
    expect(url.pathname).toBe('/my-no1s')
    expect(url.searchParams.get('book')).toBe('book-1')
    expect(url.searchParams.get('music')).toBe('music-1')
    expect(url.searchParams.get('movie')).toBe('movie-1')

    // Verify all 3 work titles are visible on Top3Page
    // Titles may appear in multiple places (WorkCard + Top3Image), use .first()
    await expect(page.getByText(BOOK.title).first()).toBeVisible()
    await expect(page.getByText(MUSIC.title).first()).toBeVisible()
    await expect(page.getByText(MOVIE.title).first()).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// 2. URL sharing: Top3Page restoration from URL
// ---------------------------------------------------------------------------

test.describe('URL sharing', () => {
  test('restores Top3Page from shared URL with theme', async ({ page }) => {
    await mockAllDetails(page)

    await page.goto(
      '/my-no1s?book=book-1&music=music-1&movie=movie-1&theme=お気に入り',
    )

    // Verify theme is displayed
    await expect(
      page.getByRole('heading', { name: /お気に入り/ }),
    ).toBeVisible()

    // Verify all 3 work titles are visible
    await expect(page.getByText(BOOK.title).first()).toBeVisible()
    await expect(page.getByText(MUSIC.title).first()).toBeVisible()
    await expect(page.getByText(MOVIE.title).first()).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// 3. Rate limit: 429 error display
// ---------------------------------------------------------------------------

test.describe('Rate limit error', () => {
  test('displays error message on 429 response', async ({ page }) => {
    await page.route('**/api/books/search**', (route) =>
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: 'Too Many Requests' }),
      }),
    )

    await page.goto('/')

    const searchInput = page.getByPlaceholder('好きな作品を検索 🔍')
    await searchInput.fill('テスト検索')

    const alert = page.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('しばらく時間をおいて再度お試しください')
  })
})

// ---------------------------------------------------------------------------
// 4. Infinite scroll (loadMore)
// ---------------------------------------------------------------------------

test.describe('Infinite scroll', () => {
  test('loads more items when scrolling to sentinel', async ({ page }) => {
    const batch1 = makeBatch('book', 20, 0)
    const batch2 = makeBatch('book', 20, 20)
    let callCount = 0

    await page.route('**/api/books/search**', (route) => {
      callCount++
      const items = callCount === 1 ? batch1 : batch2
      const startIndex = callCount === 1 ? 0 : 20
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(searchResponse(items, 40, startIndex)),
      })
    })

    await page.goto('/')

    const searchInput = page.getByPlaceholder('好きな作品を検索 🔍')
    await searchInput.fill('書籍')

    // Verify first batch is rendered
    await expect(page.getByText('書籍作品1', { exact: true })).toBeVisible()
    await expect(page.getByText('書籍作品20', { exact: true })).toBeVisible()

    // Scroll to bottom to trigger IntersectionObserver sentinel
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Second batch should appear
    await expect(page.getByText('書籍作品21', { exact: true })).toBeVisible({
      timeout: 10_000,
    })
    await expect(page.getByText('書籍作品40', { exact: true })).toBeVisible()
  })
})
