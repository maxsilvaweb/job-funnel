// src/components/applications/application-table.tsx

'use client';

import {
  useApplications,
  useDeleteApplication,
} from '@/lib/hooks/use-applications';
import { StageStatusBadge } from '@/components/applications/stage-status-badge';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
  CLOSED_STAGES,
  SOURCE_LABELS,
  STAGE_LABELS,
  getApplicationWorkMode,
} from '@/lib/constants';
import { formatDate } from '@/lib/utils/dates';
import { getStageIndex } from '@/lib/utils/funnel';
import {
  ExternalLink,
  Pencil,
  Trash2,
  ArrowDown,
  ArrowUp,
  Loader2,
  PhoneIncoming,
  PhoneOutgoing,
  Handshake,
  Globe,
  Newspaper,
  Network,
  Snowflake,
  Circle,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import {
  useMemo,
  useState,
  useEffect,
  useRef,
  type SVGProps,
  type ComponentType,
} from 'react';
import { clsx } from 'clsx';
import type {
  Application,
  ApplicationSource,
  ApplicationStatus,
  EmploymentType,
} from '@/types';
import { useToast } from '@/lib/hooks/use-toast';
import {
  DEFAULT_PAGE_SIZE,
  Pagination,
  getTotalPages,
  paginateItems,
} from '@/components/ui/pagination';
import { ApplicationRowPreview } from '@/components/applications/application-row-preview';

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

const STATUS_OPTIONS: ApplicationStatus[] = [
  'discovered',
  'applied',
  'responded',
  'screening',
  'tech_interview',
  'final_round',
  'offer',
  'accepted',
  'rejected',
  'ghosted',
  'withdrawn',
];

const SOURCE_OPTIONS = Object.keys(SOURCE_LABELS) as ApplicationSource[];

const MIN_SCORE_OPTIONS = [
  { value: 0, label: 'Any score' },
  { value: 50, label: '50+' },
  { value: 70, label: '70+' },
  { value: 85, label: '85+' },
] as const;

type SortField =
  | 'company'
  | 'role'
  | 'status'
  | 'source'
  | 'date_applied'
  | 'salary'
  | 'employment_type'
  | 'ir35_status'
  | 'priority';
type SortDirection = 'asc' | 'desc';

const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: '£',
  USD: '$',
  EUR: '€',
};

function salarySortValue(app: Application): number {
  if (app.employment_type === 'contract') {
    return app.day_rate_min ?? app.day_rate_max ?? -1;
  }
  return app.salary_min ?? app.salary_max ?? -1;
}

function formatMoney(
  currency: string,
  min: number | null | undefined,
  max: number | null | undefined,
): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  const parts = [min, max]
    .filter((n): n is number => n != null)
    .map((n) => n.toLocaleString());
  if (parts.length === 0) return '—';
  if (parts.length === 1) return `${symbol}${parts[0]}`;
  if (parts[0] === parts[1]) return `${symbol}${parts[0]}`;
  return `${symbol}${parts[0]}–${parts[1]}`;
}

interface SortButtonProps {
  field: SortField;
  active: boolean;
  direction: SortDirection;
  children: React.ReactNode;
  onSort: (field: SortField) => void;
}

function SortButton({
  field,
  active,
  direction,
  children,
  onSort,
}: SortButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      aria-sort={
        active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'
      }
      className={clsx(
        'flex items-center gap-1 font-medium transition-colors',
        active ? 'text-emerald-700' : 'text-zinc-500 hover:text-zinc-900',
      )}
    >
      {children}
      <span className="inline-flex flex-col leading-none" aria-hidden>
        <ArrowUp
          className={clsx(
            'h-2.5 w-2.5',
            active && direction === 'asc'
              ? 'text-emerald-700'
              : 'text-zinc-300',
          )}
        />
        <ArrowDown
          className={clsx(
            '-mt-0.5 h-2.5 w-2.5',
            active && direction === 'desc'
              ? 'text-emerald-700'
              : 'text-zinc-300',
          )}
        />
      </span>
    </button>
  );
}

const toggleClassName = (active: boolean) =>
  clsx(
    'cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition-colors',
    active
      ? 'border-emerald-600 bg-emerald-50 font-medium text-emerald-700'
      : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900',
  );

