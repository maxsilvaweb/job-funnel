// src/app/applications/applications-view.tsx

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KanbanBoard } from '@/components/applications/kanban-board';
import { ApplicationTable } from '@/components/applications/application-table';
import { Plus, Kanban, Table2 } from 'lucide-react';
import { clsx } from 'clsx';

interface ApplicationsViewProps {
  view: 'table' | 'kanban';
}

export function ApplicationsView({ view }: ApplicationsViewProps) {
  const router = useRouter();

  return (
    <div
      className={clsx(
        view === 'kanban'
          ? 'flex h-full flex-col gap-4'
          : 'space-y-6',
      )}
    >
      <div className="flex shrink-0 items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Applications</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Track every application through the funnel
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-zinc-200">
            <Link
              href="/applications"
              className={clsx(
                'flex items-center gap-1.5 rounded-l-lg px-3 py-1.5 text-sm transition-colors',
                view === 'table'
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-zinc-500 hover:text-zinc-700',
              )}
            >
              <Table2 className="h-4 w-4" />
              Table
            </Link>
            <Link
              href="/kanban"
              className={clsx(
                'flex items-center gap-1.5 rounded-r-lg px-3 py-1.5 text-sm transition-colors',
                view === 'kanban'
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-zinc-500 hover:text-zinc-700',
              )}
            >
              <Kanban className="h-4 w-4" />
              Kanban
            </Link>
          </div>

          <button
            type="button"
            onClick={() => router.push('/applications/new')}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Application
          </button>
        </div>
      </div>

      {view === 'kanban' ? (
        <div className="min-h-0 flex-1">
          <KanbanBoard />
        </div>
      ) : (
        <ApplicationTable />
      )}
    </div>
  );
}
