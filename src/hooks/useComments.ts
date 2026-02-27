import { useState, useCallback, useEffect } from 'react'

function getClientId(): string {
  let id = localStorage.getItem('clientId')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('clientId', id)
  }
  return id
}

export type Comment = {
  id: number
  nickname: string
  body: string
  clientId: string
  createdAt: number
}

type CommentListResult = {
  items: Comment[]
  total: number
}

export function useComments(shareId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clientId = getClientId()

  const fetchComments = useCallback(
    async (offset = 0) => {
      if (!shareId) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `/api/shares/${shareId}/comments?limit=20&offset=${offset}`,
        )
        if (!res.ok) throw new Error('Failed to load comments')
        const json = (await res.json()) as {
          ok: boolean
          data: CommentListResult
        }
        if (json.ok) {
          if (offset === 0) {
            setComments(json.data.items)
          } else {
            setComments((prev) => [...prev, ...json.data.items])
          }
          setTotal(json.data.total)
        }
      } catch {
        setError('コメントの読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    },
    [shareId],
  )

  useEffect(() => {
    fetchComments(0)
  }, [fetchComments])

  const addComment = useCallback(
    async (nickname: string, body: string) => {
      if (!shareId) return
      setSubmitting(true)
      setError(null)
      try {
        const res = await fetch(`/api/shares/${shareId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nickname, body, clientId }),
        })
        if (res.status === 429) {
          setError('投稿間隔が短すぎます。少し待ってから再度お試しください。')
          return false
        }
        if (!res.ok) throw new Error('Failed to post comment')
        const json = (await res.json()) as { ok: boolean; data: Comment }
        if (json.ok) {
          setComments((prev) => [json.data, ...prev])
          setTotal((prev) => prev + 1)
          return true
        }
        return false
      } catch {
        setError('コメントの投稿に失敗しました')
        return false
      } finally {
        setSubmitting(false)
      }
    },
    [shareId, clientId],
  )

  const deleteComment = useCallback(
    async (commentId: number) => {
      if (!shareId) return
      try {
        const res = await fetch(
          `/api/shares/${shareId}/comments/${commentId}`,
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId }),
          },
        )
        if (res.ok) {
          setComments((prev) => prev.filter((c) => c.id !== commentId))
          setTotal((prev) => prev - 1)
        }
      } catch {
        // Silently fail
      }
    },
    [shareId, clientId],
  )

  const loadMore = useCallback(() => {
    fetchComments(comments.length)
  }, [fetchComments, comments.length])

  const hasMore = comments.length < total

  return {
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
  }
}
