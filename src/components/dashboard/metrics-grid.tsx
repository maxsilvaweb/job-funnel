// src/components/dashboard/metrics-grid.tsx

'use client';

import { Card } from '@/components/ui/card';
import { useMetrics } from '@/lib/hooks/use-metrics';
import {
  Send,
  MessageSquare,
  Target,
  Ghost,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: 'good' | 'warning' | 'critical' | 'neutral';
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend = 'neutral',
}: MetricCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-500 truncate">{title}</p>
          <p
            className={clsx(
              'mt-1 text-3xl font-bold tracking-tight',
              trend === 'good' && 'text-emerald-600',
              trend === 'warning' && 'text-amber-600',
              trend === 'critical' && 'text-red-600',
              trend === 'neutral' && 'text-zinc-900',
            )}
          >
            {value}
          </p>
          {subtitle && <p className="mt-1 text-xs text-zinc-400">{subtitle}</p>}
        </div>
        <div className="ml-4 rounded-lg bg-zinc-100 p-2 shrink-0">{icon}</div>
      </div>
    </Card>
  );
}

export function MetricsGrid() {
  const metrics = useMetrics();

  const responseRateTrend =
    metrics.responseRate >= 15
      ? 'good'
      : metrics.responseRate >= 10
        ? 'warning'
        : metrics.totalApplications === 0
          ? 'neutral'
          : 'critical';

  const ghostRateTrend =
    metrics.totalApplications === 0
      ? 'neutral'
      : metrics.ghostRate <= 60
        ? 'good'
        : metrics.ghostRate <= 80
          ? 'warning'
          : 'critical';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <MetricCard
        title="Total Applications"
        value={metrics.totalApplications}
        subtitle={`${metrics.applicationsThisWeek} this week`}
        icon={<Send className="h-5 w-5 text-indigo-500" />}
      />
      <MetricCard
        title="Active"
        value={metrics.activeApplications}
        subtitle="In progress"
        icon={<TrendingUp className="h-5 w-5 text-violet-500" />}
      />
      <MetricCard
        title="Response Rate"
        value={
          metrics.totalApplications === 0 ? '—' : `${metrics.responseRate}%`
        }
        subtitle="Target: 10–20%"
        icon={<MessageSquare className="h-5 w-5 text-blue-500" />}
        trend={responseRateTrend}
      />
      <MetricCard
        title="Ghost Rate"
        value={metrics.totalApplications === 0 ? '—' : `${metrics.ghostRate}%`}
        subtitle="No response at all"
        icon={<Ghost className="h-5 w-5 text-zinc-400" />}
        trend={ghostRateTrend}
      />
      <MetricCard
        title="Avg Response"
        value={
          metrics.averageTimeToResponse !== null
            ? `${metrics.averageTimeToResponse}d`
            : '—'
        }
        subtitle="Days to first response"
        icon={<Clock className="h-5 w-5 text-amber-500" />}
      />
      <MetricCard
        title="Apps per Offer"
        value={
          metrics.totalApplications === 0
            ? '—'
            : metrics.applicationsNeededForOffer
        }
        subtitle="Based on your rates"
        icon={<Target className="h-5 w-5 text-rose-500" />}
      />
    </div>
  );
}
