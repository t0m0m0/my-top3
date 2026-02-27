import { useNavigate } from 'react-router-dom'
import Chip from '@mui/material/Chip'

type TagListProps = {
  tags: string[]
  clickable?: boolean
}

export default function TagList({ tags, clickable = true }: TagListProps) {
  const navigate = useNavigate()

  const handleClick = (tag: string) => {
    if (clickable) {
      navigate(`/gallery?tag=${encodeURIComponent(tag)}`)
    }
  }

  return (
    <>
      {tags.map((tag) => (
        <Chip
          key={tag}
          label={`#${tag}`}
          size="small"
          clickable={clickable}
          onClick={clickable ? () => handleClick(tag) : undefined}
          sx={{
            borderRadius: '9999px',
            backgroundColor: 'var(--color-primary-a8)',
            color: 'var(--color-primary-dark)',
            fontSize: '0.7rem',
            fontWeight: 600,
            '&:hover': clickable
              ? {
                  backgroundColor: 'var(--color-primary-a20)',
                }
              : {},
          }}
        />
      ))}
    </>
  )
}
