// src/components/dashboard/application-trend-chart.tsx

'use client';

import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { clsx } from 'clsx';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/lib/hooks/use-theme';
import { buildApplicationTrend } from '@/lib/utils/funnel';
import type { Application, TrendGranularity } from '@/types';

interface ApplicationTrendChartProps {
  applications: Application[];
}

const PERIOD_OPTIONS: {
  value: TrendGranularity;
  label: string;
  seriesName: string;
  rangeLabel: string;
  tooltipPrefix: string;
}[] = [
  {
    value: 'day',
    label: 'Days',
    seriesName: 'This day',
    rangeLabel: 'last 30 days',
    tooltipPrefix: '',
  },
  {
    value: 'week',
    label: 'Weeks',
    seriesName: 'This week',
    rangeLabel: 'last 12 weeks',
    tooltipPrefix: 'Week of ',
  },
  {
    value: 'month',
    label: 'Months',
    seriesName: 'This month',
    rangeLabel: 'last 12 months',
    tooltipPrefix: '',
  },
  {
    value: 'year',
    label: 'Years',
    seriesName: 'This year',
    rangeLabel: 'last 5 years',
    tooltipPrefix: '',
  },
];

function TrendTooltip({
  active,
  payload,
  label,
  tooltipPrefix,
}: TooltipContentProps & { tooltipPrefix: string }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-lg">
      <p className="font-semibold text-zinc-900">
        {tooltipPrefix}
        {label}
      </p>
      <div className="mt-1.5 space-y-1">
        {payload.map((entry) => (
          <p key={String(entry.dataKey)} className="text-sm text-zinc-600">
            <span
              className="mr-1.5 inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: String(entry.color) }}
            />
            {entry.name}:{' '}
            <span className="font-mono font-semibold text-zinc-900">
              {entry.value as number}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
}

export function ApplicationTrendChart({
  applications,
}: ApplicationTrendChartProps) {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const [granularity, setGranularity] = useState<TrendGranularity>('day');

  const period = PERIOD_OPTIONS.find((o) => o.value === granularity)!;
  const data = useMemo(
    () => buildApplicationTrend(applications, granularity),
    [applications, granularity],
  );

  const gridStroke = isDark ? '#27272a' : '#d6eddb';
  const axisTickFill = isDark ? '#a1a1aa' : '#44755a';
  const cursorStroke = isDark ? '#2dd4bf' : '#10b981';

  const hasAnyApps = data.some((d) => d.applications > 0 || d.cumulative > 0);

  return (
    <Card className="h-full">
      <CardHeader className="items-start gap-3">
        <div className="min-w-0">
          <CardTitle>Application Trend</CardTitle>
          <p className="mt-1 text-xs text-zinc-500">
            Volume and cumulative applications ({period.rangeLabel})
          </p>
        </div>

        <div className="ml-auto flex shrink-0 rounded-lg border border-zinc-200">
          {PERIOD_OPTIONS.map((option, index) => {
            const isActive = option.value === granularity;
            const isFirst = index === 0;
            const isLast = index === PERIOD_OPTIONS.length - 1;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setGranularity(option.value)}
                className={clsx(
                  'px-3 py-1.5 text-sm font-medium transition-colors',
                  isFirst && 'rounded-l-lg',
                  isLast && 'rounded-r-lg',
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900',
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </CardHeader>

      {!hasAnyApps ? (
        <div className="flex h-[380px] items-center justify-center text-zinc-400">
          <div className="text-center">
            <p className="text-sm font-medium">No data yet</p>
            <p className="mt-1 text-xs">
              Add applications to see activity over time
            </p>
          </div>
        </div>
      ) : (
        <div className="h-[380px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={gridStroke}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: axisTickFill }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: axisTickFill }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                content={(props) => (
                  <TrendTooltip
                    {...props}
                    tooltipPrefix={period.tooltipPrefix}
                  />
                )}
                cursor={{
                  stroke: cursorStroke,
                  strokeWidth: 1,
                  strokeDasharray: '4 4',
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
              />
              <Line
                type="monotone"
                dataKey="applications"
                name={period.seriesName}
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                name="Cumulative"
                stroke="#0ea5e9"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
