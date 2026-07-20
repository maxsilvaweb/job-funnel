'use client';

import { Moon, Sun } from 'lucide-react';
import {
  useTheme,
  themeStorageKey,
  themeChangeEvent,
  type Theme,
} from '@/lib/hooks/use-theme';

const nextTheme: Record<Theme, Theme> = {
  light: 'dark',
  dark: 'light',
};

export function ThemeToggle() {
  const theme = useTheme();

  function toggleTheme() {
    const next = nextTheme[theme];
    document.documentElement.classList.remove('dark');
    if (next !== 'light') document.documentElement.classList.add(next);
    localStorage.setItem(themeStorageKey, next);
    window.dispatchEvent(new Event(themeChangeEvent));
  }

  const next = nextTheme[theme];
  const Icon = theme === 'dark' ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
