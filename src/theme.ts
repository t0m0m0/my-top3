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
      main: '#a0845e', // warm brown
      light: '#c4a882', // light brown
      dark: '#7c6544', // dark brown
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#d4829c', // rose pink
      light: '#f0b4c8', // light rose
      dark: '#b5607a', // dark rose
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
    },
    background: {
      default: '#faf8f5', // warm cream
      paper: '#ffffff',
    },
    text: {
      primary: '#3d3028', // dark brown
      secondary: '#8c7e72', // warm grey
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
          background: 'linear-gradient(135deg, #a0845e 0%, #d4829c 100%)',
          boxShadow: '0 4px 14px rgba(160, 132, 94, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #7c6544 0%, #b5607a 100%)',
            boxShadow: '0 6px 20px rgba(160, 132, 94, 0.4)',
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
            borderColor: '#a0845e',
          },
        },
      },
    },
  },
})

export default theme