export function ApplicationTable() {
  const { data: applications, isLoading, isError, error } = useApplications();
  const deleteApp = useDeleteApplication();
  const [sortField, setSortField] = useState<SortField>('date_applied');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>(
    'all',
  );
  const [sourceFilter, setSourceFilter] = useState<ApplicationSource | 'all'>(
    'all',
  );
  const [typeFilter, setTypeFilter] = useState<EmploymentType | 'all'>('all');
  const [hideClosed, setHideClosed] = useState(true);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewRect, setPreviewRect] = useState<DOMRect | null>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const tableRootRef = useRef<HTMLDivElement>(null);
  const showPreviewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hidePreviewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearPreviewTimers() {
    if (showPreviewTimer.current) {
      clearTimeout(showPreviewTimer.current);
      showPreviewTimer.current = null;
    }
    if (hidePreviewTimer.current) {
      clearTimeout(hidePreviewTimer.current);
      hidePreviewTimer.current = null;
    }
  }

  function schedulePreview(appId: string, row: HTMLTableRowElement) {
    clearPreviewTimers();
    const root = tableRootRef.current;
    if (!root) return;
    const nameEl = row.querySelector(
      '[data-preview-anchor]',
    ) as HTMLElement | null;
    const rowRect = (nameEl ?? row).getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    showPreviewTimer.current = setTimeout(() => {
      setPreviewId(appId);
      setPreviewRect(rowRect);
      setContainerRect(rootRect);
    }, 280);
  }

  function scheduleHidePreview() {
    clearPreviewTimers();
    hidePreviewTimer.current = setTimeout(() => {
      setPreviewId(null);
      setPreviewRect(null);
      setContainerRect(null);
    }, 160);
  }

  function keepPreviewOpen() {
    clearPreviewTimers();
  }

  useEffect(() => () => clearPreviewTimers(), []);

  useEffect(() => {
    function hideOnScrollOrResize(e: Event) {
      if (e.type === 'scroll') {
        const preview = tableRootRef.current?.querySelector(
          '[data-application-preview]',
        );
        if (
          preview &&
          e.target instanceof Node &&
          preview.contains(e.target)
        ) {
          return;
        }
      }
      clearPreviewTimers();
      setPreviewId(null);
      setPreviewRect(null);
      setContainerRect(null);
    }
    window.addEventListener('scroll', hideOnScrollOrResize, true);
    window.addEventListener('resize', hideOnScrollOrResize);
    return () => {
      window.removeEventListener('scroll', hideOnScrollOrResize, true);
      window.removeEventListener('resize', hideOnScrollOrResize);
    };
  }, []);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'date_applied' ? 'desc' : 'asc');
    }
  }

  function resetFilters() {
    setSearch('');
    setStatusFilter('all');
    setSourceFilter('all');
    setTypeFilter('all');
    setHideClosed(true);
    setRemoteOnly(false);
    setMinScore(0);
    setPage(1);
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

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (applications || []).filter((app) => {
      if (statusFilter !== 'all' && app.status !== statusFilter) return false;
      if (sourceFilter !== 'all' && app.source !== sourceFilter) return false;
      if (typeFilter !== 'all' && app.employment_type !== typeFilter) {
        return false;
      }
      if (hideClosed && CLOSED_STAGES.includes(app.status)) return false;
      if (remoteOnly && getApplicationWorkMode(app) !== 'remote') return false;
      if (
        minScore > 0 &&
        (app.ai_score == null || app.ai_score < minScore)
      ) {
        return false;
      }
      if (query) {
        const haystack = [
          app.company,
          app.role,
          app.location,
          app.contact_name,
          app.contact_email,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [
    applications,
    search,
    statusFilter,
    sourceFilter,
    typeFilter,
    hideClosed,
    remoteOnly,
    minScore,
  ]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a: Application, b: Application) => {
      let comparison = 0;

      switch (sortField) {
        case 'status':
          comparison = getStageIndex(a.status) - getStageIndex(b.status);
          break;
        case 'priority':
          comparison = (a.priority ?? 0) - (b.priority ?? 0);
          break;
        case 'date_applied':
          comparison =
            new Date(a.date_applied).getTime() -
            new Date(b.date_applied).getTime();
          if (comparison === 0) {
            comparison =
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime();
          }
          break;
        case 'salary':
          comparison = salarySortValue(a) - salarySortValue(b);
          break;
        case 'source':
          comparison = SOURCE_LABELS[a.source].localeCompare(
            SOURCE_LABELS[b.source],
          );
          break;
        case 'employment_type':
          comparison = a.employment_type.localeCompare(b.employment_type);
          break;
        case 'ir35_status': {
          const aIr35 = a.employment_type === 'contract' ? a.ir35_status ?? '' : '';
          const bIr35 = b.employment_type === 'contract' ? b.ir35_status ?? '' : '';
          comparison = String(aIr35).localeCompare(String(bIr35));
          break;
        }
        case 'company':
        case 'role':
        default: {
          const aVal = String(a[sortField] ?? '').toLowerCase();
          const bVal = String(b[sortField] ?? '').toLowerCase();
          comparison = aVal.localeCompare(bVal);
          break;
        }
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filtered, sortField, sortDirection]);

  useEffect(() => {
    setPage(1);
  }, [
    search,
    statusFilter,
    sourceFilter,
    typeFilter,
    hideClosed,
    remoteOnly,
    minScore,
    sortField,
    sortDirection,
    pageSize,
  ]);

  useEffect(() => {
    const totalPages = getTotalPages(sorted.length, pageSize);
    if (page > totalPages) setPage(totalPages);
  }, [sorted.length, pageSize, page]);

  const paged = useMemo(
    () => paginateItems(sorted, page, pageSize),
    [sorted, page, pageSize],
  );

  const previewApp = useMemo(
    () => applications?.find((a) => a.id === previewId),
    [applications, previewId],
  );

  const filtersActive =
    search.trim() !== '' ||
    statusFilter !== 'all' ||
    sourceFilter !== 'all' ||
    typeFilter !== 'all' ||
    !hideClosed ||
    remoteOnly ||
    minScore > 0;

  if (isLoading) {
    return (
      <Card>
        <div className="flex h-48 items-center justify-center">
          <Spinner />
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <div className="flex h-48 flex-col items-center justify-center gap-2 text-zinc-500">
          <p className="text-lg font-medium">Could not load applications</p>
          <p className="max-w-md text-center text-sm text-zinc-400">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
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
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, role, location…"
            className="w-full rounded-lg border border-zinc-200 bg-white py-1.5 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </label>

        <Select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as ApplicationStatus | 'all')
          }
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {STAGE_LABELS[status]}
            </option>
          ))}
        </Select>

        <Select
          value={sourceFilter}
          onChange={(e) =>
            setSourceFilter(e.target.value as ApplicationSource | 'all')
          }
          aria-label="Filter by source"
        >
          <option value="all">All sources</option>
          {SOURCE_OPTIONS.map((source) => (
            <option key={source} value={source}>
              {SOURCE_LABELS[source]}
            </option>
          ))}
        </Select>

        <Select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value as EmploymentType | 'all')
          }
          aria-label="Filter by employment type"
        >
          <option value="all">All types</option>
          <option value="permanent">Permanent</option>
          <option value="contract">Contract</option>
        </Select>

        <button
          type="button"
          onClick={() => setHideClosed((v) => !v)}
          aria-pressed={hideClosed}
          className={toggleClassName(hideClosed)}
        >
          Hide closed
        </button>

        <button
          type="button"
          onClick={() => setRemoteOnly((v) => !v)}
          aria-pressed={remoteOnly}
          className={toggleClassName(remoteOnly)}
        >
          Remote only
        </button>

        <label className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white py-1.5 pl-3 pr-2 text-sm text-zinc-600">
          <span className="whitespace-nowrap">Min AI score</span>
          <Select
            variant="ghost"
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
          >
            {MIN_SCORE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>

        {filtersActive && (
          <button
            type="button"
            onClick={resetFilters}
            className="px-2 py-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-800"
          >
            Reset
          </button>
        )}
      </div>

      <div ref={tableRootRef} className="relative">
        <Card padding={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-white">
              <tr>
                <th className="px-4 py-3 font-medium">
                  <SortButton
                    field="company"
                    active={sortField === 'company'}
                    direction={sortDirection}
                    onSort={handleSort}
                  >
                    Company
                  </SortButton>
                </th>
                <th className="px-4 py-3 font-medium">
                  <SortButton
                    field="role"
                    active={sortField === 'role'}
                    direction={sortDirection}
                    onSort={handleSort}
                  >
                    Role
                  </SortButton>
                </th>
                <th className="px-4 py-3 font-medium">
                  <SortButton
                    field="status"
                    active={sortField === 'status'}
                    direction={sortDirection}
                    onSort={handleSort}
                  >
                    Status
                  </SortButton>
                </th>
                <th className="px-4 py-3 font-medium">
                  <SortButton
                    field="source"
                    active={sortField === 'source'}
                    direction={sortDirection}
                    onSort={handleSort}
                  >
                    Source
                  </SortButton>
                </th>
                <th className="px-4 py-3 font-medium">
                  <SortButton
                    field="date_applied"
                    active={sortField === 'date_applied'}
                    direction={sortDirection}
                    onSort={handleSort}
                  >
                    Applied
                  </SortButton>
                </th>
                <th className="px-4 py-3 font-medium">
                  <SortButton
                    field="salary"
                    active={sortField === 'salary'}
                    direction={sortDirection}
                    onSort={handleSort}
                  >
                    Salary
                  </SortButton>
                </th>
                <th className="px-4 py-3 font-medium">
                  <SortButton
                    field="employment_type"
                    active={sortField === 'employment_type'}
                    direction={sortDirection}
                    onSort={handleSort}
                  >
                    Type
                  </SortButton>
                </th>
                <th className="px-4 py-3 font-medium">
                  <SortButton
                    field="ir35_status"
                    active={sortField === 'ir35_status'}
                    direction={sortDirection}
                    onSort={handleSort}
                  >
                    IR35
                  </SortButton>
                </th>
                <th className="px-4 py-3 font-medium">
                  <SortButton
                    field="priority"
                    active={sortField === 'priority'}
                    direction={sortDirection}
                    onSort={handleSort}
                  >
                    Priority
                  </SortButton>
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {sorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-12 text-center text-sm text-zinc-500"
                  >
                    No applications match these filters.
                    {filtersActive && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="ml-2 font-medium text-emerald-700 hover:text-emerald-800"
                      >
                        Reset filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paged.map((app) => (
                  <tr
                    key={app.id}
                    className={clsx(
                      'table-row-hover transition-colors',
                      app.job_url
                        ? 'cursor-pointer hover:bg-zinc-50'
                        : 'hover:bg-zinc-50/60',
                    )}
                    onMouseEnter={(e) =>
                      schedulePreview(app.id, e.currentTarget)
                    }
                    onMouseLeave={scheduleHidePreview}
                    onClick={() => {
                      if (!app.job_url) return;
                      window.open(app.job_url, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <td className="px-4 py-3" data-preview-anchor>
                      <Link
                        href={`/applications/edit/${app.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium text-zinc-900 transition-colors hover:text-emerald-700"
                      >
                        {app.company}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 max-w-[200px] truncate">
                      {app.role}
                    </td>
                    <td className="px-4 py-3">
                      <StageStatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      {(() => {
                        const SourceIcon = SOURCE_ICONS[app.source];
                        const iconColour = SOURCE_ICON_COLOURS[app.source];
                        return (
                          <span className="inline-flex items-center gap-1.5">
                            <SourceIcon
                              className="h-3.5 w-3.5 text-zinc-400"
                              style={
                                iconColour ? { color: iconColour } : undefined
                              }
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
                            {formatMoney(
                              app.salary_currency,
                              app.day_rate_min,
                              app.day_rate_max,
                            )}
                            /day
                          </span>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )
                      ) : app.salary_min != null || app.salary_max != null ? (
                        <span className="text-emerald-600 font-medium">
                          {formatMoney(
                            app.salary_currency,
                            app.salary_min,
                            app.salary_max,
                          )}
                        </span>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {app.employment_type === 'contract' ? (
                        <span className="inline-flex items-center rounded-full bg-sky-600 px-2.5 py-0.5 text-xs font-medium text-white">
                          Contract
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-medium text-white">
                          Permanent
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {app.employment_type === 'contract' ? (
                        app.ir35_status === 'inside' ? (
                          <span className="text-zinc-500">Inside IR35</span>
                        ) : app.ir35_status === 'outside' ? (
                          <span className="text-zinc-500">Outside IR35</span>
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
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/applications/edit/${app.id}`}
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
                          type="button"
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
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-zinc-100 px-4 py-3">
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={sorted.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemLabel="applications"
          />
        </div>
        </Card>

        {previewApp && previewRect && containerRect && (
          <ApplicationRowPreview
            application={previewApp}
            anchorRect={previewRect}
            containerRect={containerRect}
            onMouseEnter={keepPreviewOpen}
            onMouseLeave={scheduleHidePreview}
          />
        )}
      </div>
    </div>
  );
}
