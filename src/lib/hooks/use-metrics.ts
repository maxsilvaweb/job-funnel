// src/lib/hooks/use-metrics.ts

'use client'

import { useMemo } from 'react'
import { useApplications } from './use-applications'
import {
  calculateResponseRate,
  calculateGhostRate,
  calculateAverageTimeToResponse,
  applicationsNeededForOffers,
} from '@/lib/utils/funnel'
import { isThisWeek } from '@/lib/utils/dates'
import type { ApplicationStatus } from '@/types'

export function useMetrics() {
  const { data: applications } = useApplications()

  return useMemo(() => {
    const apps = applications || []

    const thisWeekApps = apps.filter((a) =>
      isThisWeek(a.date_applied)
    )

    const activeStatuses: ApplicationStatus[] = [
      'applied',
      'responded',
      'screening',
      'tech_interview',
      'final_round',
    ]

    const terminalStatuses: ApplicationStatus[] = [
      'accepted',
      'rejected',
      'ghosted',
      'withdrawn',
    ]

    const activeApplications = apps.filter((a) =>
      activeStatuses.includes(a.status)
    )

    const closedApplications = apps.filter((a) =>
      terminalStatuses.includes(a.status)
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
