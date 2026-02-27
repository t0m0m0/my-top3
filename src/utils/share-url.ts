type ShareParams = {
  theme: string
  bookId: string
  musicId: string
  movieId: string
  bookThumb?: string
  musicThumb?: string
  movieThumb?: string
  tags?: string[]
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

/**
 * Upload a pre-generated OGP image for a share.
 * Returns true on success, false on failure (non-critical).
 */
export async function uploadShareImage(
  shareId: string,
  blob: Blob,
): Promise<boolean> {
  try {
    const res = await fetch(`/api/shares/${shareId}/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'image/png' },
      body: blob,
    })
    return res.ok
  } catch {
    console.warn('[uploadShareImage] failed')
    return false
  }
}
