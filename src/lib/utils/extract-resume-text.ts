// src/lib/utils/extract-resume-text.ts

import mammoth from 'mammoth';
import { extractText, getDocumentProxy } from 'unpdf';
import { sanitizePlainText } from '@/lib/utils/sanitize-text';

export const RESUME_UPLOAD_MAX_BYTES = 5 * 1024 * 1024; // 5MB

const PDF_TYPES = new Set(['application/pdf']);
const DOCX_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const TXT_TYPES = new Set(['text/plain', 'text/markdown']);

export type ResumeFileKind = 'pdf' | 'docx' | 'txt';

export function detectResumeKind(
  fileName: string,
  mimeType: string,
): ResumeFileKind | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pdf') || PDF_TYPES.has(mimeType)) return 'pdf';
  if (lower.endsWith('.docx') || DOCX_TYPES.has(mimeType)) return 'docx';
  if (
    lower.endsWith('.txt') ||
    lower.endsWith('.md') ||
    TXT_TYPES.has(mimeType)
  ) {
    return 'txt';
  }
  return null;
}

async function extractFromPdf(bytes: Uint8Array): Promise<string> {
  const pdf = await getDocumentProxy(bytes);
  const { text } = await extractText(pdf, { mergePages: true });
  return text;
}

async function extractFromDocx(bytes: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer: bytes });
  return result.value || '';
}

async function extractFromTxt(bytes: Buffer): Promise<string> {
  return bytes.toString('utf8');
}

/**
 * Extract plain text from a CV upload and sanitize for resume_text storage.
 */
export async function extractResumeText(
  fileName: string,
  mimeType: string,
  bytes: Uint8Array,
): Promise<{ text: string; kind: ResumeFileKind }> {
  const kind = detectResumeKind(fileName, mimeType);
  if (!kind) {
    throw new Error(
      'Unsupported file type. Please upload a PDF, DOCX, or TXT file.',
    );
  }

  let raw = '';
  if (kind === 'pdf') {
    raw = await extractFromPdf(bytes);
  } else if (kind === 'docx') {
    raw = await extractFromDocx(Buffer.from(bytes));
  } else {
    raw = await extractFromTxt(Buffer.from(bytes));
  }

  const text = sanitizePlainText(raw);
  if (!text.trim()) {
    throw new Error(
      'Could not extract any text from that file. Try a text-based PDF or DOCX.',
    );
  }

  return { text, kind };
}
