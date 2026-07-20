// src/components/applications/application-table.tsx

'use client';

import {
  useApplications,
  useDeleteApplication,
} from '@/lib/hooks/use-applications';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { STAGE_LABELS, SOURCE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/utils/dates';
import {
  ExternalLink,
  Pencil,
  Trash2,
  ArrowUpDown,
  Loader2,
  PhoneIncoming,
  PhoneOutgoing,
  Handshake,
  Globe,
  Newspaper,
  Network,
  Snowflake,
  Circle,
} from 'lucide-react';
import Link from 'next/link';
import { useState, type SVGProps, type ComponentType } from 'react';
import { clsx } from 'clsx';
import type { Application, ApplicationSource } from '@/types';
import { useToast } from '@/lib/hooks/use-toast';

type IconProps = SVGProps<SVGSVGElement>;

function LinkedinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function IndeedIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M11.566 21.5633v-8.762c.2553.0231.5009.0346.758.0346 1.2225 0 2.3739-.3206 3.3506-.8928v9.6182c0 .8219-.1957 1.4287-.5757 1.8338-.378.4033-.8808.6049-1.491.6049-.6007 0-1.0766-.2016-1.468-.6183-.3781-.4032-.5739-1.01-.5739-1.8184zM11.589.5659c2.5447-.8929 5.4424-.8449 7.6186.987.405.3687.8673.8334 1.0515 1.3806.2207.6913-.7695-.073-.9057-.167-.71-.4532-1.4182-.8334-2.2127-1.0946C12.8614.3873 8.8122 2.709 6.2945 6.315c-1.0516 1.5939-1.7367 3.2721-2.299 5.1174-.0614.2017-.1094.4647-.2207.6413-.1113.2036-.048-.5453-.048-.5702.0845-.7623.2438-1.4997.4414-2.237C5.3292 5.3375 7.897 2.0655 11.5891.5658zm4.9281 7.0587c0 1.6686-1.353 3.0224-3.0205 3.0224-1.6677 0-3.0186-1.3538-3.0186-3.0224 0-1.6687 1.351-3.0224 3.0186-3.0224 1.6676 0 3.0205 1.3518 3.0205 3.0224Z" />
    </svg>
  );
}

const SOURCE_ICONS: Record<ApplicationSource, ComponentType<IconProps>> = {
  linkedin: LinkedinIcon,
  indeed: IndeedIcon,
  recruiter_inbound: PhoneIncoming,
  recruiter_outbound: PhoneOutgoing,
  referral: Handshake,
  company_website: Globe,
  job_board: Newspaper,
  networking: Network,
  cold_outreach: Snowflake,
  other: Circle,
};

const SOURCE_ICON_COLOURS: Partial<Record<ApplicationSource, string>> = {
  linkedin: '#0A66C2',
  indeed: '#2164F3',
};

type SortField = 'company' | 'date_applied' | 'status' | 'priority';
type SortDirection = 'asc' | 'desc';

// ── Moved outside ApplicationTable ──────────────────────────
interface SortButtonProps {
  field: SortField;
  children: React.ReactNode;
  onSort: (field: SortField) => void;
}

function SortButton({ field, children, onSort }: SortButtonProps) {
  return (
    <button
      onClick={() => onSort(field)}
      className={clsx(
        'flex items-center gap-1 font-medium text-zinc-500 hover:text-zinc-900 transition-colors',
      )}
    >
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );
}
// ────────────────────────────────────────────────────────────

