'use client';

import { Moon, Sun } from 'lucide-react';
import { useSyncExternalStore } from 'react';

const storageKey = 'job-funnel-theme';
const themeChangeEvent = 'job-funnel-theme-change';
type Theme = 'light' | 'dark';

const nextTheme: Record<Theme, Theme> = {
  light: 'dark',
  dark: 'light',
};

function subscribeToTheme(callback: () => void) {
  window.addEventListener(themeChangeEvent, callback);
  return () => window.removeEventListener(themeChangeEvent, callback);
}

function getThemeSnapshot(): Theme {
  if (document.documentElement.classList.contains('dark')) return 'dark';
  return 'light';
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => 'light' as Theme,
  );

  function toggleTheme() {
    const next = nextTheme[theme];
    document.documentElement.classList.remove('dark');
    if (next !== 'light') document.documentElement.classList.add(next);
    localStorage.setItem(storageKey, next);
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
