// src/components/dashboard/weekly-targets.tsx

'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useMetrics } from '@/lib/hooks/use-metrics';

export function WeeklyTargets() {
  const metrics = useMetrics();

  // You can later make this configurable in DB
  const weeklyTarget: number = 15;

  const remaining =
    weeklyTarget - metrics.applicationsThisWeek > 0
      ? weeklyTarget - metrics.applicationsThisWeek
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>This Week</CardTitle>
      </CardHeader>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        <div className="min-w-0 flex-1">
          <Slider
            readOnly
            label="Applications"
            value={metrics.applicationsThisWeek}
            min={0}
            max={weeklyTarget}
            formatValue={(v) => `${v} / ${weeklyTarget}`}
          />

          {remaining > 0 && (
            <p className="mt-1 text-xs text-zinc-400">
              {remaining} more to hit your weekly goal
            </p>
          )}
        </div>

        <div className="shrink-0 lg:max-w-sm lg:pt-0.5">
          <p className="text-xs font-medium text-zinc-500">
            Based on your conversion rates:
          </p>

          {metrics.totalApplications === 0 ? (
            <p className="mt-1 text-sm text-zinc-500">
              Add some applications to calculate projections.
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm text-zinc-900">
                You need approximately{' '}
                <span className="font-bold text-emerald-600">
                  {metrics.applicationsNeededForOffer}
                </span>{' '}
                applications for{' '}
                <span className="font-bold text-emerald-600">1 offer</span>
              </p>

              <p className="mt-1 text-sm text-zinc-900">
                For{' '}
                <span className="font-bold text-emerald-600">
                  3 competing offers
                </span>{' '}
                (ideal for negotiation):{' '}
                <span className="font-bold text-emerald-600">
                  {metrics.applicationsNeededForThreeOffers}
                </span>{' '}
                applications
              </p>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
