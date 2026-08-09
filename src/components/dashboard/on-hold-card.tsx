// src/components/dashboard/on-hold-card.tsx

'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useApplications } from '@/lib/hooks/use-applications';
import { Clock, ExternalLink, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatDistanceToNow, differenceInCalendarDays } from 'date-fns';
import { Pagination, paginateItems } from '@/components/ui/pagination';
import Link from 'next/link';

const PAGE_SIZE = 5;

export function OnHoldCard() {
  const { data: applications, isLoading } = useApplications();
  const [page, setPage] = useState(1);

  const onHoldJobs = useMemo(() => {
    if (!applications) return [];
    return applications
      .filter((app) => app.status === 'on_hold')
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
  }, [applications]);

  const pagedJobs = useMemo(
    () => paginateItems(onHoldJobs, page, PAGE_SIZE),
    [onHoldJobs, page],
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              On Hold
            </div>
          </CardTitle>
        </CardHeader>
        <div className="h-32 flex items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
        </div>
      </Card>
    );
  }

  if (onHoldJobs.length === 0) {
    return null;
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex w-full items-center justify-between">
          <CardTitle>
            <div className="flex items-center gap-2 text-zinc-900">
              <Clock className="h-5 w-5 text-amber-600" />
              On Hold
            </div>
          </CardTitle>
          <Link
            href="/applications?status=on_hold"
            className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            Manage On Hold
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-4 py-2 font-semibold text-zinc-900">Job</th>
              <th className="px-4 py-2 font-semibold text-zinc-900">Salary</th>
              <th className="px-4 py-2 font-semibold text-zinc-900">
                Timeline
              </th>
              <th className="px-4 py-2 font-semibold text-zinc-900">
                Priority
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {pagedJobs.map((job) => {
              const onHoldDate = job.on_hold_at
                ? new Date(job.on_hold_at)
                : new Date(job.updated_at);
              const daysOnHold = differenceInCalendarDays(
                new Date(),
                onHoldDate,
              );

              return (
                <tr
                  key={job.id}
                  className="hover:bg-zinc-50/80 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-zinc-900">
                      {job.company}
                    </div>
                    <div className="text-zinc-600 text-xs flex flex-col gap-0.5">
                      <span>{job.role}</span>
                      {job.on_hold_comment && (
                        <p
                          className="mt-1 italic text-zinc-500 text-xs line-clamp-3"
                          title={job.on_hold_comment}
                        >
                          &quot;{job.on_hold_comment}&quot;
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      {job.employment_type === 'contract' ? (
                        <>
                          <span className="font-medium text-zinc-900">
                            £{job.day_rate_min}
                            {job.day_rate_max ? `–£${job.day_rate_max}` : ''}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            per day
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-medium text-zinc-900">
                            {job.salary_currency === 'GBP'
                              ? '£'
                              : job.salary_currency === 'USD'
                                ? '$'
                                : '€'}
                            {(job.salary_min ?? 0) / 1000}k
                            {job.salary_max ? `–${job.salary_max / 1000}k` : ''}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            per year
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium text-amber-700">
                        {daysOnHold === 0 ? (
                          'On hold today'
                        ) : (
                          <>
                            On hold for {daysOnHold}{' '}
                            {daysOnHold === 1 ? 'day' : 'days'}
                          </>
                        )}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        Updated:{' '}
                        {formatDistanceToNow(new Date(job.updated_at), {
                          addSuffix: true,
                        })
                          .replace('minutes', 'mins')
                          .replace('minute', 'min')}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {job.priority > 0 ? (
                      <div className="flex items-center gap-0.5 text-emerald-600">
                        {Array.from({ length: job.priority }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-3 w-3 fill-none"
                            strokeWidth={2.5}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-zinc-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {onHoldJobs.length > PAGE_SIZE && (
        <div className="mt-4 border-t border-zinc-100 pt-3">
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={onHoldJobs.length}
            onPageChange={setPage}
            itemLabel="jobs"
          />
        </div>
      )}
    </Card>
  );
}
