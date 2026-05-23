import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function HeroSection() {
  const headingRef = useRef()
  const subRef = useRef()
  const ctaRef = useRef()
  const badgeRef = useRef()

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.from(badgeRef.current, { y: 20, opacity: 0, duration: 0.7, delay: 0.5 })
      .from(headingRef.current, { y: 50, opacity: 0, duration: 0.9 }, '-=0.3')
      .from(subRef.current, { y: 25, opacity: 0, duration: 0.8 }, '-=0.5')
      .from(ctaRef.current, { y: 15, opacity: 0, duration: 0.6 }, '-=0.4')
  }, [])

  return (
    <section className="hero-section">
      <div className="hero-text">
        <div ref={badgeRef} className="hero-badge">
          <span className="badge-dot" />
          Ecosystem Intelligence
        </div>

        <h1 ref={headingRef}>
          Every Tool.<br />
          <span className="hero-gradient">One Network.</span>
        </h1>

        <p ref={subRef}>
          An interconnected ecosystem where your analytics, integrations,
          automation, and AI work as a single intelligent system.
        </p>

        <div ref={ctaRef} className="hero-cta">
          <button
            className="btn-primary"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            Explore the Platform
          </button>
          <button className="btn-ghost">View Services</button>
        </div>
      </div>
    </section>
  )
}
