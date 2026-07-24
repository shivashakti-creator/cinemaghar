import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { ThemeCard } from './ThemeCard';
import { Theme } from '../../types/theme';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const handleSelect = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" role="radiogroup" aria-label="Theme selection options">
      <ThemeCard
        id="light"
        title="Light"
        description="Bright interface with excellent readability."
        icon="sun"
        selected={theme === 'light'}
        onSelect={handleSelect}
      />

      <ThemeCard
        id="dark"
        title="Dark"
        description="Cinematic experience with deep black colors."
        icon="moon"
        selected={theme === 'dark'}
        onSelect={handleSelect}
      />

      <ThemeCard
        id="system"
        title="System"
        description="Automatically follows your device settings."
        icon="laptop"
        selected={theme === 'system'}
        onSelect={handleSelect}
      />
    </div>
  );
};
