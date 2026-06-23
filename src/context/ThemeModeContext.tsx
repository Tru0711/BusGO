import { createContext, useContext } from 'react';
import type { PaletteMode } from '@mui/material';

type ThemeModeContextValue = {
  mode: PaletteMode;
  toggleMode: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function useThemeMode() {
  const context = useContext(ThemeModeContext);

  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeContext provider.');
  }

  return context;
}

export default ThemeModeContext;