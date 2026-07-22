// src/components/dashboard/conversion-rates.tsx

'use client';

import { Fragment } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useFunnelData } from '@/lib/hooks/use-funnel-data';
import { ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import type { FunnelStage } from '@/types';

function conversionTone(rate: number) {
  if (rate >= 50) {
    return {
      label: 'bg-emerald-100 text-emerald-700',
      bar: 'bg-emerald-500',
    };
  }
  if (rate >= 20) {
    return {
      label: 'bg-amber-100 text-amber-700',
      bar: 'bg-amber-500',
    };
  }
  return {
    label: 'bg-red-100 text-red-700',
    bar: 'bg-red-500',
  };
}

function StageCard({
  stage,
  maxCount,
}: {
  stage: FunnelStage;
  maxCount: number;
}) {
  const isOutcome = stage.kind === 'outcome';
  const volumeWidth = Math.max(6, Math.round((stage.count / maxCount) * 100));

  return (
    <div
      className="relative flex min-w-[7.25rem] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50/80 px-2.5 py-2 xl:min-w-0 xl:flex-1"
      style={{ boxShadow: `inset 3px 0 0 0 ${stage.colour}` }}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: stage.colour }}
          aria-hidden
        />
        <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
          {stage.name}
        </p>
      </div>

      <div className="mt-1.5 flex items-baseline justify-between gap-1.5">
        <p className="font-mono text-xl font-bold tracking-tight text-zinc-900 tabular-nums">
          {stage.count}
        </p>
        <p className="shrink-0 font-mono text-[10px] font-semibold tabular-nums text-zinc-500">
          {stage.conversionFromTop}%
          <span className="ml-0.5 font-sans font-medium text-zinc-400">
            {isOutcome ? 'apps' : 'top'}
          </span>
        </p>
      </div>

      <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-200/80">
        <div
          className="h-full rounded-full"
          style={{
            width: `${volumeWidth}%`,
            backgroundColor: stage.colour,
            opacity: 0.85,
          }}
        />
      </div>
    </div>
  );
}

function ConversionArrow({
  rate,
  fromCount,
  toCount,
}: {
  rate: number;
  fromCount: number;
  toCount: number;
}) {
  const tone = conversionTone(rate);

  return (
    <div className="flex w-11 shrink-0 flex-col items-center justify-center self-center sm:w-12">
      <span
        className={clsx(
          'rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold tabular-nums',
          tone.label,
        )}
      >
        {rate}%
      </span>
      <ArrowRight className="mt-0.5 h-3 w-3 text-zinc-300" aria-hidden />
      <span className="mt-0.5 text-[8px] tabular-nums text-zinc-400">
        {fromCount}→{toCount}
      </span>
    </div>
  );
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

  const progression = funnelData.filter((s) => s.kind !== 'outcome');
  const outcomes = funnelData.filter((s) => s.kind === 'outcome');
  const maxCount = Math.max(...funnelData.map((s) => s.count), 1);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Stage Conversion</CardTitle>
          <p className="mt-1 text-xs text-zinc-500">
            Funnel progression and closed outcomes
          </p>
        </div>
        <div className="hidden items-center gap-2.5 text-[10px] font-medium text-zinc-500 sm:flex">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            ≥50%
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            ≥20%
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            &lt;20%
          </span>
        </div>
      </CardHeader>

      <div className="flex w-full items-stretch gap-1 overflow-x-auto pb-0.5 snap-x snap-mandatory">
        {progression.map((stage, index) => {
          const prev = index > 0 ? progression[index - 1] : null;

          return (
            <Fragment key={stage.name}>
              {prev && (
                <ConversionArrow
                  rate={stage.conversionFromPrevious}
                  fromCount={prev.count}
                  toCount={stage.count}
                />
              )}
              <StageCard stage={stage} maxCount={maxCount} />
            </Fragment>
          );
        })}

        {outcomes.length > 0 && (
          <>
            <div
              className="mx-0.5 flex w-4 shrink-0 items-center justify-center self-stretch"
              aria-hidden
            >
              <div className="h-[70%] w-px bg-zinc-200" />
            </div>
            {outcomes.map((stage) => (
              <StageCard key={stage.name} stage={stage} maxCount={maxCount} />
            ))}
          </>
        )}
      </div>
    </Card>
  );
}
