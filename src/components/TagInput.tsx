import { useState } from 'react'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'

const MAX_TAGS = 5
const MAX_TAG_LENGTH = 20

type TagInputProps = {
  tags: string[]
  onChange: (tags: string[]) => void
}

function sanitizeTag(raw: string): string {
  return raw.replace(/^#/, '').trim()
}

export default function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()

    const tag = sanitizeTag(input)
    if (!tag) return
    if (tag.length > MAX_TAG_LENGTH) return
    if (tags.length >= MAX_TAGS) return
    if (tags.includes(tag)) return

    onChange([...tags, tag])
    setInput('')
  }

  const handleDelete = (tagToDelete: string) => {
    onChange(tags.filter((t) => t !== tagToDelete))
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <Chip
          key={tag}
          label={`#${tag}`}
          size="small"
          onDelete={() => handleDelete(tag)}
          sx={{
            borderRadius: '9999px',
            backgroundColor: 'var(--color-primary-a8)',
            color: 'var(--color-primary-dark)',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        />
      ))}
      <TextField
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="タグを追加"
        size="small"
        slotProps={{
          htmlInput: {
            maxLength: MAX_TAG_LENGTH + 5,
          },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <span style={{ color: 'var(--color-primary)', fontSize: 14 }}>#</span>
              </InputAdornment>
            ),
          },
        }}
        sx={{
          minWidth: 120,
          flex: '0 1 150px',
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'var(--color-surface)',
            borderRadius: '9999px',
            fontSize: '0.8rem',
          },
        }}
      />
      <span
        className="text-xs"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {tags.length} / {MAX_TAGS}
      </span>
    </div>
  )
}
