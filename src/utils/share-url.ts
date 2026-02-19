type ShareParams = {
  theme: string
  bookId: string
  musicId: string
  movieId: string
}

export async function createShortUrl(params: ShareParams): Promise<string> {
  const res = await fetch('/api/shares', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    throw new Error('短縮URLの作成に失敗しました')
  }

  const json = (await res.json()) as { ok: boolean; id?: string }
  if (!json.ok || !json.id) {
    throw new Error('短縮URLの作成に失敗しました')
  }

  return `/s/${json.id}`
}
