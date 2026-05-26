import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  useSpring,
} from 'framer-motion'
import { useEffect, useRef, useState, useCallback } from 'react'

/* ── Easing ───────────────────────────────────────────────────────────── */
const EXPO  = [0.16, 1, 0.30, 1]
const QUART = [0.25, 0.46, 0.45, 0.94]

/* ── Animation variants ───────────────────────────────────────────────── */
const panelV = {
  hidden:  { opacity: 0, y: 44, scale: 0.96, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0,  scale: 1,    filter: 'blur(0px)',
    transition: { duration: 1.0, ease: EXPO } },
}

const eyebrowV = {
  hidden:  { opacity: 0, x: -18 },
  visible: { opacity: 1, x: 0,
    transition: { duration: 0.65, delay: 0.22, ease: EXPO } },
}

const eyebrowLineV = {
  hidden:  { scaleX: 0 },
  visible: { scaleX: 1,
    transition: { duration: 0.55, delay: 0.15, ease: EXPO, originX: 0 } },
}

const lineV = {
  hidden:  { y: '108%' },
  visible: (i) => ({
    y: '0%',
    transition: { duration: 0.90, delay: 0.34 + i * 0.13, ease: EXPO },
  }),
}

const subV = {
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0,
    transition: { duration: 0.75, delay: 0.88, ease: QUART } },
}

const ctaV = {
  hidden:  { opacity: 0, y: 18, scale: 0.96 },
  visible: { opacity: 1, y: 0,  scale: 1,
    transition: { duration: 0.60, delay: 1.04, ease: EXPO } },
}

const statsV = {
  hidden:  { opacity: 0, y: 30, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1,
    transition: { duration: 0.75, delay: 1.18, ease: EXPO } },
}

/* ── Data ─────────────────────────────────────────────────────────────── */
const STATS = [
  { icon: 'projects',     num: 50,  unit: '+', label: 'Projects Delivered',  sub: 'Web, AI & integrations' },
  { icon: 'satisfaction', num: 100, unit: '%', label: 'Client Satisfaction',  sub: 'Across all engagements' },
  { icon: 'support',      num: 24,  unit: '/7', label: 'Support Available',  sub: 'Round-the-clock assistance' },
]

/* ── Icons ────────────────────────────────────────────────────────────── */
function StatIcon({ type }) {
  if (type === 'projects') return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M2 7.5l3.5 3.5 7.5-7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  if (type === 'satisfaction') return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M7.5 1.5l1.5 4.5H14l-3.8 2.8 1.5 4.5-3.7-2.7-3.7 2.7 1.5-4.5L2 6h5L7.5 1.5z" fill="currentColor"/>
    </svg>
  )
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M7.5 4.5v3.2l2 1.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

/* ── Magnetic CTA button ──────────────────────────────────────────────── */
function MagneticButton({ children, className, onClick }) {
  const ref  = useRef()
  const x    = useMotionValue(0)
  const y    = useMotionValue(0)
  const sx   = useSpring(x, { stiffness: 280, damping: 26 })
  const sy   = useSpring(y, { stiffness: 280, damping: 26 })

  const onMove = useCallback((e) => {
    const r  = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width  / 2)) * 0.32)
    y.set((e.clientY - (r.top  + r.height / 2)) * 0.32)
  }, [x, y])

  const onLeave = useCallback(() => { x.set(0); y.set(0) }, [x, y])

  return (
    <motion.button
      ref={ref}
      className={className}
      onClick={onClick}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.055 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      {children}
    </motion.button>
  )
}

