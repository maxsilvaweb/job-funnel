// src/components/layout/shell.tsx

import { Suspense } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import type { ReactNode } from 'react';

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full">
      <Suspense
        fallback={
          <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white p-4 lg:block" />
        }
      >
        <Sidebar />
      </Suspense>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
