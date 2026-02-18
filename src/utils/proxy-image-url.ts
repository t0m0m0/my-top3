const PROXY_HOSTS = new Set([
  'books.google.com',
  'books.googleusercontent.com',
  'lastfm.freetls.fastly.net',
  'image.tmdb.org',
])

/**
 * 外部CDNの画像URLを自ドメインのプロキシエンドポイント経由のURLに変換する。
 * CORS問題を回避し、html2canvasでの画像取得を確実にする。
 *
 * 対象外のURL（ローカル、data URI、非対象ホスト）はそのまま返す。
 */
export function proxyImageUrl(url: string): string {
  if (!url) return ''

  // data URI やローカルパスはそのまま
  if (url.startsWith('data:') || url.startsWith('/')) return url

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return url
  }

  // https のみプロキシ対象
  if (parsed.protocol !== 'https:') return url

  if (!PROXY_HOSTS.has(parsed.hostname)) return url

  return `/api/image/proxy?url=${encodeURIComponent(url)}`
}
