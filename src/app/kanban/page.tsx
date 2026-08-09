// src/app/kanban/page.tsx

import { Suspense } from 'react';
import { Shell } from '@/components/layout/shell';
import { ApplicationsView } from '../applications/applications-view';
import { Spinner } from '@/components/ui/spinner';

export default function KanbanPage() {
  return (
    <Shell>
      <Suspense
        fallback={
          <div className="flex h-48 items-center justify-center">
            <Spinner />
          </div>
        }
      >
        <ApplicationsView view="kanban" />
      </Suspense>
    </Shell>
  );
}
