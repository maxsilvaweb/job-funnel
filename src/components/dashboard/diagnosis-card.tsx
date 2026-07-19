// src/components/dashboard/diagnosis-card.tsx

'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useFunnelData } from '@/lib/hooks/use-funnel-data';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { Diagnosis } from '@/types';

const severityConfig = {
  good: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconColour: 'text-emerald-500',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColour: 'text-amber-500',
  },
  critical: {
    icon: AlertCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconColour: 'text-red-500',
  },
};

function DiagnosisItem({ diagnosis }: { diagnosis: Diagnosis }) {
  const config = severityConfig[diagnosis.severity];
  const Icon = config.icon;

  return (
    <div className={clsx('rounded-lg border p-4', config.bg, config.border)}>
      <div className="flex items-start gap-3">
        <Icon className={clsx('mt-0.5 h-5 w-5 shrink-0', config.iconColour)} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900">
            {diagnosis.stage}
          </p>
          <p className="mt-0.5 text-sm text-zinc-700">{diagnosis.message}</p>
          <div className="mt-2 flex items-start gap-2">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p className="text-xs text-zinc-600">{diagnosis.suggestion}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DiagnosisCard() {
  const { diagnoses, applications } = useFunnelData();

  if (applications.length < 5) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Funnel Diagnosis</CardTitle>
        </CardHeader>
        <div className="flex items-center gap-3 rounded-lg bg-zinc-50 p-4">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <p className="text-sm text-zinc-600">
            Add at least 5 applications to get meaningful funnel diagnostics.
            More data = better insights.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funnel Diagnosis</CardTitle>
      </CardHeader>
      <div className="space-y-3">
        {diagnoses.map((diagnosis, index) => (
          <DiagnosisItem key={index} diagnosis={diagnosis} />
        ))}
      </div>
    </Card>
  );
}
