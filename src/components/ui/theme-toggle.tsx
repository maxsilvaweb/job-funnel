'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

const storageKey = 'job-funnel-theme';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggleTheme() {
    const nextIsDark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', nextIsDark);
    localStorage.setItem(storageKey, nextIsDark ? 'dark' : 'light');
    setIsDark(nextIsDark);
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
