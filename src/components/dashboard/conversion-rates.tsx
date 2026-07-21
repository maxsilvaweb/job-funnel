// src/components/dashboard/conversion-rates.tsx

'use client';

import { Fragment } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useFunnelData } from '@/lib/hooks/use-funnel-data';
import { ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

function conversionTone(rate: number) {
  if (rate >= 50) {
    return {
      label: 'bg-emerald-100 text-emerald-700',
      bar: 'bg-emerald-500',
      track: 'bg-emerald-100',
    };
  }
  if (rate >= 20) {
    return {
      label: 'bg-amber-100 text-amber-700',
      bar: 'bg-amber-500',
      track: 'bg-amber-100',
    };
  }
  return {
    label: 'bg-red-100 text-red-700',
    bar: 'bg-red-500',
    track: 'bg-red-100',
  };
}

export function ConversionRates() {
  const { funnelData } = useFunnelData();

  if (!funnelData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stage Conversion</CardTitle>
        </CardHeader>
        <div className="flex h-24 items-center justify-center text-zinc-400">
          <div className="text-center">
            <p className="text-sm font-medium">No data yet</p>
            <p className="mt-1 text-xs">
              Add applications to see conversion rates
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const maxCount = Math.max(...funnelData.map((s) => s.count), 1);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Stage Conversion</CardTitle>
          <p className="mt-1 text-xs text-zinc-500">
            How many candidates move from one stage to the next
          </p>
        </div>
        <div className="hidden items-center gap-3 text-[10px] font-medium text-zinc-500 sm:flex">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Strong ≥50%
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Fair ≥20%
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Weak &lt;20%
          </span>
        </div>
      </CardHeader>

      <div className="flex w-full items-stretch gap-1 overflow-x-auto pb-1 snap-x snap-mandatory">
        {funnelData.map((stage, index) => {
          const prev = index > 0 ? funnelData[index - 1] : null;
          const tone =
            index > 0
              ? conversionTone(stage.conversionFromPrevious)
              : null;
          const volumeWidth = Math.max(
            8,
            Math.round((stage.count / maxCount) * 100),
          );

          return (
            <Fragment key={stage.name}>
              {index > 0 && tone && (
                <div className="flex w-14 shrink-0 flex-col items-center justify-center self-center sm:w-16">
                  <span
                    className={clsx(
                      'rounded-full px-2 py-0.5 font-mono text-[10px] font-bold tabular-nums',
                      tone.label,
                    )}
                  >
                    {stage.conversionFromPrevious}%
                  </span>
                  <ArrowRight
                    className="mt-1 h-3.5 w-3.5 text-zinc-300"
                    aria-hidden
                  />
                  {prev && (
                    <span className="mt-1 text-[9px] text-zinc-400 tabular-nums">
                      {prev.count}→{stage.count}
                    </span>
                  )}
                </div>
              )}

              <div
                className="relative flex min-w-30 shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/80 px-3.5 py-3 sm:min-w-34 xl:min-w-0 xl:flex-1"
                style={{
                  boxShadow: `inset 3px 0 0 0 ${stage.colour}`,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                      {stage.name}
                    </p>
                    <p className="mt-1 font-mono text-2xl font-bold tracking-tight text-zinc-900 tabular-nums">
                      {stage.count}
                    </p>
                  </div>
                  <div
                    className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white"
                    style={{ backgroundColor: stage.colour }}
                    aria-hidden
                  />
                </div>

                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between gap-2 text-[10px] text-zinc-400">
                    <span>Volume</span>
                    <span className="font-mono tabular-nums">
                      {stage.conversionFromTop}% of top
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200/80">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${volumeWidth}%`,
                        backgroundColor: stage.colour,
                        opacity: 0.85,
                      }}
                    />
                  </div>
                </div>

                {index > 0 && tone && (
                  <div className="mt-2.5">
                    <div className="mb-1 flex items-center justify-between gap-2 text-[10px] text-zinc-400">
                      <span>From previous</span>
                      <span
                        className={clsx(
                          'rounded px-1 py-px font-mono font-semibold tabular-nums',
                          tone.label,
                        )}
                      >
                        {stage.conversionFromPrevious}%
                      </span>
                    </div>
                    <div
                      className={clsx(
                        'h-1.5 overflow-hidden rounded-full',
                        tone.track,
                      )}
                    >
                      <div
                        className={clsx(
                          'h-full rounded-full transition-all',
                          tone.bar,
                        )}
                        style={{
                          width: `${Math.min(100, stage.conversionFromPrevious)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Fragment>
          );
        })}
      </div>
    </Card>
  );
}
