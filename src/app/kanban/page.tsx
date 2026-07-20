// src/app/kanban/page.tsx

import { Shell } from '@/components/layout/shell';
import { ApplicationsView } from '../applications/applications-view';

export default function KanbanPage() {
  return (
    <Shell>
      <ApplicationsView view="kanban" />
    </Shell>
  );
}
