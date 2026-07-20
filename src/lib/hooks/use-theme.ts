'use client';

import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

export const themeStorageKey = 'job-funnel-theme';
export const themeChangeEvent = 'job-funnel-theme-change';

function subscribe(callback: () => void) {
  window.addEventListener(themeChangeEvent, callback);
  return () => window.removeEventListener(themeChangeEvent, callback);
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getSnapshot, () => 'dark' as Theme);
}
