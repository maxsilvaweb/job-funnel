// src/components/dashboard/conversion-rates.tsx

'use client';

import { Fragment } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useFunnelData } from '@/lib/hooks/use-funnel-data';
import { ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stage Conversion</CardTitle>
      </CardHeader>

      <div className="flex w-full items-stretch gap-0.5 overflow-x-auto pb-1 snap-x snap-mandatory xl:overflow-visible xl:pb-0">
        {funnelData.map((stage, index) => (
          <Fragment key={stage.name}>
            {index > 0 && (
              <ChevronRight
                className="mx-0.5 hidden h-4 w-4 shrink-0 self-center text-zinc-300 sm:block"
                aria-hidden
              />
            )}

            <div className="flex min-w-28 shrink-0 snap-start flex-col rounded-lg border border-zinc-200 bg-white px-3 py-2 sm:min-w-32 xl:min-w-0 xl:flex-1">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: stage.colour }}
                />
                <span className="truncate text-xs font-medium text-zinc-900">
                  {stage.name}
                </span>
              </div>

              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className="font-mono text-sm font-bold text-zinc-900">
                  {stage.count}
                </span>

                {index > 0 ? (
                  <span
                    className={clsx(
                      'rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold',
                      stage.conversionFromPrevious >= 50
                        ? 'bg-emerald-100 text-emerald-700'
                        : stage.conversionFromPrevious >= 20
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700',
                    )}
                  >
                    {stage.conversionFromPrevious}%
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-400">—</span>
                )}
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </Card>
  );
}
