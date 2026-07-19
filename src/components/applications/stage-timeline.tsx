// src/components/applications/stage-timeline.tsx

import { STAGE_LABELS, STAGE_COLOURS } from '@/lib/constants';
import { formatDate } from '@/lib/utils/dates';
import type { Stage } from '@/types';
import { clsx } from 'clsx';

interface StageTimelineProps {
  stages: Stage[];
}

export function StageTimeline({ stages }: StageTimelineProps) {
  const sorted = [...stages].sort(
    (a, b) =>
      new Date(a.date_entered).getTime() - new Date(b.date_entered).getTime(),
  );

  if (sorted.length === 0) {
    return <p className="text-sm text-zinc-500">No stages recorded yet.</p>;
  }

  return (
    <div className="space-y-0">
      {sorted.map((stage, index) => (
        <div key={stage.id} className="flex gap-3">
          {/* Left vertical line + dot */}
          <div className="flex flex-col items-center">
            <div
              className="h-3 w-3 rounded-full border-2"
              style={{
                borderColor: STAGE_COLOURS[stage.stage_name],
                backgroundColor:
                  stage.outcome === 'passed'
                    ? STAGE_COLOURS[stage.stage_name]
                    : 'white',
              }}
            />
            {index < sorted.length - 1 && (
              <div className="w-px flex-1 bg-zinc-200" />
            )}
          </div>

          {/* Content */}
          <div className="pb-6">
            <p className="text-sm font-medium text-zinc-900">
              {STAGE_LABELS[stage.stage_name]}
            </p>
            <p className="text-xs text-zinc-500">
              {formatDate(stage.date_entered)}
            </p>

            <span
              className={clsx(
                'mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium',
                stage.outcome === 'passed' && 'bg-emerald-100 text-emerald-700',
                stage.outcome === 'failed' && 'bg-red-100 text-red-700',
                stage.outcome === 'pending' && 'bg-amber-100 text-amber-700',
                stage.outcome === 'no_response' && 'bg-zinc-100 text-zinc-600',
              )}
            >
              {stage.outcome}
            </span>

            {stage.notes && (
              <p className="mt-1 text-xs text-zinc-500">{stage.notes}</p>
            )}

            {stage.feedback && (
              <p className="mt-1 text-xs text-zinc-500 italic">
                {stage.feedback}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
