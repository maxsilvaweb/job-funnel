// src/app/applications/page.tsx

import { Suspense } from 'react';
import { Shell } from '@/components/layout/shell';
import { ApplicationsView } from './applications-view';

export default function ApplicationsPage() {
  return (
    <Shell>
      <Suspense>
        <ApplicationsView />
      </Suspense>
    </Shell>
  );
}
