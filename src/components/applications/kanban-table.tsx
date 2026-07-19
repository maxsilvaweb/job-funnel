// src/components/applications/kanban-board.tsx

'use client';

import { useState } from 'react';
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
import { Loader2 } from 'lucide-react';
import type { Application, ApplicationStatus } from '@/types';

// All stages that appear as columns including terminal ones
const KANBAN_STAGES: ApplicationStatus[] = [
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
  const { data: applications, isLoading } = useApplications();
  const updateStatus = useUpdateStatus();
  const [activeApp, setActiveApp] = useState<Application | null>(null);

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
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
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
      <div className="flex gap-4 overflow-x-auto pb-4">
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

      {/* Drag overlay — shown while dragging */}
      <DragOverlay>
        {activeApp ? (
          <ApplicationCard application={activeApp} isDragOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
