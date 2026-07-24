export type Theme = 'light' | 'dark' | 'system';

export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  getTheme: () => Theme;
  toggleTheme: () => void;
  isLoaded: boolean;
}

export interface ThemeCardProps {
  id: Theme;
  title: string;
  description: string;
  icon: 'sun' | 'moon' | 'laptop';
  selected: boolean;
  onSelect: (theme: Theme) => void;
}
