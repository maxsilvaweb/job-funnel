// src/app/applications/new/new-application-form.tsx

'use client';

import { useRouter } from 'next/navigation';
import { ApplicationForm } from '@/components/applications/application-form';

export function NewApplicationForm() {
  const router = useRouter();

  return (
    <ApplicationForm onSuccess={() => router.push('/applications')} />
  );
}
