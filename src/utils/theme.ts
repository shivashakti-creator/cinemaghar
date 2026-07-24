import { Theme, ResolvedTheme } from '../types/theme';
import { supabase } from '../lib/supabase';

const THEME_STORAGE_KEY = 'gajuri_cinema_theme';

/**
 * Get stored theme preference from localStorage with 'system' fallback
 */
export const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch (err) {
    console.warn('Unable to access localStorage for theme:', err);
  }
  return 'system';
};

/**
 * Save theme choice into localStorage
 */
export const setStoredTheme = (theme: Theme): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (err) {
    console.warn('Unable to write theme to localStorage:', err);
  }
};

/**
 * Detect user OS / Browser color scheme preference
 */
export const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Resolve 'system' to actual 'light' or 'dark'
 */
export const resolveTheme = (theme: Theme): ResolvedTheme => {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
};

/**
 * Apply resolved theme class and color-scheme meta attributes to HTML document root
 */
export const applyThemeToDocument = (resolvedTheme: ResolvedTheme): void => {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  const body = document.body;

  // Remove existing classes
  root.classList.remove('light', 'dark');
  body.classList.remove('light', 'dark');

  // Add target class
  root.classList.add(resolvedTheme);
  body.classList.add(resolvedTheme);

  // Set standard HTML color-scheme property
  root.style.colorScheme = resolvedTheme;
  root.setAttribute('data-theme', resolvedTheme);
};

/**
 * Sync user's theme selection to Supabase profile
 */
export const saveThemeToSupabaseProfile = async (emailOrId: string, theme: Theme): Promise<void> => {
  if (!emailOrId) return;
  try {
    // Attempt updating profiles table
    const { error } = await supabase
      .from('profiles')
      .update({ theme, updated_at: new Date().toISOString() })
      .eq('email', emailOrId);

    if (error) {
      // Fallback: try user_settings or metadata if profile update doesn't exist
      console.info('Supabase theme profile sync info:', error.message);
    }
  } catch (err) {
    console.warn('Failed syncing theme to Supabase profile:', err);
  }
};

/**
 * Fetch user's theme preference from Supabase profile if logged in
 */
export const fetchThemeFromSupabaseProfile = async (emailOrId: string): Promise<Theme | null> => {
  if (!emailOrId) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('theme')
      .eq('email', emailOrId)
      .maybeSingle();

    if (!error && data?.theme) {
      if (data.theme === 'light' || data.theme === 'dark' || data.theme === 'system') {
        return data.theme as Theme;
      }
    }
  } catch (err) {
    console.warn('Failed fetching theme from Supabase profile:', err);
  }
  return null;
};
