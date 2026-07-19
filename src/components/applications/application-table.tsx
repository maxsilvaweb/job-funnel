// src/components/applications/application-table.tsx

'use client';

import {
  useApplications,
  useDeleteApplication,
} from '@/lib/hooks/use-applications';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { STAGE_LABELS, SOURCE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/utils/dates';
import { ExternalLink, Pencil, Trash2, ArrowUpDown, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { clsx } from 'clsx';
import type { Application } from '@/types';
import { useToast } from '@/lib/hooks/use-toast';

type SortField = 'company' | 'date_applied' | 'status' | 'priority';
type SortDirection = 'asc' | 'desc';

// ── Moved outside ApplicationTable ──────────────────────────
interface SortButtonProps {
  field: SortField;
  currentField: SortField;
  children: React.ReactNode;
  onSort: (field: SortField) => void;
}

function SortButton({
  field,
  currentField,
  children,
  onSort,
}: SortButtonProps) {
  return (
    <button
      onClick={() => onSort(field)}
      className={clsx(
        'flex items-center gap-1 hover:text-zinc-900 transition-colors',
        currentField === field
          ? 'text-zinc-900 font-semibold'
          : 'text-zinc-500',
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
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
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
    <Card padding={false}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50">
            <tr>
              <th className="px-4 py-3 font-medium">
                <SortButton
                  field="company"
                  currentField={sortField}
                  onSort={handleSort}
                >
                  Company
                </SortButton>
              </th>
              <th className="px-4 py-3 font-medium text-zinc-500">Role</th>
              <th className="px-4 py-3 font-medium">
                <SortButton
                  field="status"
                  currentField={sortField}
                  onSort={handleSort}
                >
                  Status
                </SortButton>
              </th>
              <th className="px-4 py-3 font-medium text-zinc-500">Source</th>
              <th className="px-4 py-3 font-medium">
                <SortButton
                  field="date_applied"
                  currentField={sortField}
                  onSort={handleSort}
                >
                  Applied
                </SortButton>
              </th>
              <th className="px-4 py-3 font-medium text-zinc-500">Salary</th>
              <th className="px-4 py-3 font-medium text-zinc-500">IR35</th>
              <th className="px-4 py-3 font-medium">
                <SortButton
                  field="priority"
                  currentField={sortField}
                  onSort={handleSort}
                >
                  Priority
                </SortButton>
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {sorted.map((app) => (
              <tr key={app.id} className="hover:bg-zinc-50 transition-colors">
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
                  {SOURCE_LABELS[app.source]}
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
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/applications/${app.id}/edit`}
                      className="text-zinc-400 transition-colors hover:text-indigo-500"
                      aria-label={`Edit ${app.company}`}
                      title="Edit application"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    {app.job_url && (
                      <a
                        href={app.job_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 hover:text-indigo-500 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(app.id, app.company)}
                      disabled={deletingId === app.id}
                      className="text-zinc-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      {deletingId === app.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
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
