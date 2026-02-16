import { createTheme } from '@mui/material/styles'

const fontFamily = ['"Noto Sans JP"', '"Sora"', 'sans-serif'].join(',')

const displayFontFamily = [
  '"Sora"',
  '"Outfit"',
  '"Noto Sans JP"',
  'sans-serif',
].join(',')

const theme = createTheme({
  palette: {
    primary: {
      main: '#0d9488', // teal-600
      light: '#14b8a6', // teal-500
      dark: '#0f766e', // teal-700
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f59e0b', // amber-500 (warm gold)
      light: '#fbbf24', // amber-400
      dark: '#d97706', // amber-600
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
    },
    background: {
      default: '#f8fafc', // slate-50
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b', // slate-800
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
    button: {
      fontFamily: displayFontFamily,
      fontWeight: 600,
      textTransform: 'none' as const,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          textTransform: 'none' as const,
          fontWeight: 600,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.03)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
          boxShadow: '0 4px 14px rgba(13, 148, 136, 0.25)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
            boxShadow: '0 6px 20px rgba(13, 148, 136, 0.35)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow:
            '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 4px 12px rgb(0 0 0 / 0.04)',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
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
