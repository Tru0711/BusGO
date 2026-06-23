import { StrictMode, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider, type PaletteMode } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import ThemeModeContext from './context/ThemeModeContext';
import { AuthProvider } from './contexts/AuthContext';
import { getBusGoTheme } from './theme';
import './styles.css';
import './tailwind-safelist.css';

function Root() {
  const [mode, setMode] = useState<PaletteMode>(() => {
    const storedMode = localStorage.getItem('busgo-theme-mode');
    return storedMode === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('busgo-theme-mode', mode);
  }, [mode]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  const theme = useMemo(() => getBusGoTheme(mode), [mode]);

  const themeModeValue = useMemo(
    () => ({
      mode,
      toggleMode: () => setMode((currentMode) => (currentMode === 'light' ? 'dark' : 'light')),
    }),
    [mode],
  );

  return (
    <ThemeModeContext.Provider value={themeModeValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '18px',
              background: 'rgba(15, 23, 42, 0.94)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 80px -24px rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(24px)',
            },
          }}
        />
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </StrictMode>,
);
