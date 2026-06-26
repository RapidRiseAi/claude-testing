import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { captureAffiliateFromUrl, getStoredAffiliate, reportAffiliateVisit } from '../utils/affiliate'

// Non-visual: captures an affiliate referral code from the URL on first load and
// on every in-app navigation (an affiliate deep-link can land on any route), then
// fires a single best-effort click/referral-session report to the server.
//
// Renders nothing and never throws — page rendering is unaffected whether or not
// an affiliate code is present, valid, or the tracking endpoint exists.
export default function AffiliateTracker() {
  const location = useLocation()

  useEffect(() => {
    // captureAffiliateFromUrl returns the record only when a NEW valid code was
    // just written; on a refresh of an already-known code it returns null, so we
    // fall back to the stored record to (re)report once per session.
    const fresh = captureAffiliateFromUrl(location.search)
    const record = fresh || getStoredAffiliate()
    if (record) reportAffiliateVisit(record)
  }, [location.search, location.pathname])

  return null
}
