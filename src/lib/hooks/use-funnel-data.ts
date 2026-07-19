// src/lib/hooks/use-funnel-data.ts

'use client';

import { useMemo } from 'react';
import { useApplications } from './use-applications';
import { buildFunnelData } from '@/lib/utils/funnel';
import { diagnoseFunnel } from '@/lib/utils/diagnosis';

export function useFunnelData() {
  const { data: applications, ...rest } = useApplications();

  const funnelData = useMemo(
    () => buildFunnelData(applications || []),
    [applications],
  );

  const diagnoses = useMemo(() => diagnoseFunnel(funnelData), [funnelData]);

  return {
    applications: applications || [],
    funnelData,
    diagnoses,
    ...rest,
  };
}
