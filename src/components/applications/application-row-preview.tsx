// src/components/applications/application-row-preview.tsx

'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import {
  SOURCE_LABELS,
  STAGE_LABELS,
  WORK_MODE_LABELS,
  getApplicationWorkMode,
} from '@/lib/constants';
import { formatDate } from '@/lib/utils/dates';
import { StageStatusBadge } from '@/components/applications/stage-status-badge';
import type { Application } from '@/types';
import { MapPin, User, Mail, Sparkles } from 'lucide-react';

const PREVIEW_WIDTH = 340;

const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: '£',
  USD: '$',
  EUR: '€',
};

function formatMoney(
  currency: string,
  min: number | null | undefined,
  max: number | null | undefined,
): string | null {
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  const parts = [min, max]
    .filter((n): n is number => n != null)
    .map((n) => n.toLocaleString());
  if (parts.length === 0) return null;
  if (parts.length === 1) return `${symbol}${parts[0]}`;
  if (parts[0] === parts[1]) return `${symbol}${parts[0]}`;
  return `${symbol}${parts[0]}–${parts[1]}`;
}

interface ApplicationRowPreviewProps {
  application: Application;
  anchorRect: DOMRect;
  containerRect: DOMRect;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function ApplicationRowPreview({
  application: app,
  anchorRect,
  containerRect,
  onMouseEnter,
  onMouseLeave,
}: ApplicationRowPreviewProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    arrowLeft: 24,
    placement: 'below' as 'below' | 'above',
  });

  useLayoutEffect(() => {
    const pad = 12;
    const gap = 8;
    const height = panelRef.current?.offsetHeight ?? 320;

    // Left-align under the company name, stay inside the table.
    let left = anchorRect.left - containerRect.left;
    left = Math.max(
      pad,
      Math.min(left, containerRect.width - PREVIEW_WIDTH - pad),
    );

    let placement: 'below' | 'above' = 'below';
    let top = anchorRect.bottom - containerRect.top + gap;
    if (top + height > containerRect.height - pad) {
      placement = 'above';
      top = Math.max(
        pad,
        anchorRect.top - containerRect.top - height - gap,
      );
    }

    const nameCenterX =
      anchorRect.left - containerRect.left + anchorRect.width / 2;
    const arrowLeft = Math.max(
      16,
      Math.min(nameCenterX - left - 6, PREVIEW_WIDTH - 28),
    );

    setCoords({ top, left, arrowLeft, placement });
  }, [anchorRect, containerRect]);

  const workMode = getApplicationWorkMode(app);
  const pay =
    app.employment_type === 'contract'
      ? formatMoney(app.salary_currency, app.day_rate_min, app.day_rate_max)
      : formatMoney(app.salary_currency, app.salary_min, app.salary_max);
  const payLabel =
    pay == null
      ? null
      : app.employment_type === 'contract'
        ? `${pay}/day`
        : pay;

  return (
    <div
      ref={panelRef}
      role="tooltip"
      data-application-preview
      className="pointer-events-auto absolute z-20 w-[340px] rounded-xl border border-zinc-200 bg-white p-4 shadow-xl"
      style={{ top: coords.top, left: coords.left }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span
        aria-hidden
        className={
          coords.placement === 'below'
            ? 'absolute top-[-6.5px] h-3 w-3 rotate-45 border-l border-t border-zinc-200 bg-white'
            : 'absolute bottom-[-6.5px] h-3 w-3 rotate-45 border-r border-b border-zinc-200 bg-white'
        }
        style={{ left: coords.arrowLeft }}
      />

      <div className="relative space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900">
              {app.company}
            </p>
            <p className="truncate text-sm text-zinc-500">{app.role}</p>
          </div>
          <StageStatusBadge status={app.status} />
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
          <div>
            <dt className="text-zinc-400">Status</dt>
            <dd className="font-medium text-zinc-700">
              {STAGE_LABELS[app.status]}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-400">Source</dt>
            <dd className="font-medium text-zinc-700">
              {SOURCE_LABELS[app.source]}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-400">Applied</dt>
            <dd className="font-medium text-zinc-700">
              {formatDate(app.date_applied)}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-400">Type</dt>
            <dd className="font-medium text-zinc-700">
              {app.employment_type === 'contract' ? 'Contract' : 'Permanent'}
              {app.employment_type === 'contract' && app.ir35_status
                ? ` · ${
                    app.ir35_status === 'inside'
                      ? 'Inside IR35'
                      : app.ir35_status === 'outside'
                        ? 'Outside IR35'
                        : 'Undetermined'
                  }`
                : ''}
            </dd>
          </div>
          {payLabel && (
            <div>
              <dt className="text-zinc-400">Pay</dt>
              <dd className="font-medium text-emerald-700">{payLabel}</dd>
            </div>
          )}
          {app.priority > 0 && (
            <div>
              <dt className="text-zinc-400">Priority</dt>
              <dd className="font-medium text-amber-600">
                {'★'.repeat(app.priority)}
              </dd>
            </div>
          )}
        </dl>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
          {(app.location || workMode !== 'onsite') && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              {[app.location, WORK_MODE_LABELS[workMode]]
                .filter(Boolean)
                .join(' · ')}
            </span>
          )}
          {app.contact_name && (
            <span className="inline-flex items-center gap-1">
              <User className="h-3 w-3 shrink-0" />
              {app.contact_name}
            </span>
          )}
          {app.contact_email && (
            <span className="inline-flex max-w-full items-center gap-1 truncate">
              <Mail className="h-3 w-3 shrink-0" />
              {app.contact_email}
            </span>
          )}
          {app.ai_score != null && (
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3 shrink-0" />
              AI {app.ai_score}
            </span>
          )}
        </div>

        {app.notes?.trim() ? (
          <div className="rounded-lg bg-emerald-50 px-3 py-2.5">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-emerald-700">
              Notes
            </p>
            <div
              className="max-h-28 overflow-y-auto overscroll-contain whitespace-pre-wrap text-sm leading-relaxed text-emerald-700"
              onWheel={(e) => e.stopPropagation()}
              onScroll={(e) => e.stopPropagation()}
            >
              {app.notes.trim()}
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-red-50 px-3 py-2.5">
            <p className="text-sm text-red-400">No notes yet</p>
          </div>
        )}

        {app.ai_reasoning?.trim() && (
          <div className="rounded-lg bg-emerald-50 px-3 py-2.5">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-emerald-700">
              AI reasoning
            </p>
            <div
              className="max-h-28 overflow-y-auto overscroll-contain whitespace-pre-wrap text-sm leading-relaxed text-emerald-700"
              onWheel={(e) => e.stopPropagation()}
              onScroll={(e) => e.stopPropagation()}
            >
              {app.ai_reasoning.trim()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
