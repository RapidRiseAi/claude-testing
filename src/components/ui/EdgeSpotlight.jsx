import { useEffect, useRef } from 'react'

/* Cursor-following ambient glow. A single soft radial light that rides directly
   behind the pointer and EASES toward it every frame, so it glides continuously
   across the whole page instead of jumping between sections. One full-viewport
   element in one coordinate space (not a per-card spot), screen-blended so it
   reads as light over anything and never hurts legibility.

   Gated to fine pointers (desktop mice). Under prefers-reduced-motion it still
   appears but tracks the cursor instantly (no easing/animation loop). The element
   is pointer-events:none, so it never intercepts clicks. */
export default function EdgeSpotlight() {
  const ref = useRef(null)

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // target = real cursor; (x, y) = eased glow centre that chases it.
    let tx = window.innerWidth / 2
    let ty = window.innerHeight / 2
    let x = tx
    let y = ty
    let raf = 0
    let shown = false

    const place = () => { el.style.transform = `translate3d(${x}px, ${y}px, 0)` }

    const loop = () => {
      // Critically-damped-feeling chase: ~0.16 per frame trails on fast moves,
      // snaps shut when the pointer rests. Stop the loop once it has caught up.
      x += (tx - x) * 0.16
      y += (ty - y) * 0.16
      place()
      if (Math.abs(tx - x) > 0.4 || Math.abs(ty - y) > 0.4) {
        raf = requestAnimationFrame(loop)
      } else {
        x = tx; y = ty; place()
        raf = 0
      }
    }

    const onMove = (e) => {
      tx = e.clientX
      ty = e.clientY
      if (!shown) {
        shown = true
        // First sighting: drop the glow straight under the cursor, then fade in.
        x = tx; y = ty; place()
        el.style.opacity = '1'
      }
      if (reduce) { x = tx; y = ty; place(); return }
      if (!raf) raf = requestAnimationFrame(loop)
    }

    // Hide when the pointer leaves the window entirely (relatedTarget null).
    const onOut = (e) => {
      if (!e.relatedTarget && !e.toElement) {
        shown = false
        el.style.opacity = '0'
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerout', onOut, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerout', onOut)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <div ref={ref} className="cursor-spotlight" aria-hidden="true" />
}
