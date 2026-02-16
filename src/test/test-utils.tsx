/* eslint-disable react-refresh/only-export-components */
import type { ReactElement, ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import theme from '../theme'
import { SelectionProvider } from '../contexts/SelectionContext'

function AllProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <SelectionProvider>{children}</SelectionProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

export * from '@testing-library/react'
export { customRender as render }
