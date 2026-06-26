// ── Contact form submission ──────────────────────────────────────────────────
//
// Submission order (first one that succeeds wins):
//   1. VITE_CONTACT_API  — same-origin serverless route (api/contact.js) that
//      inserts the lead into the Supabase/CRM backend and attaches affiliate
//      attribution. This is the real capture path.
//   2. WEBHOOK_URL       — optional generic webhook (Make.com / Zapier / n8n).
//   3. mailto fallback   — opens a pre-filled email draft (no fake "sent" state).
//
// Both server paths are OFF by default (empty env / empty constant) so the build
// behaves exactly as before — a mailto draft — until the backend is wired up.
// No secrets live here: the client only knows a same-origin path; the service
// role key, HMAC secret and CRM access all stay server-side in api/contact.js.

import { getStoredAffiliate } from './affiliate'

const CONTACT_API = import.meta.env.VITE_CONTACT_API || ''
const WEBHOOK_URL = ''

export const CONTACT_EMAIL = 'team@rapidriseai.com'
export const WHATSAPP_URL = 'https://wa.me/27649031234'
export const WHATSAPP_DISPLAY = '064 903 1234'

// Build the JSON payload sent to the server route / webhook. The affiliate code
// is read from first-party storage and validated again server-side before any
// attribution row is written — it is never trusted as-is.
function buildPayload(data, meta) {
  const affiliate = getStoredAffiliate()
  return {
    ...data,
    // Attribution (null when the visitor did not arrive via an affiliate link).
    affiliateCode: affiliate?.code ?? null,
    affiliateSessionId: affiliate?.sessionId ?? null,
    affiliateSource: affiliate?.source ?? null,
    affiliateCapturedAt: affiliate?.capturedAt ?? null,
    // Idempotency key — lets the server collapse double-clicks / retries of the
    // SAME filled-out form into one lead instead of duplicating it.
    submissionId: meta?.submissionId ?? null,
    submittedFrom: window.location.href,
    pagePath: window.location.pathname,
  }
}

async function postJson(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return res
}

export async function submitContactRequest(data, meta = {}) {
  const payload = buildPayload(data, meta)

  // 1) Real capture path: Supabase/CRM via the serverless route.
  if (CONTACT_API) {
    try {
      const res = await postJson(CONTACT_API, payload)
      if (res.ok) {
        const json = await res.json().catch(() => ({}))
        if (json && json.ok) return { delivered: true }
      }
      // Any non-ok result (not configured yet, validation, server error) falls
      // through to the next path so a real enquiry is never silently lost.
    } catch {
      /* network error → fall through to webhook / mailto */
    }
  }

  // 2) Optional generic webhook.
  if (WEBHOOK_URL) {
    try {
      const res = await postJson(WEBHOOK_URL, payload)
      if (res.ok) return { delivered: true }
    } catch {
      /* fall through to mailto */
    }
  }

  // 3) Fallback: open a pre-filled email draft with the request content.
  const lines = [
    `Name: ${data.name}`,
    data.business && `Business: ${data.business}`,
    data.email && `Email: ${data.email}`,
    data.phone && `Phone / WhatsApp: ${data.phone}`,
    `Service needed: ${data.service}`,
    `Budget range: ${data.budget}`,
    `Timeline: ${data.timeline}`,
    data.website && `Existing website: ${data.website}`,
    `Preferred contact method: ${data.preferredContact}`,
    payload.affiliateCode && `Referred by (affiliate): ${payload.affiliateCode}`,
    '',
    'Project details:',
    data.details,
  ].filter(Boolean)
  const subject = `Project request: ${data.service} (${data.name})`
  const href =
    `mailto:${CONTACT_EMAIL}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(lines.join('\n'))}`
  window.location.href = href
  return { delivered: false }
}
