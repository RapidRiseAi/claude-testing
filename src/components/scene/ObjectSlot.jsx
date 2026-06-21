import { useEffect, useRef } from 'react'
import { worldState } from './worldState'

/* An "object slot": a DOM box a page declares to say "the shared 3-D object
   belongs HERE." It publishes its live screen rect (centre + size, CSS px) into
   worldState.slot every frame; the persistent object reads that and docks itself
   onto the slot. Clears the slot on unmount so the object knows to leave.

   Renders as a plain box (with whatever className the page's layout expects) so
   it occupies the same space the old per-page object did. */
export default function ObjectSlot({ className = '', children = null }) {
  const ref = useRef(null)

  useEffect(() => {
    let raf = 0
    const publish = () => {
      const el = ref.current
      if (el) {
        const r = el.getBoundingClientRect()
        worldState.slot = {
          x: r.left + r.width / 2,
          y: r.top + r.height / 2,
          w: r.width,
          h: r.height,
        }
      }
      raf = requestAnimationFrame(publish)
    }
    raf = requestAnimationFrame(publish)
    return () => {
      cancelAnimationFrame(raf)
      worldState.slot = null
    }
  }, [])

  return (
    <div ref={ref} className={className} aria-hidden="true">
      {children}
    </div>
  )
}
