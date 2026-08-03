// src/lib/hooks/use-metrics.ts

'use client'

import { useMemo } from 'react'
import { useApplications } from './use-applications'
import { ACTIVE_APPLICATION_STAGES, CLOSED_STAGES } from '@/lib/constants'
import {
  calculateResponseRate,
  calculateGhostRate,
  calculateAverageTimeToResponse,
  applicationsNeededForOffers,
} from '@/lib/utils/funnel'
import { isThisWeek } from '@/lib/utils/dates'

export function useMetrics() {
  const { data: applications } = useApplications()

  return useMemo(() => {
    const apps = applications || []

    const thisWeekApps = apps.filter((a) =>
      isThisWeek(a.date_applied)
    )

    const activeApplications = apps.filter((a) =>
      ACTIVE_APPLICATION_STAGES.includes(a.status)
    )

    const closedApplications = apps.filter((a) =>
      CLOSED_STAGES.includes(a.status)
    )

    return {
      totalApplications: apps.length,
      applicationsThisWeek: thisWeekApps.length,
      activeApplications: activeApplications.length,
      closedApplications: closedApplications.length,
      responseRate: calculateResponseRate(apps),
      ghostRate: calculateGhostRate(apps),
      averageTimeToResponse: calculateAverageTimeToResponse(apps),
      applicationsNeededForOffer: applicationsNeededForOffers(apps, 1),
      applicationsNeededForThreeOffers: applicationsNeededForOffers(apps, 3),
    }
  }, [applications])
}