/* ── Main component ───────────────────────────────────────────────────── */
export default function HeroSection({ loaded }) {
  const controls   = useAnimation()
  const panelRef   = useRef()

  /* Panel 3-D tilt on mouse */
  const mX  = useMotionValue(0)
  const mY  = useMotionValue(0)
  const rX  = useSpring(useTransform(mY, [-0.5, 0.5], [ 3.5, -3.5]), { stiffness: 140, damping: 22 })
  const rY  = useSpring(useTransform(mX, [-0.5, 0.5], [-3.5,  3.5]), { stiffness: 140, damping: 22 })

  const onPanelMove  = useCallback((e) => {
    const r = panelRef.current?.getBoundingClientRect()
    if (!r) return
    mX.set((e.clientX - r.left) / r.width  - 0.5)
    mY.set((e.clientY - r.top)  / r.height - 0.5)
  }, [mX, mY])
  const onPanelLeave = useCallback(() => { mX.set(0); mY.set(0) }, [mX, mY])

  /* Count-up numbers */
  const [counts, setCounts] = useState([0, 0, 0])

  useEffect(() => {
    if (!loaded) return
    controls.start('visible')

    const id = setTimeout(() => {
      STATS.forEach(({ num }, i) => {
        const FRAMES = 55
        let f = 0
        const tick = () => {
          f++
          const t = f / FRAMES
          const eased = 1 - Math.pow(1 - t, 3)
          setCounts(prev => {
            const n = [...prev]
            n[i] = Math.round(eased * num)
            return n
          })
          if (f < FRAMES) requestAnimationFrame(tick)
        }
        setTimeout(() => requestAnimationFrame(tick), i * 90)
      })
    }, 1500)

    return () => clearTimeout(id)
  }, [loaded, controls])

  return (
    <section className="hero-section">

      <div className="hero-ghost" aria-hidden="true">RR</div>

      {/* ── Glass panel with 3-D tilt ─────────────────────────────────── */}
      <div className="panel-perspective-wrap">
        <motion.div
          ref={panelRef}
          className="hero-panel"
          variants={panelV}
          initial="hidden"
          animate={controls}
          style={{ rotateX: rX, rotateY: rY }}
          onMouseMove={onPanelMove}
          onMouseLeave={onPanelLeave}
        >
          {/* sweeping shimmer light */}
          <div className="panel-shimmer" aria-hidden="true" />

          {/* eyebrow */}
          <motion.div
            className="hero-eyebrow"
            variants={eyebrowV}
            initial="hidden"
            animate={controls}
          >
            <motion.span
              className="eyebrow-rule"
              variants={eyebrowLineV}
              initial="hidden"
              animate={controls}
              aria-hidden="true"
            />
            Connected Intelligence. Real Business Impact.
          </motion.div>

          {/* headline — clip-reveal per line */}
          <h1 className="hero-h1">
            {[
              { text: 'AI, Software, and', cls: 'h1-bold' },
              { text: 'Connected Systems', cls: 'h1-bold' },
            ].map(({ text, cls }, i) => (
              <span key={i} className="h1-clip">
                <motion.span
                  className={`h1-line ${cls}`}
                  custom={i}
                  variants={lineV}
                  initial="hidden"
                  animate={controls}
                >{text}</motion.span>
              </span>
            ))}
            <span className="h1-clip">
              <motion.span
                className="h1-line h1-accent"
                custom={2}
                variants={lineV}
                initial="hidden"
                animate={controls}
              >Built for Growth</motion.span>
            </span>
          </h1>

          {/* sub copy */}
          <motion.p
            className="hero-sub"
            variants={subV}
            initial="hidden"
            animate={controls}
          >
            We build intelligent software, AI systems, and seamless integrations
            that help modern businesses move faster, operate smarter,
            and scale without limits.
          </motion.p>

          {/* CTA */}
          <motion.div
            className="hero-cta"
            variants={ctaV}
            initial="hidden"
            animate={controls}
          >
            <MagneticButton
              className="btn-primary"
              onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            >
              View Our Work
              <svg className="btn-arrow" width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M2 7.5h11M8 3l4.5 4.5L8 12" stroke="currentColor"
                  strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </MagneticButton>
          </motion.div>

        </motion.div>
      </div>

      {/* ── Stats glass strip — beneath the orb ───────────────────────── */}
      <motion.div
        className="hero-stats"
        variants={statsV}
        initial="hidden"
        animate={controls}
      >
        {/* shimmer */}
        <div className="panel-shimmer panel-shimmer--stats" aria-hidden="true" />

        {STATS.map((s, i) => (
          <div key={i} className="stat">
            {i > 0 && <div className="stat-divider" aria-hidden="true" />}
            <motion.div
              className="stat-icon-wrap"
              whileHover={{ scale: 1.15, rotate: 8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            >
              <StatIcon type={s.icon} />
            </motion.div>
            <div className="stat-content">
              <span className="stat-num">
                {counts[i]}<span className="stat-unit">{s.unit}</span>
              </span>
              <span className="stat-label">{s.label}</span>
              <span className="stat-sub">{s.sub}</span>
            </div>
          </div>
        ))}
      </motion.div>

    </section>
  )
}
