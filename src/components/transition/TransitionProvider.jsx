import {
  createContext, useContext, useCallback, useEffect, useMemo, useRef, useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import TransitionCanvas from './TransitionCanvas'
import { transitionState, resetTransitionProgress } from './transitionState'
import {
  resolveRoute, isMorphPair, objectScreenAnchor, internalPath,
} from './objectAnchors'
import './transition.css'

/* ── Feel / timing ────────────────────────────────────────────────────────────
   Everything that shapes the character of the transition lives here. Durations
   are in seconds; the whole morph is ~2.0s on desktop (slightly shorter + fewer
   orbs on mobile). These are the knobs to dial.                                 */
const FEEL = {
  flyup: 0.70,        // service→x: scroll-to-top "fly up" before the morph
  gather: 0.80,       // object shape → centre sphere
  suck: 1.20,         // black hole: page disintegrates into particles + is pulled in
  explode: 0.90,      // cinematic burst outward, hero blooms from centre
  reassemble: 1.25,   // particles slowly pulled back into the destination object
  handoff: 0.45,      // overlay orbs fade out as the real object fades in
  navAt: 0.62,        // fraction through SUCK at which the route actually swaps
  scrimPeak: 0.95,    // darkest the black-hole vignette gets
  fade: 0.34,         // out-of-scope cross-fade (no orbs)
}

const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t)
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
const easeInCubic = (t) => t * t * t

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* Parse a CSS rgb/rgba() string → [r,g,b] (0–255), or null if ~transparent. */
function parseColor(str) {
  const m = str && str.match(/rgba?\(([^)]+)\)/)
  if (!m) return null
  const p = m[1].split(',').map((s) => parseFloat(s))
  if (p.length >= 4 && p[3] < 0.06) return null
  return [p[0] || 0, p[1] || 0, p[2] || 0]
}

/* Snapshot the source page's visible content as a set of coloured rectangles, so
   the swarm can spawn its particles FROM the real elements (the page visibly
   disintegrates into particles rather than a generic field). Particles are later
   distributed across these weighted by area, tinted by each element's colour. */
function scanPageCells() {
  const root = document.getElementById('route-stage') || document.body
  const els = root.querySelectorAll(
    'h1,h2,h3,h4,p,a,button,img,li,span,.kicker,[class*="card"],[class*="btn"],[class*="title"]',
  )
  const vw = window.innerWidth, vh = window.innerHeight
  const cells = []
  els.forEach((el) => {
    if (el.children.length > 3) return // skip big containers; their children carry the detail
    const r = el.getBoundingClientRect()
    const x = Math.max(0, r.left), y = Math.max(0, r.top)
    const w = Math.min(vw, r.right) - x, h = Math.min(vh, r.bottom) - y
    if (w < 8 || h < 8 || w > vw * 0.98) return
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || +cs.opacity < 0.05) return
    let c = parseColor(cs.color) || [180, 215, 255]
    // Lift dark text so additive particles stay visible; nudge toward the palette.
    const lum = (c[0] + c[1] + c[2]) / 3
    if (lum < 90) c = [120, 180, 245]
    cells.push({ x, y, w, h, area: w * h, r: c[0], g: c[1], b: c[2] })
  })
  // Cap to the largest ~180 by area so we cover the visible mass without bloat.
  cells.sort((a, b) => b.area - a.area)
  return cells.slice(0, 180)
}

const TransitionCtx = createContext(null)
export const useTransition = () => useContext(TransitionCtx)

