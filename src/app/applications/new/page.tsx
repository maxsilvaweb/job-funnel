// src/app/applications/new/page.tsx

import { Shell } from '@/components/layout/shell';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { NewApplicationForm } from './new-application-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewApplicationPage() {
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
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              New Application
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Enter company, role, and stage details — then save
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application details</CardTitle>
          </CardHeader>
          <NewApplicationForm />
        </Card>
      </div>
    </Shell>
  );
}
