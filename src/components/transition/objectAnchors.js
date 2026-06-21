/**
 * Route → 3-D-object resolution + on-screen anchor measurement for the
 * cinematic transition.
 *
 * "In scope" (full black-hole morph) means BOTH ends own a live 3-D object:
 * the home page (the orb / current carousel object) or a service detail page
 * (its hero object). Everything else gets the fast cross-fade instead.
 */
import { carouselState } from '../../utils/carouselState'
import { SLUG_TO_OBJECT } from '../../data/serviceObjects'
import { ROUTE_TO_OBJECT } from '../scene/PersistentScene'
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
  // Brand / trust pages (/proof, /about, /process, /contact) dock their own object
  // into a hero slot via the SAME 'service' path PersistentScene uses, so the
  // cinematic black-hole morph applies to them too (HeroOrb reassembles onto
  // worldState.slot, which those pages publish). Reuse PersistentScene's map.
  const key = pathname.split(/[?#]/)[0].replace(/\/$/, '')
  if (ROUTE_TO_OBJECT[key] != null) return { kind: 'service', index: ROUTE_TO_OBJECT[key], slug: key }
  return { kind: 'other', index: null }
}

/** Both ends must own an object for the full morph to make sense. */
export function isMorphPair(from, to) {
  return from.index != null && to.index != null
}

/**
 * Current on-screen descriptor of the object for a given route info, read live
 * from the data each real object publishes every frame (centre, on-screen
 * radius in px, and live rotation). Returns null when unknown (→ the canvas
 * falls back to screen centre at a default size, which still looks fine).
 * @returns {{x:number,y:number,r:number,rotY:number,rotX:number}|null}
 */
export function objectScreenAnchor(info) {
  if (!info) return null
  if (info.kind === 'home') {
    return transitionState.homeOrbScreen
      ? { ...transitionState.homeOrbScreen }
      : null
  }
  if (info.kind === 'service') {
    if (transitionState.svcObjScreen) return { ...transitionState.svcObjScreen }
    // Fallback before the object has published a frame: the container rect gives
    // a centre + a rough radius (no rotation known yet → 0).
    const el = document.querySelector('.svc-hero-object, .sd-hero-visual, .pg-hero-object')
    if (!el) return null
    const r = el.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) return null
    return {
      x: r.left + r.width / 2,
      y: r.top + r.height / 2,
      r: Math.min(r.width, r.height) * 0.4,
      rotY: 0,
      rotX: 0,
    }
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
