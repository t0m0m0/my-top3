import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'
import ErrorMessage from '../components/ErrorMessage'
import Top3Content from '../components/Top3Content'

type ShareData = {
  theme: string
  bookId: string
  musicId: string
  movieId: string
}

function ShortUrlPage() {
  const { id } = useParams<{ id: string }>()
  const hasId = !!id
  const [data, setData] = useState<ShareData | null>(null)
  const [loading, setLoading] = useState(hasId)
  const [error, setError] = useState<string | null>(
    hasId ? null : '共有リンクが見つかりません。',
  )

  useEffect(() => {
    if (!id) return

    let cancelled = false

    fetch(`/api/shares/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('共有リンクが見つかりません。')
        }
        const json = await res.json()
        if (!json.ok) {
          throw new Error('共有リンクが見つかりません。')
        }
        if (!cancelled) {
          setData(json.data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : '共有リンクの読み込みに失敗しました。',
          )
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{
          background:
            'linear-gradient(180deg, var(--color-bg) 0%, #eef2ff 100%)',
        }}
      >
        <CircularProgress />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div
        className="min-h-screen"
        style={{
          background:
            'linear-gradient(180deg, var(--color-bg) 0%, #eef2ff 100%)',
        }}
      >
        <div className="mx-auto max-w-4xl px-3 py-4 text-center sm:px-4 sm:py-6 lg:py-8">
          <ErrorMessage message={error ?? '共有リンクが見つかりません。'}>
            <Button component={Link} to="/" variant="outlined" size="small">
              Top3を作成する
            </Button>
          </ErrorMessage>
        </div>
      </div>
    )
  }

  return <Top3Content params={data} />
}

export default ShortUrlPage
