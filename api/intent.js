// POST /api/intent - record an attributed WhatsApp/email intent as a draft CRM lead.

import {
  env,
  isConfigured,
  json,
  readJsonBody,
  cleanString,
  cleanAffiliateCode,
  visitorToken,
  callRpc,
} from './_lib/server.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method_not_allowed' })
  if (!isConfigured()) return json(res, 200, { ok: false, error: 'not_configured' })

  const body = await readJsonBody(req)
  const code = cleanAffiliateCode(body && body.code)
  const sessionId = cleanString(body && body.sessionId, 64)
  const channel = cleanString(body && body.channel, 40)
  if (!code || !sessionId || !['whatsapp', 'email', 'phone'].includes(channel || '')) {
    return json(res, 200, { ok: false, error: 'invalid_input' })
  }

  const payload = {
    code,
    session_id: sessionId,
    tracking_token: cleanString(body.trackingToken, 64),
    channel,
    page_path: cleanString(body.pagePath, 300),
    page_url: cleanString(body.pageUrl, 500),
    link_url: cleanString(body.linkUrl, 500),
    service_hint: cleanString(body.serviceHint, 120),
    visitor_token: visitorToken(req),
  }

  try {
    const result = await callRpc(env.intentRpc, { p_payload: payload })
    if (!result.ok) console.warn(`intent: rpc_status_${result.status}`)
    return json(res, 200, { ok: Boolean(result.ok && result.data && result.data.ok) })
  } catch {
    console.warn('intent: rpc_network_error')
    return json(res, 200, { ok: false })
  }
}
