import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const STATS = [
  {
    icon: 'projects',
    num: '50', unit: '+',
    label: 'Projects Delivered',
    sub: 'Web, AI & integrations',
  },
  {
    icon: 'satisfaction',
    num: '100', unit: '%',
    label: 'Client Satisfaction',
    sub: 'Across all engagements',
  },
  {
    icon: 'support',
    num: '24', unit: '/7',
    label: 'Support Available',
    sub: 'Round-the-clock assistance',
  },
]

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

export default function HeroSection({ loaded }) {
  const h1Ref    = useRef()
  const subRef   = useRef()
  const ctaRef   = useRef()
  const statsRef = useRef()

  useEffect(() => {
    if (!loaded) return
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl
      .from(Array.from(h1Ref.current.children),  { y: 80, opacity: 0, duration: 0.95, stagger: 0.12 }, 0.00)
      .from(subRef.current,                      { y: 28, opacity: 0, duration: 0.72 },                0.55)
      .from(Array.from(ctaRef.current.children), { y: 18, opacity: 0, duration: 0.52, stagger: 0.09 }, 0.70)
      .from(statsRef.current,                    { y: 24, opacity: 0, duration: 0.60 },                0.84)
  }, [loaded])

  return (
    <section className="hero-section">

      <div className="hero-ghost" aria-hidden="true">RR</div>
      <div className="hero-glass-panel" aria-hidden="true" />

      <div className="hero-text">

        <h1 ref={h1Ref} className="hero-h1">
          <span className="h1-line h1-bold">Connected AI &amp;</span>
          <span className="h1-line h1-bold">Software Systems</span>
          <span className="h1-line h1-accent">Built to Scale</span>
        </h1>

        <p ref={subRef} className="hero-sub">
          We build websites, software, AI assistants, automations, and integrations
          that work together as one connected ecosystem to help your business grow
          with more control.
        </p>

        <div ref={ctaRef} className="hero-cta">
          <button
            className="btn-primary"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            View Our Work
            <svg className="btn-arrow" width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M2 7.5h11M8 3l4.5 4.5L8 12" stroke="currentColor"
                strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="btn-ghost">
            <span className="btn-play-icon">
              <svg width="9" height="11" viewBox="0 0 9 11" fill="none">
                <path d="M1.5 1.5l6.5 4-6.5 4V1.5z" fill="currentColor" stroke="currentColor" strokeWidth="0.6" strokeLinejoin="round"/>
              </svg>
            </span>
            Watch Demo
          </button>
        </div>

      </div>

      <div ref={statsRef} className="hero-stats">
        {STATS.map((s, i) => (
          <div key={i} className="stat">
            {i > 0 && <div className="stat-divider" aria-hidden="true" />}
            <div className="stat-icon-wrap">
              <StatIcon type={s.icon} />
            </div>
            <div className="stat-content">
              <span className="stat-num">
                {s.num}<span className="stat-unit">{s.unit}</span>
              </span>
              <span className="stat-label">{s.label}</span>
              <span className="stat-sub">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

    </section>
  )
}
