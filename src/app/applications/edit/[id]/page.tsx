// src/app/applications/edit/[id]/page.tsx

import { createClient } from '@/lib/supabase/server';
import { Shell } from '@/components/layout/shell';
import { ApplicationForm } from '@/components/applications/application-form';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  STAGE_LABELS,
  WORK_MODE_LABELS,
  getApplicationWorkMode,
} from '@/lib/constants';
import type { ApplicationStatus } from '@/types';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditApplicationPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: application, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !application) {
    notFound();
  }

  return (
    <Shell>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex items-start gap-4">
          <Link
            href="/applications"
            className="rounded-lg border border-zinc-200 p-2 transition-colors hover:bg-zinc-100"
          >
            <ArrowLeft className="h-4 w-4 text-zinc-600" />
          </Link>
          <div className="min-w-0 flex-1">
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
                  className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 transition-colors hover:text-emerald-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  View Job
                </a>
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              {[
                application.role,
                application.location,
                WORK_MODE_LABELS[getApplicationWorkMode(application)],
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Application</CardTitle>
          </CardHeader>
          <ApplicationForm application={application} />
        </Card>
      </div>
    </Shell>
  );
}
