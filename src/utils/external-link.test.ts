import { describe, it, expect } from 'vitest'
import { getServiceLabel } from './external-link'

describe('getServiceLabel', () => {
  it('returns "Google Books で見る" for Google Books URLs', () => {
    expect(getServiceLabel('https://books.google.com/books?id=abc')).toBe(
      'Google Books で見る',
    )
    expect(getServiceLabel('https://books.google.co.jp/books?id=abc')).toBe(
      'Google Books で見る',
    )
  })

  it('returns "Last.fm で見る" for Last.fm URLs', () => {
    expect(getServiceLabel('https://www.last.fm/music/Artist/Album')).toBe(
      'Last.fm で見る',
    )
    expect(getServiceLabel('https://last.fm/music/Artist')).toBe(
      'Last.fm で見る',
    )
  })

  it('returns "TMDb で見る" for TMDb URLs', () => {
    expect(getServiceLabel('https://www.themoviedb.org/movie/12345')).toBe(
      'TMDb で見る',
    )
  })

  it('returns "IMDb で見る" for IMDb URLs', () => {
    expect(getServiceLabel('https://www.imdb.com/title/tt1234567')).toBe(
      'IMDb で見る',
    )
  })

  it('returns "Amazon で見る" for Amazon URLs', () => {
    expect(getServiceLabel('https://amazon.co.jp/dp/1234567890')).toBe(
      'Amazon で見る',
    )
    expect(getServiceLabel('https://www.amazon.com/dp/1234567890')).toBe(
      'Amazon で見る',
    )
  })

  it('returns "Spotify で見る" for Spotify URLs', () => {
    expect(getServiceLabel('https://open.spotify.com/album/abc')).toBe(
      'Spotify で見る',
    )
  })

  it('returns "詳しく見る" for unknown URLs', () => {
    expect(getServiceLabel('https://example.com/something')).toBe('詳しく見る')
  })

  it('returns "詳しく見る" for empty string', () => {
    expect(getServiceLabel('')).toBe('詳しく見る')
  })
})
