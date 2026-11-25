import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
};

const STORAGE_KEY = 'cinebook-theme';
const MEDIA_QUERY = '(prefers-color-scheme: dark)';

/**
 * ThemeProvider
 *
 * Owns the active theme ('dark' | 'light'). Dark is the default per the
 * design system. The selection is persisted to localStorage and falls back
 * to the OS preference on first visit.
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light';
  });
  const [systemTheme, setSystemTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light';
  });

  // Keep systemTheme in sync if the user changes OS preference while the
  // theme is still set to "system".
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia(MEDIA_QUERY);
    const handler = (e) => setSystemTheme(e.matches ? 'dark' : 'light');
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  // Apply the theme to <html data-theme="..."> and persist the choice.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage may be unavailable (private mode); ignore.
    }
  }, [theme]);

  const setTheme = useCallback((next) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(
    () => ({ theme, systemTheme, setTheme, toggleTheme }),
    [theme, systemTheme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeContext;