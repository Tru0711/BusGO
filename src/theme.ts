import { createTheme, PaletteMode } from '@mui/material/styles';

export function getBusGoTheme(mode: PaletteMode) {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#0F766E',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#F59E0B',
        contrastText: '#FFFFFF',
      },
      background: {
        default: isDark ? '#081418' : '#F7F4EE',
        paper: isDark ? '#0F1C22' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#EAF2F4' : '#17313B',
        secondary: isDark ? '#B8C6CB' : '#5F6F70',
      },
      divider: isDark ? 'rgba(234, 242, 244, 0.10)' : 'rgba(23, 49, 59, 0.12)',
    },
    shape: {
      borderRadius: 20,
    },
    typography: {
      fontFamily: '"Poppins", "Segoe UI", sans-serif',
      h1: {
        fontWeight: 800,
        letterSpacing: '-0.04em',
      },
      h2: {
        fontWeight: 800,
        letterSpacing: '-0.03em',
      },
      h3: {
        fontWeight: 700,
      },
      h4: {
        fontWeight: 700,
      },
      h5: {
        fontWeight: 700,
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ':root': {
            colorScheme: mode,
          },
          body: {
            background: isDark
              ? 'radial-gradient(circle at top, rgba(15, 118, 110, 0.18), transparent 42%), linear-gradient(180deg, #081418 0%, #0D1720 100%)'
              : 'linear-gradient(180deg, #fbf8f1 0%, #f1ece2 100%)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            paddingInline: 20,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          size: 'medium',
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundColor: isDark ? '#0B151B' : '#FFFFFF',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 600,
          },
        },
      },
    },
  });
}
