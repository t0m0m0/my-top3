import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/books/search', ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') ?? ''
    if (!q) {
      return HttpResponse.json({
        ok: true,
        data: { items: [], totalItems: 0, startIndex: 0 },
      })
    }
    return HttpResponse.json({
      ok: true,
      data: {
        items: [
          {
            id: 'book-1',
            category: 'book',
            title: `Book: ${q}`,
            subtitle: 'Author Name',
            thumbnailUrl: 'https://example.com/book.jpg',
            externalUrl: 'https://amazon.co.jp/dp/1234567890',
          },
        ],
        totalItems: 1,
        startIndex: 0,
      },
    })
  }),

  http.get('/api/books/:id', ({ params }) => {
    return HttpResponse.json({
      ok: true,
      data: {
        id: params['id'],
        category: 'book',
        title: 'Test Book',
        subtitle: 'Test Author',
        thumbnailUrl: 'https://example.com/book.jpg',
        externalUrl: 'https://amazon.co.jp/dp/1234567890',
      },
    })
  }),

  http.get('/api/music/search', ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') ?? ''
    if (!q) {
      return HttpResponse.json({
        ok: true,
        data: { items: [], totalItems: 0, startIndex: 0 },
      })
    }
    return HttpResponse.json({
      ok: true,
      data: {
        items: [
          {
            id: 'music-1',
            category: 'music',
            title: `Album: ${q}`,
            subtitle: 'Artist Name',
            thumbnailUrl: 'https://example.com/album.jpg',
            externalUrl: 'https://open.spotify.com/album/123',
          },
        ],
        totalItems: 1,
        startIndex: 0,
      },
    })
  }),

  http.get('/api/music/:id', ({ params }) => {
    return HttpResponse.json({
      ok: true,
      data: {
        id: params['id'],
        category: 'music',
        title: 'Test Album',
        subtitle: 'Test Artist',
        thumbnailUrl: 'https://example.com/album.jpg',
        externalUrl: 'https://open.spotify.com/album/123',
      },
    })
  }),

  http.get('/api/movies/search', ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') ?? ''
    if (!q) {
      return HttpResponse.json({
        ok: true,
        data: { items: [], totalItems: 0, startIndex: 0 },
      })
    }
    return HttpResponse.json({
      ok: true,
      data: {
        items: [
          {
            id: 'movie-1',
            category: 'movie',
            title: `Movie: ${q}`,
            subtitle: 'Director Name',
            thumbnailUrl: 'https://example.com/movie.jpg',
            externalUrl: 'https://www.imdb.com/title/tt1234567',
          },
        ],
        totalItems: 1,
        startIndex: 0,
      },
    })
  }),

  http.get('/api/movies/:id', ({ params }) => {
    return HttpResponse.json({
      ok: true,
      data: {
        id: params['id'],
        category: 'movie',
        title: 'Test Movie',
        subtitle: 'Test Director',
        thumbnailUrl: 'https://example.com/movie.jpg',
        externalUrl: 'https://www.imdb.com/title/tt1234567',
      },
    })
  }),
]
