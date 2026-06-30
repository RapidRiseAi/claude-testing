// POST /api/track — record an affiliate referral click / session.
//
// Called best-effort from the browser when a visitor arrives with a referral
// code. Calls record_website_referral_click(jsonb), which validates the code
// against the live affiliates.tracking_code (status ACTIVE) and, if valid,
// upserts the referral session (keyed by the website-generated session_id) and
// appends a click event. For the visitor it ALWAYS succeeds quietly: an invalid
// or unconfigured code never surfaces an error and never affects rendering.
//
// Privacy: the CRM intentionally stores no IP / user-agent fingerprints, so we
// send none — only the code, the session uuid, the landing path and referrer.

import {
  env,
  isConfigured,
  json,
  readJsonBody,
  cleanString,
  cleanAffiliateCode,
  callRpc,
  clientIp,
  rateLimit,
} from './_lib/server.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false })
  // Not configured yet → succeed quietly; the client ignores the body anyway.
  if (!isConfigured()) return json(res, 200, { ok: false, error: 'not_configured' })

  // Cap click spam per IP (60 / 5 min). Fails open if Upstash is unset.
  const limit = await rateLimit(`track:${clientIp(req)}`, 60, 300)
  if (!limit.ok) return json(res, 200, { ok: false, error: 'rate_limited' })

  const body = await readJsonBody(req)
  const code = cleanAffiliateCode(body && body.code)
  const sessionId = cleanString(body && body.sessionId, 64)
  if (!code || !sessionId) {
    console.warn('track: invalid_or_missing_input')
    return json(res, 200, { ok: false, error: 'invalid_input' })
  }

  const payload = {
    code,
    session_id: sessionId,
    tracking_token: cleanString(body.trackingToken, 64),
    landing_page: cleanString(body.landingPath, 300),
    referrer: cleanString(body.referrer, 500),
  }

  try {
    const result = await callRpc(env.clickRpc, { p_payload: payload })
    if (!result.ok) console.warn(`track: rpc_status_${result.status}`)
    // result.data is the function's jsonb { ok, reason? }
    return json(res, 200, { ok: Boolean(result.ok && result.data && result.data.ok) })
  } catch {
    console.warn('track: rpc_network_error')
    return json(res, 200, { ok: false })
  }
}
