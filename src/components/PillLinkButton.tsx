import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Button from '@mui/material/Button'

type PillColor = 'primary' | 'secondary'

type Props = {
  to: string
  color?: PillColor
  children: ReactNode
}

const colorMap: Record<PillColor, { main: string; dark: string }> = {
  primary: {
    main: 'var(--color-primary)',
    dark: 'var(--color-primary-dark)',
  },
  secondary: {
    main: 'var(--color-secondary)',
    dark: 'var(--color-secondary-dark)',
  },
}

export default function PillLinkButton({
  to,
  color = 'primary',
  children,
}: Props) {
  const { main, dark } = colorMap[color]

  return (
    <Button
      component={Link}
      to={to}
      variant="outlined"
      sx={{
        borderRadius: '9999px',
        px: 4,
        py: 1,
        borderColor: main,
        color: main,
        fontWeight: 600,
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: dark,
          backgroundColor: main,
          color: '#fff',
        },
      }}
    >
      {children}
    </Button>
  )
}
