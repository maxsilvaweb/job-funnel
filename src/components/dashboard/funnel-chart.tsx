// src/components/dashboard/funnel-chart.tsx

'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import type { FunnelStage } from '@/types';

interface FunnelChartProps {
  data: FunnelStage[];
}

function CustomTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;

  const stage = payload[0].payload as FunnelStage;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-lg">
      <p className="font-semibold text-zinc-900">{stage.name}</p>
      <div className="mt-1 space-y-1">
        <p className="text-sm text-zinc-600">
          Count:{' '}
          <span className="font-mono font-semibold text-zinc-900">
            {stage.count}
          </span>
        </p>
        <p className="text-sm text-zinc-600">
          From previous stage:{' '}
          <span className="font-mono font-semibold text-zinc-900">
            {stage.conversionFromPrevious}%
          </span>
        </p>
        <p className="text-sm text-zinc-600">
          From top of funnel:{' '}
          <span className="font-mono font-semibold text-zinc-900">
            {stage.conversionFromTop}%
          </span>
        </p>
      </div>
    </div>
  );
}

export function FunnelChart({ data }: FunnelChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Application Funnel</CardTitle>
        </CardHeader>
        <div className="flex h-64 items-center justify-center text-zinc-400">
          <div className="text-center">
            <p className="text-sm font-medium">No data yet</p>
            <p className="text-xs mt-1">Add applications to see your funnel</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Funnel</CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={380}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 0,
            right: 60,
            bottom: 0,
            left: 120,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="#f4f4f5"
          />
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: '#71717a' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={110}
            tick={{ fontSize: 12, fill: '#3f3f46' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={CustomTooltip} cursor={{ fill: '#f4f4f5' }} />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.colour} fillOpacity={0.85} />
            ))}
            <LabelList
              dataKey="conversionFromTop"
              position="right"
              formatter={(val) => `${val}%`}
              style={{
                fontSize: 11,
                fontWeight: 600,
                fill: '#71717a',
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
