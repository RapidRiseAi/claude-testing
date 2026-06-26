// ── Affiliate referral capture & attribution ─────────────────────────────────
//
// A visitor can arrive from an affiliate link carrying their referral code in
// the URL, e.g.  ?ref=ABC123 , ?affiliate=ABC123 , or ?utm_affiliate=ABC123 .
//
// This module is the ONE place that:
//   1. reads that code off the URL, trims + validates it;
//   2. stores it first-party (localStorage) for a 30-day attribution window;
//   3. hands it back to the contact form so submissions carry attribution.
//
// Privacy by design — this matches the site's no-third-party-cookie stance in
// consent.js: we persist ONLY the opaque code, a timestamp, and which param it
// came from. No personal data, no IP, no device fingerprint is stored here.
// The code is NEVER trusted on the client: it is validated against the live CRM
// `tracking_code` server-side (api/track.js, api/contact.js) before anything is
// recorded or attributed. An invalid code stored locally simply never matches.

export const AFFILIATE_PARAMS = ['ref', 'affiliate', 'utm_affiliate']
export const AFFILIATE_KEY = 'rr-aff'
export const AFFILIATE_TTL_DAYS = 30
const TTL_MS = AFFILIATE_TTL_DAYS * 24 * 60 * 60 * 1000

function newSessionId() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  } catch {
    /* fall through */
  }
  return `00000000-0000-4000-8000-${Math.random().toString(16).slice(2, 14).padEnd(12, '0')}`
}

// localStorage can throw (private mode, disabled storage) — never let that
// crash the app. A null return just means "no durable attribution this visit".
// (Same defensive pattern as consent.js.)
function safeStorage() {
  try {
    const t = '__rr_aff_probe__'
    window.localStorage.setItem(t, t)
    window.localStorage.removeItem(t)
    return window.localStorage
  } catch {
    return null
  }
}

// ── Validation rule ───────────────────────────────────────────────────────────
// Shape-check only — a cheap client-side filter so obviously-bogus values (a URL
// pasted into ?ref=, an injection attempt, an empty string) are never stored or
// sent. It deliberately does NOT decide whether a code is real; that is the live
// CRM's job server-side. Keep this in sync with the format of your CRM
// `tracking_code` column so legitimate codes are never rejected here.
const AFFILIATE_CODE_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{1,63}$/

export function isValidAffiliateCode(raw) {
  if (typeof raw !== 'string') return false
  const code = raw.trim()
  return AFFILIATE_CODE_RE.test(code)
}

// Pull the first present affiliate param out of a query string and normalise it.
// Returns { code, source } or null. Does not touch storage.
function readCodeFromSearch(search) {
  let params
  try {
    params = new URLSearchParams(search || '')
  } catch {
    return null
  }
  for (const source of AFFILIATE_PARAMS) {
    const raw = params.get(source)
    if (raw == null) continue
    const code = raw.trim()
    if (isValidAffiliateCode(code)) return { code, source }
  }
  return null
}

// Capture an affiliate code from the current URL into storage.
//
// Rules (from the brief):
//   • trim + validate before storing;
//   • a 30-day attribution window;
//   • do NOT overwrite an existing stored code unless a new VALID code is
//     explicitly present in this URL (first-touch attribution wins, but a fresh
//     affiliate link the visitor just clicked takes precedence).
//
// Returns the stored record { code, source, capturedAt } when a NEW code was
// written this call, otherwise null (nothing in the URL / already stored).
export function captureAffiliateFromUrl(search) {
  const found = readCodeFromSearch(
    search != null ? search : (typeof window !== 'undefined' ? window.location.search : ''),
  )
  if (!found) return null

  const ls = safeStorage()
  const existing = getStoredAffiliate()
  // Same code already on file (and still valid) → refresh nothing, no event.
  if (existing && existing.code === found.code) return null

  const record = {
    code: found.code,
    source: found.source,
    capturedAt: new Date().toISOString(),
    sessionId: newSessionId(),
  }
  if (ls) {
    try {
      ls.setItem(AFFILIATE_KEY, JSON.stringify(record))
    } catch {
      /* storage full / blocked — attribution is best-effort, never fatal */
    }
  }
  return record
}

// Read the stored attribution, honouring the 30-day window. Expired or
// malformed records are cleared and treated as "no attribution".
export function getStoredAffiliate() {
  const ls = safeStorage()
  if (!ls) return null
  let parsed
  try {
    parsed = JSON.parse(ls.getItem(AFFILIATE_KEY) || 'null')
  } catch {
    return null
  }
  if (!parsed || !isValidAffiliateCode(parsed.code) || !parsed.capturedAt) return null
  const age = Date.now() - new Date(parsed.capturedAt).getTime()
  if (!Number.isFinite(age) || age < 0 || age > TTL_MS) {
    clearStoredAffiliate()
    return null
  }
  if (!parsed.sessionId) {
    parsed.sessionId = newSessionId()
    try {
      ls.setItem(AFFILIATE_KEY, JSON.stringify(parsed))
    } catch {
      /* best-effort migration of older local records */
    }
  }
  return parsed
}

export function clearStoredAffiliate() {
  const ls = safeStorage()
  if (!ls) return
  try {
    ls.removeItem(AFFILIATE_KEY)
  } catch {
    /* ignore */
  }
}

// Fire-and-forget click/referral-session report to the server.
//
// The server (api/track.js) validates the code against the CRM tracking_code
// and records a referral session/click using existing tables. We send the code
// once per browser session per code (guarded via sessionStorage) so SPA
// navigation does not spam the endpoint. Any failure is swallowed — tracking
// must never affect page rendering.
//
// Disabled unless VITE_TRACK_API is set (a same-origin path like '/api/track'),
// so the default build behaves exactly as before: no network call at all.
const TRACK_API = import.meta.env.VITE_TRACK_API || ''

export function reportAffiliateVisit(record) {
  if (!TRACK_API || !record || !record.code) return
  let already = false
  try {
    const k = `rr-aff-reported:${record.code}`
    already = window.sessionStorage.getItem(k) === '1'
    if (!already) window.sessionStorage.setItem(k, '1')
  } catch {
    /* sessionStorage blocked — fall through and just send once */
  }
  if (already) return

  try {
    const body = JSON.stringify({
      code: record.code,
      sessionId: record.sessionId,
      source: record.source,
      landingPath: window.location.pathname,
      referrer: document.referrer || null,
    })
    // keepalive lets the request survive a fast navigation away from the page.
    fetch(TRACK_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* never throw from tracking */
  }
}