export function ApplicationTable() {
  const { data: applications, isLoading } = useApplications();
  const deleteApp = useDeleteApplication();
  const [sortField, setSortField] = useState<SortField>('date_applied');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }

  async function handleDelete(id: string, company: string) {
    if (!confirm('Delete this application? This cannot be undone.')) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteApp.mutateAsync(id);
      toast({
        title: 'Application deleted',
        description: `${company} has been removed from your funnel.`,
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Could not delete application',
        description: 'Something went wrong. Please try again.',
        variant: 'error',
      });
    } finally {
      setDeletingId(null);
    }
  }

  const sorted = [...(applications || [])].sort(
    (a: Application, b: Application) => {
      let aVal: string | number = a[sortField] ?? '';
      let bVal: string | number = b[sortField] ?? '';

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    },
  );

  if (isLoading) {
    return (
      <Card>
        <div className="flex h-48 items-center justify-center">
          <Spinner />
        </div>
      </Card>
    );
  }

  if (!applications?.length) {
    return (
      <Card>
        <div className="flex h-48 flex-col items-center justify-center gap-2 text-zinc-500">
          <p className="text-lg font-medium">No applications yet</p>
          <p className="text-sm text-zinc-400">
            Add your first application to start tracking your funnel
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding={false} className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-white">
            <tr>
              <th className="px-4 py-3 font-medium">
                <SortButton field="company" onSort={handleSort}>
                  Company
                </SortButton>
              </th>
              <th className="px-4 py-3 font-medium text-zinc-500">Role</th>
              <th className="px-4 py-3 font-medium">
                <SortButton field="status" onSort={handleSort}>
                  Status
                </SortButton>
              </th>
              <th className="px-4 py-3 font-medium text-zinc-500">Source</th>
              <th className="px-4 py-3 font-medium">
                <SortButton field="date_applied" onSort={handleSort}>
                  Applied
                </SortButton>
              </th>
              <th className="px-4 py-3 font-medium text-zinc-500">Salary</th>
              <th className="px-4 py-3 font-medium text-zinc-500">IR35</th>
              <th className="px-4 py-3 font-medium">
                <SortButton field="priority" onSort={handleSort}>
                  Priority
                </SortButton>
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {sorted.map((app) => (
              <tr
                key={app.id}
                className="table-row-hover cursor-pointer hover:bg-zinc-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/applications/${app.id}`}
                    className="font-medium text-zinc-900 hover:text-indigo-600 transition-colors"
                  >
                    {app.company}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-500 max-w-[200px] truncate">
                  {app.role}
                </td>
                <td className="px-4 py-3">
                  <Badge status={app.status}>{STAGE_LABELS[app.status]}</Badge>
                </td>
                <td className="px-4 py-3 text-zinc-500 text-xs">
                  {(() => {
                    const SourceIcon = SOURCE_ICONS[app.source];
                    const iconColour = SOURCE_ICON_COLOURS[app.source];
                    return (
                      <span className="inline-flex items-center gap-1.5">
                        <SourceIcon
                          className="h-3.5 w-3.5 text-zinc-400"
                          style={iconColour ? { color: iconColour } : undefined}
                        />
                        {SOURCE_LABELS[app.source]}
                      </span>
                    );
                  })()}
                </td>
                <td className="px-4 py-3 text-zinc-500 text-xs">
                  {formatDate(app.date_applied)}
                </td>
                <td className="px-4 py-3 text-xs">
                  {app.employment_type === 'contract' ? (
                    app.day_rate_min != null || app.day_rate_max != null ? (
                      <span className="text-emerald-600 font-medium">
                        £
                        {[app.day_rate_min, app.day_rate_max]
                          .filter((n): n is number => n != null)
                          .map((n) => n.toLocaleString())
                          .join('–')}
                        /day
                      </span>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )
                  ) : app.salary_max ? (
                    <span className="text-emerald-600 font-medium">
                      {app.salary_currency}{' '}
                      {app.salary_min?.toLocaleString() ?? '?'}–
                      {app.salary_max.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs">
                  {app.employment_type === 'contract' ? (
                    app.ir35_status === 'inside' ? (
                      <span className="font-medium text-amber-600">Inside IR35</span>
                    ) : app.ir35_status === 'outside' ? (
                      <span className="font-medium text-emerald-600">Outside IR35</span>
                    ) : (
                      <span className="text-zinc-400">Undetermined</span>
                    )
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-500 text-xs">
                  {app.priority > 0 ? (
                    <span className="font-medium text-amber-600">
                      {'★'.repeat(app.priority)}
                    </span>
                  ) : (
                    <span className="text-zinc-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/applications/${app.id}/edit`}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-zinc-500 transition-colors hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
                      aria-label={`Edit ${app.company}`}
                      title="Edit application"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    {app.job_url && (
                      <a
                        href={app.job_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-zinc-500 transition-colors hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
                        aria-label={`Open ${app.company} job posting`}
                        title="Open job posting"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(app.id, app.company)}
                      disabled={deletingId === app.id}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-zinc-500 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50"
                      aria-label={`Delete ${app.company}`}
                      title="Delete application"
                    >
                      {deletingId === app.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-zinc-100 px-4 py-3">
        <p className="text-xs text-zinc-400">
          {sorted.length} application{sorted.length !== 1 ? 's' : ''}
        </p>
      </div>
    </Card>
  );
}
