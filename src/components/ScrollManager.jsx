import { useLayoutEffect, useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { LEGAL_NAV } from '../data/legalContent'

const KEY = 'rr-scroll:'
const LEGAL_SLUGS = new Set(LEGAL_NAV.map((d) => d.slug))

/* Final-destination pages always open at the TOP — individual service pages,
   contact, and legal / policy pages. Every other page is a "hub" whose scroll
   position is saved and restored within the browser session. */
function isRestorable(pathname) {
  const clean = (pathname || '/').replace(/\/+$/, '') || '/'
  if (clean === '/contact') return false
  if (/^\/services\/[^/]+/.test(clean)) return false           // an individual service page
  if (LEGAL_SLUGS.has(clean.replace(/^\//, ''))) return false  // legal / policy page
  return true
}

/* Scroll-position manager (replaces the old always-top ScrollToTop).

   - Hub pages remember their scroll position and restore it on browser
     back / forward.
   - Destination pages, fresh / forward navigations, and the very first page
     load all start at the top.
   - Positions live in sessionStorage, keyed by the exact path, so they are
     tied to that page and clear automatically when the tab / window closes —
     nothing carries over between separate visits or sessions.

   Behaviour only: no page structure, content, or styling is touched. */
export default function ScrollManager() {
  const { pathname } = useLocation()
  const navType = useNavigationType()   // 'POP' (back/forward) | 'PUSH' | 'REPLACE'
  const firstRender = useRef(true)
  // True while a restore is in progress — pauses saving so a clamped intermediate
  // scroll (page not tall enough yet) can't overwrite the real saved position.
  const restoring = useRef(false)

  // Take over scroll restoration from the browser — its SPA guess is unreliable
  // and would fight the logic below.
  useEffect(() => {
    if (!('scrollRestoration' in window.history)) return
    const prev = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    return () => { window.history.scrollRestoration = prev }
  }, [])

  // While on a restorable page, keep its latest scroll position saved (throttled
  // to one write per frame). Destination pages never save.
  useEffect(() => {
    if (!isRestorable(pathname)) return
    let raf = 0
    const persist = () => {
      raf = 0
      if (restoring.current) return   // don't overwrite the saved value mid-restore
      try { sessionStorage.setItem(KEY + pathname, String(Math.round(window.scrollY))) } catch { /* private mode */ }
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(persist) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [pathname])

  // Decide the initial scroll for each route.
  useLayoutEffect(() => {
    const isFirst = firstRender.current
    firstRender.current = false

    // Restore ONLY on an in-app back / forward (POP) to a hub page. The first
    // load, fresh pushes, and every destination page start at the top.
    let target = 0
    if (!isFirst && navType === 'POP' && isRestorable(pathname)) {
      const saved = sessionStorage.getItem(KEY + pathname)
      if (saved != null) target = parseInt(saved, 10) || 0
    }

    if (target <= 0) {
      restoring.current = false
      window.scrollTo(0, 0)
      return
    }

    // Patient restore: the page (esp. home, with its 3D + snap layout and images)
    // is often NOT tall enough yet, so an immediate scrollTo clamps toward 0. Keep
    // re-asserting every frame until we actually reach the target, within a time
    // budget — and pause saving meanwhile so the clamped value can't be written.
    restoring.current = true
    window.scrollTo(0, target)
    const startedAt = (typeof performance !== 'undefined' ? performance.now() : 0)
    const tick = () => {
      window.scrollTo(0, target)
      const reached = Math.abs(window.scrollY - target) <= 2
      const now = (typeof performance !== 'undefined' ? performance.now() : 0)
      if (reached || now - startedAt > 1500) {
        // Settle one more frame, then resume saving.
        requestAnimationFrame(() => { restoring.current = false })
        return
      }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [pathname, navType])

  return null
}
