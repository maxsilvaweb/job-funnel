// src/app/applications/[id]/page.tsx

import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

/** Legacy `/applications/:id` → `/applications/edit/:id` */
export default async function ApplicationIdRedirect({ params }: Props) {
  const { id } = await params;
  redirect(`/applications/edit/${id}`);
}
