// src/components/applications/application-card.tsx

'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { STAGE_LABELS, SOURCE_LABELS } from '@/lib/constants';
import { timeAgo } from '@/lib/utils/dates';
import { clsx } from 'clsx';
import { ExternalLink, GripVertical, MapPin, Star } from 'lucide-react';
import Link from 'next/link';
import type { Application } from '@/types';

interface ApplicationCardProps {
  application: Application;
  isDragOverlay?: boolean;
}

export function ApplicationCard({
  application,
  isDragOverlay,
}: ApplicationCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: application.id });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'rounded-lg border border-zinc-200 bg-white p-3 shadow-sm',
        isDragging && 'opacity-50',
        isDragOverlay && 'rotate-2 shadow-xl ring-2 ring-indigo-500',
      )}
    >
      {/* Top row — company name + drag handle */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link
            href={`/applications/${application.id}`}
            className="block truncate text-sm font-semibold text-zinc-900 hover:text-indigo-600 transition-colors"
          >
            {application.company}
          </Link>
          <p className="truncate text-xs text-zinc-500 mt-0.5">
            {application.role}
          </p>
        </div>
        <button
          {...listeners}
          {...attributes}
          className="cursor-grab text-zinc-300 hover:text-zinc-500 active:cursor-grabbing shrink-0 mt-0.5"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>

      {/* Badge + source */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge status={application.status}>
          {STAGE_LABELS[application.status]}
        </Badge>
        <span className="text-[10px] text-zinc-400">
          {SOURCE_LABELS[application.source]}
        </span>
      </div>

      {/* Location */}
      {application.location && (
        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-zinc-400">
          <MapPin className="h-3 w-3" />
          <span>
            {application.location}
            {application.remote && ' · Remote'}
          </span>
        </div>
      )}

      {/* Salary / Day Rate */}
      {application.employment_type === 'contract'
        ? application.day_rate && (
            <div className="mt-1 flex items-center gap-1.5">
              <p className="text-[10px] font-medium text-emerald-600">
                £{application.day_rate.toLocaleString()}/day
              </p>
              {application.ir35_status &&
                application.ir35_status !== 'undetermined' && (
                  <span
                    className={`text-[10px] font-medium rounded-full px-1.5 py-0.5 ${
                      application.ir35_status === 'outside'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {application.ir35_status === 'outside'
                      ? 'Outside IR35'
                      : 'Inside IR35'}
                  </span>
                )}
            </div>
          )
        : application.salary_max && (
            <p className="mt-1 text-[10px] font-medium text-emerald-600">
              {application.salary_currency}{' '}
              {application.salary_min?.toLocaleString() ?? '?'}–
              {application.salary_max.toLocaleString()}
            </p>
          )}

      {/* Bottom row — time ago + priority + external link */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-zinc-400">
          {timeAgo(application.date_applied)}
        </span>
        <div className="flex items-center gap-2">
          {application.priority > 0 && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: application.priority }).map((_, i) => (
                <Star
                  key={i}
                  className="h-2.5 w-2.5 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
          )}
          {application.job_url && (
            <a
              href={application.job_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-indigo-500 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