export default function TransitionProvider({ children }) {
  const navigate = useNavigate()
  const [active, setActive] = useState(false)   // flips the overlay canvas on

  const stageRef = useRef(null)
  const scrimRef = useRef(null)
  const rafRef = useRef(null)
  const runningRef = useRef(false)

  const isMobile = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches,
    [],
  )
  const maxCount = isMobile ? 4200 : 13824
  const speed = isMobile ? 0.82 : 1   // shrink the timeline a touch on phones

  /* ── DOM writers (no React state in the hot path) ─────────────────────────── */
  const setStage = useCallback((scale, opacity, blurPx, originY) => {
    const el = stageRef.current
    if (!el) return
    if (originY != null) el.style.transformOrigin = `50% ${originY}px`
    el.style.transform = scale === 1 && opacity === 1 ? '' : `scale(${scale})`
    el.style.opacity = String(opacity)
    el.style.filter = blurPx > 0.05 ? `blur(${blurPx}px)` : ''
  }, [])

  const clearStage = useCallback(() => {
    const el = stageRef.current
    if (!el) return
    el.style.transform = ''
    el.style.opacity = ''
    el.style.filter = ''
    el.style.transformOrigin = ''
  }, [])

  const setScrim = useCallback((opacity) => {
    const el = scrimRef.current
    if (el) el.style.opacity = String(opacity)
  }, [])

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    runningRef.current = false
    transitionState.phase = 'idle'
    transitionState.active = false
    transitionState.srcAnchor = null
    transitionState.dstAnchor = null
    resetTransitionProgress()
    setScrim(0)
    clearStage()
    document.body.classList.remove('rr-transitioning')
    setActive(false)
  }, [clearStage, setScrim])

  /* ── The full black-hole morph ────────────────────────────────────────────── */
  const startMorph = useCallback((path, toPathname, from, to) => {
    runningRef.current = true
    document.body.classList.add('rr-transitioning')

    transitionState.fromIndex = from.index
    transitionState.toIndex = to.index
    transitionState.srcAnchor = objectScreenAnchor(from)   // measured now (source live)
    transitionState.dstAnchor = null                        // measured at reassemble
    transitionState.pageCells = scanPageCells()             // capture the source page NOW
    transitionState.swarmSeedId++                           // tell the canvas to respawn the swarm
    resetTransitionProgress()
    transitionState.active = true
    setActive(true)

    const doFly = from.kind === 'service' && window.scrollY > 4
    const startScrollY = window.scrollY

    const Tf = (doFly ? FEEL.flyup : 0) * speed
    const Dg = FEEL.gather * speed
    const Ds = FEEL.suck * speed
    const De = FEEL.explode * speed
    const Dr = FEEL.reassemble * speed
    const gStart = Tf
    const sStart = gStart + Dg
    const eStart = sStart + Ds
    const rStart = eStart + De
    const rEnd = rStart + Dr
    const navTime = sStart + Ds * FEEL.navAt
    // viewport-centre origin in page coords, captured for the implosion.
    const suckOriginY = startScrollY + window.innerHeight / 2

    let navigated = false
    let measuredDst = false
    const t0 = performance.now()

    const frame = (now) => {
      const t = (now - t0) / 1000

      // 0 — FLY UP: ease the page to the top with a slight upward, blurred rush.
      if (t < Tf) {
        transitionState.phase = 'flyup'
        const f = easeInOutCubic(clamp01(t / Tf))
        window.scrollTo(0, Math.round(startScrollY * (1 - f)))
        setStage(1, 1, 2.5 * f, window.innerHeight / 2)
        stageRef.current && (stageRef.current.style.transform = `translateY(${-26 * f}px)`)
      } else if (stageRef.current && t >= Tf && transitionState.phase === 'flyup') {
        stageRef.current.style.transform = ''
        stageRef.current.style.filter = ''
      }

      // Phase progress (each ramps then holds — the shader mixes them in order).
      const gather = easeOutCubic(clamp01((t - gStart) / Dg))
      const suck = easeInOutCubic(clamp01((t - sStart) / Ds))
      const explode = easeOutCubic(clamp01((t - eStart) / De))
      const reassemble = easeInOutCubic(clamp01((t - rStart) / Dr))

      transitionState.gather = gather
      transitionState.suck = suck
      transitionState.explode = explode
      transitionState.reassemble = reassemble
      if (t >= gStart && t < sStart) transitionState.phase = 'gather'
      else if (t >= sStart && t < eStart) transitionState.phase = 'suck'
      else if (t >= eStart && t < rStart) transitionState.phase = 'explode'
      else if (t >= rStart) transitionState.phase = 'reassemble'

      // Orb opacity: fade in over the first part of gather, out over the handoff tail.
      const fadeIn = clamp01((t - gStart) / (Dg * 0.6))
      const fadeOut = clamp01((rEnd - t) / FEEL.handoff)
      transitionState.opacity = Math.min(fadeIn, fadeOut)

      // Black-hole scrim: rises with the suck (page → black hole), then CLEARS
      // across the burst so the explosion reveals the new page on its way in.
      const scrimClear = easeInOutCubic(clamp01((t - eStart) / (De + Dr * 0.3)))
      setScrim(FEEL.scrimPeak * easeOutCubic(suck) * (1 - scrimClear))

      const el = stageRef.current
      if (t < sStart) {
        // gather: page still fully visible beneath the gathering orbs
      } else if (t < eStart) {
        // SUCK: the page is STRETCHED into the singularity (spaghettification) and
        // dissolves into the swarm — squeezed thin toward centre + heavy blur, gone
        // by ~45% of the suck. The element-sourced swarm carries it into the sphere.
        const ss = suck
        const dissolve = easeOutCubic(clamp01(ss / 0.45))
        const pull = easeInCubic(clamp01(ss / 0.62))
        const sx = 1 - 0.62 * pull          // squeeze horizontally toward the hole
        const sy = 1 - 0.14 * pull          // keep height → reads as a vertical stretch
        if (el) {
          el.style.transformOrigin = `50% ${suckOriginY}px`
          el.style.transform = `scale(${sx}, ${sy})`
          el.style.opacity = String(1 - dissolve)
          el.style.filter = dissolve > 0.02 ? `blur(${10 * dissolve}px)` : ''
        }
      } else {
        // BUILD: the page simply APPEARS (pure opacity, NO growing box) as the burst
        // erupts and the scrim lifts — the explosion reveals the page. The orbs then
        // reassemble into the object on top of it.
        const appear = easeOutCubic(clamp01((t - eStart) / (De * 0.85)))
        if (el) {
          el.style.transform = ''
          el.style.filter = ''
          el.style.transformOrigin = ''
          el.style.opacity = String(appear)
        }
      }

      // Swap the route under the mask (scrim near peak, page imploded).
      if (!navigated && t >= navTime) {
        navigated = true
        navigate(path)
      }

      // Measure the destination object's TRUE on-screen spot once it has mounted.
      // Must neutralise the stage's bloom transform first — getBoundingClientRect
      // reports the transformed rect, which would land the orbs near centre.
      if (navigated && !measuredDst && t >= eStart) {
        measuredDst = true
        const el = stageRef.current
        const pt = el?.style.transform, pf = el?.style.filter
        if (el) { el.style.transform = 'none'; el.style.filter = 'none' }
        transitionState.dstAnchor = objectScreenAnchor(to)   // forces a reflow at scale 1
        if (el) { el.style.transform = pt; el.style.filter = pf }
      }

      if (t >= rEnd) { cleanup(); return }
      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)
  }, [navigate, setStage, setScrim, cleanup, speed])

  /* ── Out-of-scope fast cross-fade (no orbs) ───────────────────────────────── */
  const startFade = useCallback((path) => {
    runningRef.current = true
    const Fo = FEEL.fade * 0.5
    const Fi = FEEL.fade * 0.5
    let navigated = false
    const t0 = performance.now()
    const frame = (now) => {
      const t = (now - t0) / 1000
      if (t < Fo) {
        const k = easeInCubic(clamp01(t / Fo))
        setStage(1 - 0.04 * k, 1 - k, 3 * k, window.scrollY + window.innerHeight / 2)
      } else {
        if (!navigated) { navigated = true; navigate(path) }
        const k = easeOutCubic(clamp01((t - Fo) / Fi))
        setStage(0.96 + 0.04 * k, k, 3 * (1 - k), window.innerHeight / 2)
      }
      if (t >= Fo + Fi) { runningRef.current = false; clearStage(); return }
      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)
  }, [navigate, setStage, clearStage])

  /* ── Public trigger (also used by the global click interceptor) ───────────── */
  const transitionTo = useCallback((path) => {
    if (runningRef.current) return
    const toPathname = (() => {
      try { return new URL(path, window.location.origin).pathname } catch { return path }
    })()
    const from = resolveRoute(window.location.pathname)
    const to = resolveRoute(toPathname)
    if (prefersReduced()) { navigate(path); return }
    if (isMorphPair(from, to)) startMorph(path, toPathname, from, to)
    else startFade(path)
  }, [navigate, startMorph, startFade])

  /* One capture-phase listener intercepts every internal <a> (current + future
     links) without wrapping each <Link>. */
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = e.target.closest && e.target.closest('a[href]')
      if (!a) return
      const path = internalPath(a)
      if (!path) return
      const toPathname = new URL(path, window.location.origin).pathname
      if (toPathname === window.location.pathname && !path.includes('?')) return
      e.preventDefault()
      if (runningRef.current) return
      transitionTo(path)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [transitionTo])

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  const ctx = useMemo(() => ({ transitionTo }), [transitionTo])

  return (
    <TransitionCtx.Provider value={ctx}>
      <div id="route-stage" ref={stageRef}>{children}</div>
      <div className="transition-scrim" ref={scrimRef} aria-hidden="true" />
      <TransitionCanvas active={active} maxCount={maxCount} />
    </TransitionCtx.Provider>
  )
}
