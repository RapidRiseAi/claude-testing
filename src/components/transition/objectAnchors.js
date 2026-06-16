/**
 * Route → 3-D-object resolution + on-screen anchor measurement for the
 * cinematic transition.
 *
 * "In scope" (full black-hole morph) means BOTH ends own a live 3-D object:
 * the home page (the orb / current carousel object) or a service detail page
 * (its hero object). Everything else gets the fast cross-fade instead.
 */
import { carouselState } from '../../utils/carouselState'
import { SLUG_TO_OBJECT } from '../ui/ServiceHeroObject'
import { transitionState } from './transitionState'

/**
 * Classify a pathname.
 * @returns {{kind:'home'|'service'|'other', index:number|null, slug?:string}}
 */
export function resolveRoute(pathname) {
  if (pathname === '/' || pathname === '') {
    const i = Math.max(0, Math.min(6, carouselState.activeCard | 0))
    return { kind: 'home', index: i }
  }
  const m = pathname.match(/^\/services\/([^/?#]+)/)
  if (m) {
    const slug = m[1]
    const index = SLUG_TO_OBJECT[slug]
    if (index != null) return { kind: 'service', index, slug }
  }
  return { kind: 'other', index: null }
}

/** Both ends must own an object for the full morph to make sense. */
export function isMorphPair(from, to) {
  return from.index != null && to.index != null
}

/**
 * Current on-screen centre (CSS px) of the object for a given route info, read
 * live from the DOM / home-orb state. Returns null when unknown (→ the canvas
 * falls back to screen centre, which still looks fine).
 */
export function objectScreenAnchor(info) {
  if (!info) return null
  if (info.kind === 'home') {
    return transitionState.homeOrbScreen
      ? { ...transitionState.homeOrbScreen }
      : null
  }
  if (info.kind === 'service') {
    const el = document.querySelector('.svc-hero-object')
    if (!el) return null
    const r = el.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) return null
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }
  return null
}

/**
 * Turn an <a> element into an internal SPA pathname, or null if it should be
 * left to the browser (external origin, hash-only, download, target=_blank…).
 */
export function internalPath(anchor) {
  if (!anchor) return null
  const href = anchor.getAttribute('href')
  if (!href) return null
  if (anchor.target && anchor.target !== '' && anchor.target !== '_self') return null
  if (anchor.hasAttribute('download')) return null
  if (anchor.dataset.noTransition != null) return null
  // mailto:, tel:, etc.
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) && !/^https?:/i.test(href)) return null
  let url
  try {
    url = new URL(href, window.location.href)
  } catch {
    return null
  }
  if (url.origin !== window.location.origin) return null
  // Pure in-page hash (#faq) — not a route change.
  if (url.pathname === window.location.pathname && url.hash && !url.search) return null
  return url.pathname + url.search
}
