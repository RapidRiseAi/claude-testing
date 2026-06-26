import { motion, useReducedMotion, useInView } from 'framer-motion'
import { useRef } from 'react'

/* Scroll entrance with real 3D depth. Elements rise and rotate in from
   perspective (rotateX/rotateY + scale), so scrolling feels like moving through
   a space rather than sliding a flat list up. Expo-out, matching the home page.
   `variant`: 'up' | 'left' | 'right' | 'scale' | 'blur' | 'depth'. Reduced
   motion renders children immediately with no transform. */

const EXPO = [0.16, 1, 0.3, 1]

/* The reveal rule (whole site):
   - Trigger line = 15% of the viewport height, measured up from the BOTTOM. An
     element reveals the moment its TOP edge crosses that line. The line is
     viewport-relative, so it lands in the same spot on any screen / aspect ratio.
   - On a fresh page, anything already above the line eases in ~1s after the page
     opens — WITHOUT needing a scroll — so a page never looks empty (which made
     people leave). Anything below the line waits until a scroll brings its top
     across the line, and reveals with no extra delay. */
const INITIAL_REVEAL_DELAY = 1 // seconds

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
  // Kept for API compatibility — the trigger is now the bottom-15% line (top
  // edge), not a % of the element, so a fixed `amount` is intentionally unused.
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
  const startDelay = useRef(null)
  // Fire the instant the element's TOP edge crosses the bottom-15% line. `amount:
  // 'some'` (any pixel) keeps even very tall blocks reachable.
  const inView = useInView(ref, { once: true, amount: 'some', margin: '0px 0px -15% 0px' })

  if (reduce) {
    const Tag = as
    return <Tag className={className} style={style} {...rest}>{children}</Tag>
  }

  const MotionTag = motion[as] ?? motion.div
  const instant = instantOnMobile && typeof window !== 'undefined'
    && window.matchMedia && window.matchMedia('(max-width: 760px)').matches
  const show = instant || inView

  // Resolve the reveal delay ONCE, the first frame this element is shown. Shown on
  // load → ~1s; shown later via scroll → the 1s window has already elapsed → 0.
  if (show && startDelay.current === null) {
    const since = (mountedAt.current ? performance.now() - mountedAt.current : 0) / 1000
    startDelay.current = Math.max(0, INITIAL_REVEAL_DELAY - since) + delay
  }
  const transitionDelay = startDelay.current ?? delay

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial="hidden"
      animate={show ? 'show' : 'hidden'}
      variants={VARIANTS[variant] ?? VARIANTS.up}
      transition={{ duration, delay: transitionDelay, ease: EXPO }}
      style={{ transformPerspective: 1200, ...style }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}
