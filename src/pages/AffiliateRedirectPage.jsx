import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  captureAffiliateFromRoute,
  getStoredAffiliate,
  reportAffiliateVisit,
} from '../utils/affiliate'
import usePageMeta from '../hooks/usePageMeta'

export default function AffiliateRedirectPage() {
  const location = useLocation()
  const navigate = useNavigate()

  // Functional referral redirect, not a content page — never index it.
  usePageMeta(undefined, undefined, { noindex: true })

  useEffect(() => {
    const captured = captureAffiliateFromRoute(location.pathname, location.search)
    const destination = captured?.destination || '/'
    const record = captured?.record || getStoredAffiliate()

    if (record) reportAffiliateVisit(record)
    navigate(destination, { replace: true })
  }, [location.pathname, location.search, navigate])

  return null
}
