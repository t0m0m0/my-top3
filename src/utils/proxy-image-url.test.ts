import { describe, it, expect } from 'vitest'
import { proxyImageUrl } from './proxy-image-url'

describe('proxyImageUrl', () => {
  it('converts a Google Books URL to proxy URL', () => {
    const url = 'https://books.google.com/books/content?id=abc&img=1'
    expect(proxyImageUrl(url)).toBe(
      `/api/image/proxy?url=${encodeURIComponent(url)}`,
    )
  })

  it('converts a Spotify CDN URL to proxy URL', () => {
    const url = 'https://i.scdn.co/image/abc123'
    expect(proxyImageUrl(url)).toBe(
      `/api/image/proxy?url=${encodeURIComponent(url)}`,
    )
  })

  it('converts a TMDB image URL to proxy URL', () => {
    const url = 'https://image.tmdb.org/t/p/w300/poster.jpg'
    expect(proxyImageUrl(url)).toBe(
      `/api/image/proxy?url=${encodeURIComponent(url)}`,
    )
  })

  it('converts a Google Books userusercontent URL to proxy URL', () => {
    const url = 'https://books.googleusercontent.com/some/image.jpg'
    expect(proxyImageUrl(url)).toBe(
      `/api/image/proxy?url=${encodeURIComponent(url)}`,
    )
  })

  it('returns the original URL for non-CDN hosts', () => {
    const url = 'https://example.com/image.jpg'
    expect(proxyImageUrl(url)).toBe(url)
  })

  it('returns empty string for empty input', () => {
    expect(proxyImageUrl('')).toBe('')
  })

  it('returns data URIs unchanged', () => {
    const dataUri = 'data:image/svg+xml;base64,PHN2Zy8+'
    expect(proxyImageUrl(dataUri)).toBe(dataUri)
  })

  it('returns relative URLs unchanged', () => {
    expect(proxyImageUrl('/local/image.png')).toBe('/local/image.png')
  })

  it('returns http:// URLs unchanged (only https is proxied)', () => {
    const url = 'http://i.scdn.co/image/abc'
    expect(proxyImageUrl(url)).toBe(url)
  })
})
