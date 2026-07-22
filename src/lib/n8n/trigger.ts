// src/lib/n8n/trigger.ts

import dns from 'node:dns';

// Prefer IPv4 — some local networks advertise broken IPv6 routes to Cloudflare,
// which makes undici hang then fail with "Connect Timeout Error".
dns.setDefaultResultOrder('ipv4first');

export const N8N_WORKFLOWS = {
  resumeNormalize: 'resume-normalize',
} as const;

export type N8nWorkflowSlug =
  (typeof N8N_WORKFLOWS)[keyof typeof N8N_WORKFLOWS];

export type TriggerN8nResult =
  | { ok: true; status: number }
  | {
      ok: false;
      reason: 'webhook_not_configured' | 'webhook_failed';
      status?: number;
      detail?: string;
    };

/**
 * POST JSON to `{N8N_WEBHOOK_BASE_URL}/{workflow}`.
 * Base URL should be the n8n webhook root, e.g. https://n8n.example.com/webhook
 * (no trailing slash). Workflow slug matches the Webhook node path.
 *
 * Expects the n8n Webhook to respond immediately (`onReceived`) so this call
 * only confirms the workflow was started — not that it finished.
 */
export async function triggerN8n(
  workflow: N8nWorkflowSlug | string,
  body: Record<string, unknown>,
): Promise<TriggerN8nResult> {
  const base = process.env.N8N_WEBHOOK_BASE_URL?.replace(/\/+$/, '');
  if (!base) {
    return { ok: false, reason: 'webhook_not_configured' };
  }

  const slug = String(workflow).replace(/^\/+/, '');
  const url = `${base}/${slug}`;
  const secret = process.env.N8N_WEBHOOK_SECRET;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    const detail =
      err instanceof Error
        ? [err.message, err.cause instanceof Error ? err.cause.message : '']
            .filter(Boolean)
            .join(': ')
        : 'n8n webhook request failed';
    return { ok: false, reason: 'webhook_failed', detail: detail.slice(0, 300) };
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    return {
      ok: false,
      reason: 'webhook_failed',
      status: response.status,
      detail: detail.slice(0, 300),
    };
  }

  return { ok: true, status: response.status };
}
