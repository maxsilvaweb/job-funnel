// src/components/dashboard/weekly-targets.tsx

'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useMetrics } from '@/lib/hooks/use-metrics';
import { clsx } from 'clsx';

export function WeeklyTargets() {
  const metrics = useMetrics();

  // You can later make this configurable in DB
  const weeklyTarget: number = 15;

  const progress =
    weeklyTarget === 0
      ? 0
      : Math.min((metrics.applicationsThisWeek / weeklyTarget) * 100, 100);

  const remaining =
    weeklyTarget - metrics.applicationsThisWeek > 0
      ? weeklyTarget - metrics.applicationsThisWeek
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>This Week</CardTitle>
      </CardHeader>

      <div className="space-y-5">
        {/* Progress bar */}
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-zinc-600">Applications</span>
            <span className="font-mono font-semibold text-zinc-900">
              {metrics.applicationsThisWeek} / {weeklyTarget}
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-500',
                progress >= 100
                  ? 'bg-emerald-500'
                  : progress >= 60
                    ? 'bg-indigo-500'
                    : 'bg-amber-500',
              )}
              style={{ width: `${progress}%` }}
            />
          </div>

          {remaining > 0 && (
            <p className="mt-1 text-xs text-zinc-400">
              {remaining} more to hit your weekly goal
            </p>
          )}
        </div>

        {/* Offer projection */}
        <div className="rounded-lg bg-zinc-50 p-3">
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
                <span className="font-bold text-indigo-600">
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
                <span className="font-bold text-indigo-600">
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
