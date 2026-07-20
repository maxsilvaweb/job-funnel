// src/components/applications/kanban-board.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useApplications, useUpdateStatus } from '@/lib/hooks/use-applications';
import { KanbanColumn } from './kanban-column';
import { ApplicationCard } from './application-card';
import { STAGE_LABELS } from '@/lib/constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import type { Application, ApplicationStatus } from '@/types';

// All stages that appear as columns including terminal ones
const KANBAN_STAGES: ApplicationStatus[] = [
  'discovered',
  'applied',
  'responded',
  'screening',
  'tech_interview',
  'final_round',
  'offer',
  'accepted',
  'rejected',
  'ghosted',
];

export function KanbanBoard() {
  const { data: applications, isLoading, isError, error } = useApplications();
  const updateStatus = useUpdateStatus();
  const [activeApp, setActiveApp] = useState<Application | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    // 1px tolerance to avoid sub-pixel rounding flicker
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState, applications]);

  function scrollByDirection(direction: 'left' | 'right') {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // Require 8px of movement before drag starts
        // This prevents accidental drags when clicking links
        distance: 8,
      },
    }),
  );

  const columns = KANBAN_STAGES.map((stage) => ({
    id: stage,
    label: STAGE_LABELS[stage],
    applications: (applications || []).filter((a) => a.status === stage),
  }));

  function handleDragStart(event: DragStartEvent) {
    const app = applications?.find((a) => a.id === event.active.id);
    setActiveApp(app || null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveApp(null);

    const { active, over } = event;
    if (!over) return;

    const appId = active.id as string;
    const newStatus = over.id as ApplicationStatus;

    const app = applications?.find((a) => a.id === appId);
    if (!app || app.status === newStatus) return;

    updateStatus.mutate({ id: appId, status: newStatus });
  }

  function handleDragCancel() {
    setActiveApp(null);
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border-2 border-dashed border-zinc-200">
        <div className="text-center">
          <p className="text-lg font-medium text-zinc-500">
            Could not load applications
          </p>
          <p className="mt-1 max-w-md text-sm text-zinc-400">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  if (!applications?.length) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border-2 border-dashed border-zinc-200">
        <div className="text-center">
          <p className="text-lg font-medium text-zinc-500">
            No applications yet
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Add your first application to see the Kanban board
          </p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="relative">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByDirection('left')}
            aria-label="Scroll columns left"
            className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-emerald-600 bg-emerald-600 p-2 text-white shadow-md transition-colors hover:bg-emerald-700 hover:border-emerald-700"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByDirection('right')}
            aria-label="Scroll columns right"
            className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-emerald-600 bg-emerald-600 p-2 text-white shadow-md transition-colors hover:bg-emerald-700 hover:border-emerald-700"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="kanban-scroll flex gap-4 overflow-x-auto pb-4"
        >
          {columns.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              label={col.label}
              count={col.applications.length}
            >
              {col.applications.map((app) => (
                <ApplicationCard key={app.id} application={app} />
              ))}
            </KanbanColumn>
          ))}
        </div>
      </div>

      {/* Drag overlay — shown while dragging */}
      <DragOverlay>
        {activeApp ? (
          <ApplicationCard application={activeApp} isDragOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
