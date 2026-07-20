// src/components/layout/sidebar.tsx

'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Table2,
  Kanban,
  Target,
  Settings,
} from 'lucide-react';

// Update navItems
const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/applications',
    label: 'Applications',
    icon: Table2,
  },
  {
    href: '/applications?view=kanban',
    label: 'Kanban',
    icon: Kanban,
  },
  {
    href: '/preferences',
    label: 'Preferences',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get('view');

  function checkActive(href: string) {
    const [path, query] = href.split('?');
    if (pathname !== path) return false;
    const wantsKanban = query === 'view=kanban';
    return wantsKanban ? view === 'kanban' : view !== 'kanban';
  }

  return (
    <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white p-4 lg:block">
      <div className="mb-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Target className="h-7 w-7 text-emerald-600" />
          <span className="text-lg font-bold text-zinc-900">Job Funnel</span>
        </Link>
      </div>

      <nav className="space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = checkActive(href);

          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
