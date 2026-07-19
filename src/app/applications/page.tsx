// src/app/applications/page.tsx

'use client';

import { useState } from 'react';
import { Shell } from '@/components/layout/shell';
import { KanbanBoard } from '@/components/applications/kanban-board';
import { ApplicationForm } from '@/components/applications/application-form';
import { ApplicationTable } from '@/components/applications/application-table';
import { Card } from '@/components/ui/card';
import { Plus, Kanban, Table2, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ApplicationsContent() {
  const [showForm, setShowForm] = useState(false);
  const searchParams = useSearchParams();
  const [currentView, setCurrentView] = useState<'table' | 'kanban'>(
    searchParams.get('view') === 'kanban' ? 'kanban' : 'table',
  );

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Applications</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Track every application through the funnel
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex rounded-lg border border-zinc-200">
              <button
                onClick={() => setCurrentView('table')}
                className={clsx(
                  'flex items-center gap-1.5 rounded-l-lg px-3 py-1.5 text-sm transition-colors',
                  currentView === 'table'
                    ? 'bg-zinc-100 text-zinc-900 font-medium'
                    : 'text-zinc-500 hover:text-zinc-700',
                )}
              >
                <Table2 className="h-4 w-4" />
                Table
              </button>
              <button
                onClick={() => setCurrentView('kanban')}
                className={clsx(
                  'flex items-center gap-1.5 rounded-r-lg px-3 py-1.5 text-sm transition-colors',
                  currentView === 'kanban'
                    ? 'bg-zinc-100 text-zinc-900 font-medium'
                    : 'text-zinc-500 hover:text-zinc-700',
                )}
              >
                <Kanban className="h-4 w-4" />
                Kanban
              </button>
            </div>

            {/* Add button */}
            <button
              onClick={() => setShowForm(!showForm)}
              className={clsx(
                'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-colors',
                showForm
                  ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700',
              )}
            >
              {showForm ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Application
                </>
              )}
            </button>
          </div>
        </div>

        {/* Inline form */}
        {showForm && (
          <Card>
            <h2 className="mb-6 text-lg font-semibold text-zinc-900">
              New Application
            </h2>
            <ApplicationForm onSuccess={() => setShowForm(false)} />
          </Card>
        )}

        {/* View */}
        {currentView === 'kanban' ? <KanbanBoard /> : <ApplicationTable />}
      </div>
    </Shell>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense>
      <ApplicationsContent />
    </Suspense>
  );
}
