const SERVICE_PATTERNS: [RegExp, string][] = [
  [/books\.google\./i, 'Google Books で見る'],
  [/last\.fm/i, 'Last.fm で見る'],
  [/themoviedb\.org/i, 'TMDb で見る'],
  [/imdb\.com/i, 'IMDb で見る'],
  [/amazon\./i, 'Amazon で見る'],
  [/spotify\.com/i, 'Spotify で見る'],
]

/** Detect service name from external URL and return a localized label */
export function getServiceLabel(url: string): string {
  let hostname: string
  try {
    hostname = new URL(url).hostname
  } catch {
    return '詳しく見る'
  }
  for (const [pattern, label] of SERVICE_PATTERNS) {
    if (pattern.test(hostname)) return label
  }
  return '詳しく見る'
}
