// src/app/applications/edit/[id]/edit-application-form.tsx

'use client';

import { useRouter } from 'next/navigation';
import { ApplicationForm } from '@/components/applications/application-form';
import type { Application } from '@/types';

export function EditApplicationForm({
  application,
}: {
  application: Application;
}) {
  const router = useRouter();

  return (
    <ApplicationForm
      application={application}
      onSuccess={() => router.push('/applications')}
    />
  );
}
