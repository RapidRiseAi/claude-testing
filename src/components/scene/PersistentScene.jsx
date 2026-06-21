import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Scene from './Scene'
import { worldState } from './worldState'
import { SLUG_TO_OBJECT } from '../../data/serviceObjects'

/* The ONE persistent 3-D object. Mounted once at the app root (outside the
   router stage) so it NEVER unmounts across navigations — that's what lets the
   same particles persist from page to page instead of each page owning its own
   object. It tracks the current route into worldState; the object (HeroOrb)
   reads worldState to decide what to do.

   Phase 1: the object is only VISIBLE on the home page (service pages still use
   their own object for now); the canvas just stays mounted + frozen elsewhere so
   the persistence machinery is in place for the later phases. */
/* Brand / trust pages dock their own dedicated object into a hero slot, reusing
   the exact same 'service' docking path. Indices map into CARD_GENERATORS.
   Exported so the transition resolver (objectAnchors.js) shares ONE source of
   truth → brand routes get the same cinematic morph and the maps can't drift. */
export const ROUTE_TO_OBJECT = {
  '/proof': 12,
  '/about': 13,
  '/process': 14,
  '/contact': 15,
}

function classifyRoute(pathname) {
  if (pathname === '/' || pathname === '') return { mode: 'home', slug: null, index: null }
  const m = pathname.match(/^\/services\/([^/?#]+)/)
  if (m && SLUG_TO_OBJECT[m[1]] != null) return { mode: 'service', slug: m[1], index: SLUG_TO_OBJECT[m[1]] }
  const key = pathname.split(/[?#]/)[0].replace(/\/$/, '')
  if (ROUTE_TO_OBJECT[key] != null) return { mode: 'service', slug: key, index: ROUTE_TO_OBJECT[key] }
  return { mode: 'other', slug: null, index: null }
}

export default function PersistentScene() {
  const { pathname } = useLocation()
  const [mode, setMode] = useState(() => classifyRoute(pathname).mode)

  useEffect(() => {
    // DEV: /objdev?i=<index>&ry=&rx= renders any object front-on, sway frozen.
    if (pathname === '/objdev') {
      const q = new URLSearchParams(window.location.search)
      worldState.freezeSway = true
      worldState.devRotY = parseFloat(q.get('ry') || '0')
      worldState.devRotX = parseFloat(q.get('rx') || '0')
      worldState.mode = 'service'
      worldState.slug = 'objdev'
      worldState.index = parseInt(q.get('i') || '0', 10)
      setMode('service')
      return
    }
    worldState.freezeSway = false
    const c = classifyRoute(pathname)
    worldState.mode = c.mode
    worldState.slug = c.slug
    worldState.index = c.index
    setMode(c.mode)
    // Returning to home resumes a frozen canvas; the scroll handler is gated to
    // home and may have missed the scroll-to-top event, so refresh it now (mode
    // is already set above) to put the object in the correct hero state.
    if (c.mode === 'home') window.dispatchEvent(new Event('scroll'))
  }, [pathname])

  // The object is on-screen on the home page AND on service pages (where it docks
  // into the hero slot). It's hidden + frozen only on routes with no object.
  const visible = mode === 'home' || mode === 'service'
  return (
    <>
      <div id="scene-atmosphere" aria-hidden="true" />
      <div id="canvas-container" className={visible ? '' : 'world-hidden'}>
        <Scene active={visible} mode={mode} />
      </div>
    </>
  )
}
