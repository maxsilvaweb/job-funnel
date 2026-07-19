// src/app/applications/[id]/page.tsx

import { createClient } from '@/lib/supabase/server';
import { Shell } from '@/components/layout/shell';
import { ApplicationForm } from '@/components/applications/application-form';
import { StageTimeline } from '@/components/applications/stage-timeline';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { STAGE_LABELS } from '@/lib/constants';
import type { ApplicationStatus } from '@/types';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: application, error } = await supabase
    .from('applications')
    .select('*, stages(*)')
    .eq('id', id)
    .single();

  if (error || !application) {
    notFound();
  }

  return (
    <Shell>
      <div className="space-y-6">
        {/* Back + title */}
        <div className="flex items-start gap-4">
          <Link
            href="/applications"
            className="rounded-lg border border-zinc-200 p-2 hover:bg-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-zinc-600" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-zinc-900">
                {application.company}
              </h1>
              <Badge status={application.status}>
                {STAGE_LABELS[application.status as ApplicationStatus]}
              </Badge>
              {application.job_url && (
                <a
                  href={application.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                >
                  <ExternalLink className="h-3 w-3" />
                  View Job
                </a>
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              {application.role}
              {application.location && ` · ${application.location}`}
              {application.remote && ' · Remote'}
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Edit form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Edit Application</CardTitle>
              </CardHeader>
              <ApplicationForm application={application} />
            </Card>
          </div>

          {/* Stage timeline */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Stage Timeline</CardTitle>
              </CardHeader>
              <StageTimeline stages={application.stages || []} />
            </Card>
          </div>
        </div>
      </div>
    </Shell>
  );
}
