import { MoonStar, SunMedium } from 'lucide-react';
import { useThemeMode } from '../../context/ThemeModeContext';

export const DarkModeToggle: React.FC = () => {
  const theme = useThemeMode();
  const isDark = theme.mode === 'dark';

  return (
    <button
      type="button"
      onClick={theme.toggleMode}
      aria-label="Toggle dark mode"
      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/75 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800"
    >
      {isDark ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
      <span className="hidden sm:inline">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
};

export default DarkModeToggle;
