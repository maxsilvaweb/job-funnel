// src/components/applications/kanban-column.tsx

'use client';

import { useDroppable } from '@dnd-kit/core';
import { clsx } from 'clsx';
import { STAGE_COLOURS } from '@/lib/constants';
import type { ApplicationStatus } from '@/types';
import type { ReactNode } from 'react';

interface KanbanColumnProps {
  id: ApplicationStatus;
  label: string;
  count: number;
  children: ReactNode;
}

export function KanbanColumn({
  id,
  label,
  count,
  children,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'flex h-full w-72 shrink-0 flex-col overflow-hidden rounded-xl border bg-white transition-colors',
        isOver
          ? 'kanban-drop-active border-teal-400 bg-indigo-50'
          : 'border-zinc-200',
      )}
    >
      {/* Sticky column header */}
      <div className="flex shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-4 py-3">
        <div
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: STAGE_COLOURS[id] }}
        />
        <h3 className="flex-1 truncate text-sm font-semibold text-zinc-900">
          {label}
        </h3>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-white"
          style={{ backgroundColor: STAGE_COLOURS[id] }}
        >
          {count}
        </span>
      </div>

      {/* Scrollable card list */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
        {children}
        {count === 0 && (
          <div
            className={clsx(
              'flex h-24 shrink-0 items-center justify-center rounded-lg border-2 border-dashed text-xs transition-colors',
              isOver
                ? 'border-teal-400 text-teal-400'
                : 'border-zinc-200 text-zinc-400',
            )}
          >
            {isOver ? 'Drop here' : 'Empty'}
          </div>
        )}
      </div>
    </div>
  );
}
