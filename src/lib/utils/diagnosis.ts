// src/lib/utils/diagnosis.ts

import type { FunnelStage, Diagnosis } from '@/types';
import { HEALTHY_RATES } from '@/lib/constants';

/**
 * Analyse funnel conversion rates against healthy benchmarks
 * and return actionable diagnoses for each problem stage.
 */
export function diagnoseFunnel(funnelData: FunnelStage[]): Diagnosis[] {
  const diagnoses: Diagnosis[] = [];

  if (funnelData.length === 0) return diagnoses;

  const stageMap = new Map(funnelData.map((s) => [s.name, s]));

  // 1. Response rate
  const responded = stageMap.get('Responded');
  if (responded) {
    const rate = responded.conversionFromPrevious;
    const bench = HEALTHY_RATES.applied_to_responded;

    if (rate < bench.min) {
      diagnoses.push({
        stage: 'Applied → Responded',
        severity: rate < bench.min / 2 ? 'critical' : 'warning',
        message: `Your response rate is ${rate}% — healthy is ${bench.min}–${bench.max}%`,
        suggestion:
          'Your CV or targeting is the bottleneck. Tailor your CV to each role, target companies where your BBC/Visa/FIFA experience is a direct match, and strengthen your personal summary. Check if your CV is passing ATS filters at jobscan.co.',
      });
    } else {
      diagnoses.push({
        stage: 'Applied → Responded',
        severity: 'good',
        message: `Response rate is ${rate}% — above the ${bench.min}% threshold`,
        suggestion:
          'Your positioning is working. Keep your current targeting strategy.',
      });
    }
  }

  // 2. Screening pass rate
  const screening = stageMap.get('Screening');
  if (screening && screening.count > 0) {
    const rate = screening.conversionFromPrevious;
    const bench = HEALTHY_RATES.responded_to_screening;

    if (rate < bench.min) {
      diagnoses.push({
        stage: 'Responded → Screening',
        severity: 'warning',
        message: `Screen pass rate is ${rate}% — healthy is ${bench.min}–${bench.max}%`,
        suggestion:
          'You are getting responses but not progressing. Common causes: salary expectations mismatch, location or visa constraints, or a weak pitch on recruiter calls. Prepare a tight 60-second elevator pitch.',
      });
    }
  }

  // 3. Technical interview pass rate
  const tech = stageMap.get('Technical Interview');
  if (tech && tech.count > 0) {
    const rate = tech.conversionFromPrevious;
    const bench = HEALTHY_RATES.screening_to_tech;

    if (rate < bench.min) {
      diagnoses.push({
        stage: 'Screening → Technical',
        severity: rate < bench.min / 2 ? 'critical' : 'warning',
        message: `Technical pass rate is ${rate}% — healthy is ${bench.min}–${bench.max}%`,
        suggestion:
          'Technical interviews are your bottleneck. Dedicate time to system design practice, review your own project architecture decisions out loud, and practise talking through code as you write it.',
      });
    }
  }

  // 4. Final to offer
  const finalRound = stageMap.get('Final Round');
  const offer = stageMap.get('Offer');
  if (finalRound && offer && finalRound.count > 0) {
    const rate = Math.round((offer.count / finalRound.count) * 100);
    const bench = HEALTHY_RATES.final_to_offer;

    if (rate < bench.min) {
      diagnoses.push({
        stage: 'Final → Offer',
        severity: 'warning',
        message: `Final-to-offer rate is ${rate}% — healthy is ${bench.min}–${bench.max}%`,
        suggestion:
          'You are reaching finals but not closing. This is usually about cultural fit signalling, salary negotiation, or a stronger competing candidate. Ask recruiters for specific feedback after every rejection.',
      });
    }
  }

  // 5. Ghost rate
  const applied = stageMap.get('Applied');
  if (applied && responded) {
    const ghostRate = 100 - responded.conversionFromPrevious;
    if (ghostRate > 80) {
      diagnoses.push({
        stage: 'Ghost Rate',
        severity: 'critical',
        message: `${ghostRate}% of applications are getting no response`,
        suggestion:
          'Follow up after 5 business days, apply through referrals instead of cold applications, and verify your CV is passing ATS systems.',
      });
    }
  }

  return diagnoses;
}
