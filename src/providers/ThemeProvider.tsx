import React, { useState, useEffect, useCallback } from 'react';
import { Theme, ResolvedTheme } from '../types/theme';
import { ThemeContext } from '../contexts/ThemeContext';
import {
  getStoredTheme,
  setStoredTheme,
  resolveTheme,
  applyThemeToDocument,
  saveThemeToSupabaseProfile,
  fetchThemeFromSupabaseProfile
} from '../utils/theme';
import { useCinema } from '../context/CinemaContext';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { user } = useCinema() || {};
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize theme from Supabase user profile or localStorage fallback
  useEffect(() => {
    let isMounted = true;

    const initializeTheme = async () => {
      let initialTheme: Theme = getStoredTheme();

      // Check Supabase profile if user is logged in
      if (user?.email) {
        const profileTheme = await fetchThemeFromSupabaseProfile(user.email);
        if (profileTheme) {
          initialTheme = profileTheme;
        }
      }

      if (isMounted) {
        setThemeState(initialTheme);
        const resolved = resolveTheme(initialTheme);
        setResolvedTheme(resolved);
        applyThemeToDocument(resolved);
        setIsLoaded(true);
      }
    };

    initializeTheme();

    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  // Update theme and persist changes
  const setTheme = useCallback(
    async (newTheme: Theme) => {
      setThemeState(newTheme);
      setStoredTheme(newTheme);

      const resolved = resolveTheme(newTheme);
      setResolvedTheme(resolved);
      applyThemeToDocument(resolved);

      // Save to Supabase profile if logged in
      if (user?.email) {
        await saveThemeToSupabaseProfile(user.email, newTheme);
      }
    },
    [user?.email]
  );

  // Toggle theme utility
  const toggleTheme = useCallback(() => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  }, [theme, setTheme]);

  // Getter
  const getTheme = useCallback(() => theme, [theme]);

  // Listen to OS theme changes when theme === 'system'
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const resolved: ResolvedTheme = e.matches ? 'dark' : 'light';
        setResolvedTheme(resolved);
        applyThemeToDocument(resolved);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      mediaQuery.addListener(handleSystemThemeChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        getTheme,
        toggleTheme,
        isLoaded
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
