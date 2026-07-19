// src/components/dashboard/conversion-rates.tsx

'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useFunnelData } from '@/lib/hooks/use-funnel-data';
import { ArrowDown } from 'lucide-react';
import { clsx } from 'clsx';

export function ConversionRates() {
  const { funnelData } = useFunnelData();

  if (!funnelData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stage Conversion</CardTitle>
        </CardHeader>
        <div className="flex h-64 items-center justify-center text-zinc-400">
          <div className="text-center">
            <p className="text-sm font-medium">No data yet</p>
            <p className="text-xs mt-1">
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
      <div className="space-y-1">
        {funnelData.map((stage, index) => (
          <div key={stage.name}>
            <div className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: stage.colour,
                  }}
                />
                <span className="text-sm font-medium text-zinc-900">
                  {stage.name}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-mono text-sm font-bold text-zinc-900">
                  {stage.count}
                </span>

                {index > 0 && (
                  <span
                    className={clsx(
                      'rounded-md px-2 py-0.5 font-mono text-xs font-semibold',
                      stage.conversionFromPrevious >= 50
                        ? 'bg-emerald-100 text-emerald-700'
                        : stage.conversionFromPrevious >= 20
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700',
                    )}
                  >
                    {stage.conversionFromPrevious}%
                  </span>
                )}
              </div>
            </div>

            {index < funnelData.length - 1 && (
              <div className="flex justify-center py-1">
                <ArrowDown className="h-3 w-3 text-zinc-300" />
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
