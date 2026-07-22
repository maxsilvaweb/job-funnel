// src/app/api/resume/extract/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  RESUME_UPLOAD_MAX_BYTES,
  extractResumeText,
} from '@/lib/utils/extract-resume-text';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: 'Expected multipart form data with a file field.' },
      { status: 400 },
    );
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'Missing file. Upload using the "file" field.' },
      { status: 400 },
    );
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: 'File is empty.' }, { status: 400 });
  }

  if (file.size > RESUME_UPLOAD_MAX_BYTES) {
    return NextResponse.json(
      { error: 'File is too large. Maximum size is 5MB.' },
      { status: 400 },
    );
  }

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { text, kind } = await extractResumeText(
      file.name,
      file.type || '',
      bytes,
    );

    return NextResponse.json({
      text,
      kind,
      fileName: file.name,
      characters: text.length,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to extract resume text.';
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
