import { createTheme } from '@mui/material/styles'

const fontFamily = ['"M PLUS Rounded 1c"', '"Noto Sans JP"', 'sans-serif'].join(
  ',',
)

const displayFontFamily = [
  '"M PLUS Rounded 1c"',
  '"Noto Sans JP"',
  'sans-serif',
].join(',')

const theme = createTheme({
  palette: {
    primary: {
      main: '#a855f7', // purple-500
      light: '#c084fc', // purple-400
      dark: '#9333ea', // purple-600
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ec4899', // pink-500
      light: '#f472b6', // pink-400
      dark: '#db2777', // pink-600
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
    },
    background: {
      default: '#fdf4ff', // fuchsia-50
      paper: '#ffffff',
    },
    text: {
      primary: '#1e1b2e',
      secondary: '#78716c',
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
          background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
          boxShadow: '0 4px 14px rgba(168, 85, 247, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #9333ea 0%, #db2777 100%)',
            boxShadow: '0 6px 20px rgba(168, 85, 247, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow:
            '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 4px 12px rgb(0 0 0 / 0.03)',
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
            borderColor: '#a855f7',
          },
        },
      },
    },
  },
})

export default theme
