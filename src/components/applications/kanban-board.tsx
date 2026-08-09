// src/components/applications/kanban-board.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { OnHoldCommentModal } from './on-hold-comment-modal';
import { KanbanColumn } from './kanban-column';
import { ApplicationCard } from './application-card';
import { ApplicationRowPreview } from './application-row-preview';
import {
  ACTIVE_KANBAN_STAGES,
  KANBAN_STAGES,
  STAGE_LABELS,
  getApplicationWorkMode,
} from '@/lib/constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Select } from '@/components/ui/select';
import { clsx } from 'clsx';
import type { Application, ApplicationStatus } from '@/types';

const MIN_SCORE_OPTIONS = [
  { value: 0, label: 'Any score' },
  { value: 50, label: '50+' },
  { value: 70, label: '70+' },
  { value: 85, label: '85+' },
] as const;

export function KanbanBoard() {
  const { data: applications, isLoading, isError, error } = useApplications();
  const updateStatus = useUpdateStatus();
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{
    id: string;
    status: ApplicationStatus;
  } | null>(null);

  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewRect, setPreviewRect] = useState<DOMRect | null>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const showPreviewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hidePreviewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hoveredAppId, setHoveredAppId] = useState<string | null>(null);

  const [hideClosed, setHideClosed] = useState(false);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [minScore, setMinScore] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
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
  }, [updateScrollState, applications, hideClosed]);

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
        distance: 8,
      },
    }),
  );

  const filteredApplications = useMemo(() => {
    return (applications || []).filter((app) => {
      if (remoteOnly && getApplicationWorkMode(app) !== 'remote') return false;
      if (minScore > 0 && (app.ai_score == null || app.ai_score < minScore)) {
        return false;
      }
      return true;
    });
  }, [applications, remoteOnly, minScore]);

  const visibleStages = hideClosed ? ACTIVE_KANBAN_STAGES : KANBAN_STAGES;

  const columns = visibleStages.map((stage) => ({
    id: stage,
    label: STAGE_LABELS[stage],
    applications: filteredApplications.filter((a) => a.status === stage),
  }));

  function clearPreviewTimers() {
    if (showPreviewTimer.current) {
      clearTimeout(showPreviewTimer.current);
      showPreviewTimer.current = null;
    }
    if (hidePreviewTimer.current) {
      clearTimeout(hidePreviewTimer.current);
      hidePreviewTimer.current = null;
    }
  }

  function schedulePreview(appId: string, element: HTMLElement) {
    clearPreviewTimers();
    const root = scrollRef.current;
    if (!root) return;
    const rect = element.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    showPreviewTimer.current = setTimeout(() => {
      setPreviewId(appId);
      setPreviewRect(rect);
      setContainerRect(rootRect);
    }, 280);
  }

  function scheduleHidePreview() {
    clearPreviewTimers();
    hidePreviewTimer.current = setTimeout(() => {
      setPreviewId(null);
      setPreviewRect(null);
      setContainerRect(null);
    }, 160);
  }

  function keepPreviewOpen() {
    clearPreviewTimers();
  }

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

    if (newStatus === 'on_hold') {
      setPendingStatusUpdate({ id: appId, status: newStatus });
    } else {
      updateStatus.mutate({ id: appId, status: newStatus });
    }
  }

  function handleOnHoldConfirm(comment: string, onHoldAt: string) {
    if (pendingStatusUpdate) {
      updateStatus.mutate({
        id: pendingStatusUpdate.id,
        status: pendingStatusUpdate.status,
        onHoldComment: comment,
        onHoldAt,
      });
      setPendingStatusUpdate(null);
    }
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

  const filtersActive = !hideClosed || remoteOnly || minScore > 0;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex h-full min-h-[24rem] flex-col gap-3">
        {/* Focus filters */}
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setHideClosed((v) => !v)}
            aria-pressed={hideClosed}
            className={clsx(
              'rounded-lg border px-3 py-1.5 text-sm transition-colors',
              hideClosed
                ? 'border-emerald-600 bg-emerald-50 font-medium text-emerald-700'
                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900',
            )}
          >
            Hide closed
          </button>

          <button
            type="button"
            onClick={() => setRemoteOnly((v) => !v)}
            aria-pressed={remoteOnly}
            className={clsx(
              'rounded-lg border px-3 py-1.5 text-sm transition-colors',
              remoteOnly
                ? 'border-emerald-600 bg-emerald-50 font-medium text-emerald-700'
                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900',
            )}
          >
            Remote only
          </button>

          <label className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white py-1.5 pl-3 pr-2 text-sm text-zinc-600">
            <span className="whitespace-nowrap">Min AI score</span>
            <Select
              variant="ghost"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
            >
              {MIN_SCORE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>

          {filtersActive && (
            <button
              type="button"
              onClick={() => {
                setHideClosed(true);
                setRemoteOnly(false);
                setMinScore(0);
              }}
              className="px-2 py-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-800"
            >
              Reset
            </button>
          )}

          <span className="ml-auto text-xs text-zinc-400">
            {filteredApplications.length} shown
            {filteredApplications.length !== applications.length
              ? ` of ${applications.length}`
              : ''}
          </span>
        </div>

        <div className="relative min-h-0 flex-1">
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollByDirection('left')}
              aria-label="Scroll columns left"
              className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-emerald-600 bg-emerald-600 p-2 text-white shadow-md transition-colors hover:border-emerald-700 hover:bg-emerald-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollByDirection('right')}
              aria-label="Scroll columns right"
              className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-emerald-600 bg-emerald-600 p-2 text-white shadow-md transition-colors hover:border-emerald-700 hover:bg-emerald-700"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          <div
            ref={scrollRef}
            className="kanban-scroll flex h-full gap-4 overflow-x-auto overflow-y-hidden pb-1"
          >
            {columns.map((col) => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                label={col.label}
                count={col.applications.length}
              >
                {col.applications.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onMouseEnter={(e) =>
                      schedulePreview(app.id, e.currentTarget)
                    }
                    onMouseLeave={scheduleHidePreview}
                  />
                ))}
              </KanbanColumn>
            ))}
          </div>

          {previewId && previewRect && containerRect && (
            <ApplicationRowPreview
              application={applications?.find((a) => a.id === previewId)!}
              anchorRect={previewRect}
              containerRect={containerRect}
              onMouseEnter={keepPreviewOpen}
              onMouseLeave={scheduleHidePreview}
            />
          )}
        </div>
      </div>

      <OnHoldCommentModal
        isOpen={!!pendingStatusUpdate}
        onClose={() => setPendingStatusUpdate(null)}
        onConfirm={handleOnHoldConfirm}
      />

      <DragOverlay>
        {activeApp ? (
          <div className="relative">
            <ApplicationCard application={activeApp} isDragOverlay />
            {activeApp.status === 'on_hold' && activeApp.on_hold_comment && (
              <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-lg border border-zinc-200 bg-white p-3 text-xs text-zinc-600 shadow-lg">
                <p className="font-semibold text-zinc-900 mb-1">On Hold</p>
                <p>{activeApp.on_hold_comment}</p>
              </div>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
