import { useState, useMemo } from 'react'

const MAX_THEME_LENGTH = 50

type UseThemeReturn = {
  theme: string
  setTheme: (value: string) => void
  isValid: boolean
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeInternal] = useState('')

  const setTheme = (value: string) => {
    setThemeInternal(value)
  }

  const isValid = useMemo(
    () => theme.length <= MAX_THEME_LENGTH,
    [theme.length],
  )

  return { theme, setTheme, isValid }
}

export { MAX_THEME_LENGTH }
