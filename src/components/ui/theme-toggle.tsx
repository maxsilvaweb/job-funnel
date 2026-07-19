'use client';

import { Moon, Sun } from 'lucide-react';
import { useSyncExternalStore } from 'react';

const storageKey = 'job-funnel-theme';
const themeChangeEvent = 'job-funnel-theme-change';

function subscribeToTheme(callback: () => void) {
  window.addEventListener(themeChangeEvent, callback);
  return () => window.removeEventListener(themeChangeEvent, callback);
}

function getThemeSnapshot() {
  return document.documentElement.classList.contains('dark');
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => false,
  );

  function toggleTheme() {
    const nextIsDark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', nextIsDark);
    localStorage.setItem(storageKey, nextIsDark ? 'dark' : 'light');
    window.dispatchEvent(new Event(themeChangeEvent));
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
