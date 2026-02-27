import { useState } from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import { useComments } from '../hooks/useComments'

function timeAgo(unixSeconds: number): string {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - unixSeconds
  if (diff < 60) return 'たった今'
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}日前`
  return new Date(unixSeconds * 1000).toLocaleDateString('ja-JP')
}

type Props = {
  shareId: string
}

export default function CommentSection({ shareId }: Props) {
  const {
    comments,
    total,
    loading,
    submitting,
    error,
    addComment,
    deleteComment,
    loadMore,
    hasMore,
    clientId,
  } = useComments(shareId)

  const [nickname, setNickname] = useState('')
  const [body, setBody] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    const success = await addComment(nickname.trim(), body.trim())
    if (success) {
      setBody('')
    }
  }

  const MAX_BODY = 140

  return (
    <div className="mt-8">
      <h2
        className="mb-4 text-lg font-bold"
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--color-text-primary)',
        }}
      >
        💬 コメント {total > 0 && `(${total})`}
      </h2>

      {/* Comment Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 rounded-xl border p-4"
        style={{
          borderColor: 'var(--color-border, #e5e7eb)',
          background: 'var(--color-surface, #fff)',
        }}
      >
        <TextField
          label="ニックネーム（任意）"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          size="small"
          fullWidth
          inputProps={{ maxLength: 20 }}
          sx={{ mb: 1.5 }}
        />
        <TextField
          label="コメントを入力..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          size="small"
          fullWidth
          multiline
          minRows={2}
          maxRows={4}
          inputProps={{ maxLength: MAX_BODY }}
          helperText={`${body.length}/${MAX_BODY}`}
        />
        <div className="mt-2 flex items-center justify-between">
          {error && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          <div className="ml-auto">
            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={!body.trim() || submitting}
              sx={{
                borderRadius: '9999px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {submitting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                '送信'
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Comment List */}
      {loading && comments.length === 0 ? (
        <div className="flex justify-center py-4">
          <CircularProgress size={24} />
        </div>
      ) : comments.length === 0 ? (
        <p
          className="py-4 text-center text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          まだコメントはありません。最初のコメントを書いてみましょう！
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border p-3"
              style={{
                borderColor: 'var(--color-border, #e5e7eb)',
                background: 'var(--color-surface, #fff)',
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {comment.nickname}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {timeAgo(comment.createdAt)}
                  </span>
                </div>
                {comment.clientId === clientId && (
                  <IconButton
                    size="small"
                    onClick={() => deleteComment(comment.id)}
                    aria-label="コメントを削除"
                    sx={{ p: 0.5 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </div>
              <p
                className="mt-1 text-sm leading-relaxed"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {comment.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="mt-4 text-center">
          <Button
            onClick={loadMore}
            variant="text"
            size="small"
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            {loading ? <CircularProgress size={18} /> : 'もっと見る'}
          </Button>
        </div>
      )}
    </div>
  )
}
