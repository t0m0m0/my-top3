import { createTheme } from '@mui/material/styles'

const fontFamily = [
  '"Noto Sans JP"',
  '"Outfit"',
  'sans-serif',
].join(',')

const displayFontFamily = [
  '"Outfit"',
  '"Noto Sans JP"',
  'sans-serif',
].join(',')

const theme = createTheme({
  palette: {
    primary: {
      main: '#0d9488',      // teal-600
      light: '#14b8a6',     // teal-500
      dark: '#0f766e',      // teal-700
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f59e0b',      // amber-500 (warm gold)
      light: '#fbbf24',     // amber-400
      dark: '#d97706',      // amber-600
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
    },
    background: {
      default: '#f8fafc',   // slate-50
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',   // slate-800
      secondary: '#64748b', // slate-500
    },
  },
  typography: {
    fontFamily,
    h1: { fontFamily: displayFontFamily, fontWeight: 800 },
    h2: { fontFamily: displayFontFamily, fontWeight: 700 },
    h3: { fontFamily: displayFontFamily, fontWeight: 700 },
    h4: { fontFamily: displayFontFamily, fontWeight: 700 },
    h5: { fontFamily: displayFontFamily, fontWeight: 600 },
    h6: { fontFamily: displayFontFamily, fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { fontFamily: displayFontFamily, fontWeight: 600, textTransform: 'none' as const },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: 'none' as const,
          fontWeight: 600,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontWeight: 600,
          fontFamily: displayFontFamily,
          fontSize: '0.95rem',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#0d9488',
          },
        },
      },
    },
  },
})

export default theme
