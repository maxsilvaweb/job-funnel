// src/components/dashboard/application-trend-chart.tsx

'use client';

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
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/lib/hooks/use-theme';
import type { WeeklyTrendPoint } from '@/types';

interface ApplicationTrendChartProps {
  data: WeeklyTrendPoint[];
}

function TrendTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-lg">
      <p className="font-semibold text-zinc-900">Week of {label}</p>
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

export function ApplicationTrendChart({ data }: ApplicationTrendChartProps) {
  const theme = useTheme();
  const isDark = theme === 'dark';

  const gridStroke = isDark ? '#27272a' : '#d6eddb';
  const axisTickFill = isDark ? '#a1a1aa' : '#44755a';
  const cursorStroke = isDark ? '#2dd4bf' : '#10b981';

  const hasAnyApps = data.some((d) => d.applications > 0 || d.cumulative > 0);

  if (!hasAnyApps) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Application Trend</CardTitle>
        </CardHeader>
        <div className="flex h-[380px] items-center justify-center text-zinc-400">
          <div className="text-center">
            <p className="text-sm font-medium">No data yet</p>
            <p className="mt-1 text-xs">
              Add applications to see weekly activity
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>Application Trend</CardTitle>
          <p className="mt-1 text-xs text-zinc-500">
            Weekly volume and cumulative applications (last 12 weeks)
          </p>
        </div>
      </CardHeader>

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
              dataKey="week"
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
              content={TrendTooltip}
              cursor={{ stroke: cursorStroke, strokeWidth: 1, strokeDasharray: '4 4' }}
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
              name="This week"
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
    </Card>
  );
}
