// src/app/dashboard/page.tsx

import { Shell } from '@/components/layout/shell';
import { MetricsGrid } from '@/components/dashboard/metrics-grid';
import { FunnelChart } from '@/components/dashboard/funnel-chart';
import { ConversionRates } from '@/components/dashboard/conversion-rates';
import { DiagnosisCard } from '@/components/dashboard/diagnosis-card';
import { WeeklyTargets } from '@/components/dashboard/weekly-targets';
import { getApplications } from '@/actions/applications';
import { buildFunnelData } from '@/lib/utils/funnel';

export default async function DashboardPage() {
  const { data: applications } = await getApplications();
  const initialFunnel = buildFunnelData(applications);

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Job hunting is a funnel problem. Measure it. Fix the bottleneck.
          </p>
        </div>

        {/* Metrics */}
        <MetricsGrid />

        {/* Funnel chart + conversion rates */}
        <div className="space-y-6">
          <FunnelChart data={initialFunnel} />
          <ConversionRates />
        </div>

        {/* Diagnosis + weekly targets */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DiagnosisCard />
          <WeeklyTargets />
        </div>
      </div>
    </Shell>
  );
}
