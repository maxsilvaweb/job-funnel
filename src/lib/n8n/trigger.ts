// src/lib/n8n/trigger.ts

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

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
    },
    body: JSON.stringify(body),
  });

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
