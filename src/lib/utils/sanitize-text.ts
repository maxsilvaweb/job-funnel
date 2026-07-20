/** Enough for summary + recent roles; keeps OpenAI TPM usage under control. */
export const RESUME_TEXT_MAX_CHARS = 8000;

/**
 * Strip HTML and normalize plain text for safe use in downstream
 * consumers (e.g. n8n → OpenAI JSON bodies).
 */
export function sanitizePlainText(
  input: string | null | undefined,
  maxChars = RESUME_TEXT_MAX_CHARS,
): string {
  if (!input) return '';

  const cleaned = input
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    )
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  if (cleaned.length <= maxChars) return cleaned;
  return `${cleaned.slice(0, maxChars).trimEnd()}\n…[truncated]`;
}
