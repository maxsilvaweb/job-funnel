// src/app/applications/page.tsx

import { Shell } from '@/components/layout/shell';
import { ApplicationsView } from './applications-view';

export default function ApplicationsPage() {
  return (
    <Shell>
      <ApplicationsView view="table" />
    </Shell>
  );
}
