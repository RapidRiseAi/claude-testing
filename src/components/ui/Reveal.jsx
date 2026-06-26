import { motion, useReducedMotion } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

/* Scroll entrance with real 3D depth. Elements rise and rotate in from
   perspective (rotateX/rotateY + scale), so scrolling feels like moving through
   a space rather than sliding a flat list up. Expo-out, matching the home page.
   `variant`: 'up' | 'left' | 'right' | 'scale' | 'blur' | 'depth'. Reduced
   motion renders children immediately with no transform. */

const EXPO = [0.16, 1, 0.3, 1]

/* The reveal rule (below-hero content, whole site):
   - Trigger line = 15% of the viewport HEIGHT, measured up from the bottom. We
     compute it in PIXELS from the live viewport and feed a native
     IntersectionObserver (threshold 0) — framer-motion's whileInView/useInView
     did NOT honour a `%` margin reliably (it behaved like ~50% on mobile), so we
     drive the trigger ourselves. An element reveals the moment its TOP edge
     crosses that line, identically on any screen size / aspect ratio.
   - On a fresh page, content already above the line eases in ~1s after the page
     opens (no scroll needed) so pages never look empty; content reached later by
     scrolling reveals immediately (the 1s window has already elapsed). */
const INITIAL_REVEAL_DELAY = 1 // seconds
const TRIGGER_FRACTION = 0.15  // bottom 15% of the viewport height

const VARIANTS = {
  up:    { hidden: { opacity: 0, y: 46, rotateX: 7, scale: 0.965 }, show: { opacity: 1, y: 0, rotateX: 0, scale: 1 } },
  left:  { hidden: { opacity: 0, x: -58, rotateY: -9, scale: 0.97 }, show: { opacity: 1, x: 0, rotateY: 0, scale: 1 } },
  right: { hidden: { opacity: 0, x: 58, rotateY: 9, scale: 0.97 },   show: { opacity: 1, x: 0, rotateY: 0, scale: 1 } },
  scale: { hidden: { opacity: 0, scale: 0.85, y: 34 },               show: { opacity: 1, scale: 1, y: 0 } },
  blur:  { hidden: { opacity: 0, y: 32, filter: 'blur(14px)' },      show: { opacity: 1, y: 0, filter: 'blur(0px)' } },
  depth: { hidden: { opacity: 0, y: 80, rotateX: 18, scale: 0.84 },  show: { opacity: 1, y: 0, rotateX: 0, scale: 1 } },
}

export default function Reveal({
  children,
  className = '',
  variant = 'up',
  delay = 0,
  duration = 0.85,
  // Kept for API compatibility — the trigger is the bottom-15% line (top edge),
  // not a % of the element, so this is intentionally unused.
  amount = 0.3,
  as = 'div',
  style,
  // Animate on MOUNT instead of on-scroll for phone-width horizontal scrollers —
  // off-screen-right cards never enter the viewport there, so on-scroll would
  // leave them hidden until swiped. Desktop keeps the normal scroll reveal.
  instantOnMobile = false,
  ...rest
}) {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  // Captured at mount ≈ the page's open time (every Reveal mounts with the page).
  const mountedAt = useRef(null)
  if (mountedAt.current === null) {
    mountedAt.current = typeof performance !== 'undefined' ? performance.now() : 0
  }
  // null while hidden; once revealed it holds the transition delay that was used.
  const [revealDelay, setRevealDelay] = useState(null)

  const instant = instantOnMobile && typeof window !== 'undefined'
    && window.matchMedia && window.matchMedia('(max-width: 760px)').matches

  useEffect(() => {
    if (reduce || revealDelay !== null) return

    const fire = () => {
      const now = typeof performance !== 'undefined' ? performance.now() : 0
      const since = (now - mountedAt.current) / 1000
      // ~1s on the first screenful; ~0 once you've scrolled (1s has passed).
      setRevealDelay(Math.max(0, INITIAL_REVEAL_DELAY - since) + delay)
    }

    if (instant) { fire(); return }

    const el = ref.current
    if (!el) return

    let io
    const observe = () => {
      io?.disconnect()
      const bottomPx = Math.round((window.innerHeight || 0) * TRIGGER_FRACTION)
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) { io.disconnect(); fire() }
        },
        { threshold: 0, rootMargin: `0px 0px -${bottomPx}px 0px` },
      )
      io.observe(el)
    }
    observe()
    // Recompute the px line if the viewport changes (rotation, mobile toolbar).
    window.addEventListener('resize', observe)
    return () => { io?.disconnect(); window.removeEventListener('resize', observe) }
  }, [reduce, instant, delay, revealDelay])

  if (reduce) {
    const Tag = as
    return <Tag className={className} style={style} {...rest}>{children}</Tag>
  }

  const MotionTag = motion[as] ?? motion.div
  const show = revealDelay !== null

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial="hidden"
      animate={show ? 'show' : 'hidden'}
      variants={VARIANTS[variant] ?? VARIANTS.up}
      transition={{ duration, delay: show ? revealDelay : 0, ease: EXPO }}
      style={{ transformPerspective: 1200, ...style }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}
