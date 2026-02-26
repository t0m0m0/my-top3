import { createTheme } from '@mui/material/styles'

const fontFamily = ['"M PLUS Rounded 1c"', '"Noto Sans JP"', 'sans-serif'].join(
  ',',
)

const displayFontFamily = [
  '"Zen Maru Gothic"',
  '"M PLUS Rounded 1c"',
  '"Noto Sans JP"',
  'sans-serif',
].join(',')

const theme = createTheme({
  palette: {
    primary: {
      main: '#EC4899', // pink
      light: '#F9A8D4', // light pink
      dark: '#BE185D', // dark pink
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8B5CF6', // lavender
      light: '#C4B5FD', // light lavender
      dark: '#6D28D9', // dark lavender
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
    },
    background: {
      default: '#FDF2F8', // pink-white
      paper: '#ffffff',
    },
    text: {
      primary: '#831843', // deep rose
      secondary: '#9CA3AF', // muted
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
          background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
          boxShadow: '0 4px 14px rgba(236,72,153,0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #BE185D 0%, #6D28D9 100%)',
            boxShadow: '0 6px 20px rgba(236,72,153,0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow:
            '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 4px 12px rgb(0 0 0 / 0.03)',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
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
            borderColor: '#EC4899',
          },
        },
      },
    },
  },
})

export default theme
