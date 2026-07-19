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
        'flex w-72 shrink-0 flex-col rounded-xl border bg-zinc-50 transition-colors',
        isOver ? 'border-indigo-300 bg-indigo-50' : 'border-zinc-200',
      )}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3">
        <div
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: STAGE_COLOURS[id] }}
        />
        <h3 className="text-sm font-semibold text-zinc-900 truncate flex-1">
          {label}
        </h3>
        <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-600 shrink-0">
          {count}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-1 flex-col gap-2 p-2 min-h-[120px]">
        {children}
        {count === 0 && (
          <div
            className={clsx(
              'flex h-24 items-center justify-center rounded-lg border-2 border-dashed text-xs transition-colors',
              isOver
                ? 'border-indigo-300 text-indigo-400'
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
