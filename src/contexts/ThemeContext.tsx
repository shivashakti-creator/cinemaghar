import { createContext } from 'react';
import { ThemeContextType } from '../types/theme';

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  resolvedTheme: 'dark',
  setTheme: () => {},
  getTheme: () => 'system',
  toggleTheme: () => {},
  isLoaded: false
});
