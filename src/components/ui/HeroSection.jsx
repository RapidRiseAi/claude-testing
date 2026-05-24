import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function HeroSection({ loaded }) {
  const badgeRef   = useRef()
  const line1Ref   = useRef()
  const line2Ref   = useRef()
  const subRef     = useRef()
  const ctaRef     = useRef()

  useEffect(() => {
    if (!loaded) return
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl
      .from(badgeRef.current, { y: 22, opacity: 0, duration: 0.6 }, 0.0)
      .from(line1Ref.current, { y: 55, opacity: 0, duration: 0.85 }, 0.2)
      .from(line2Ref.current, { y: 55, opacity: 0, duration: 0.85 }, 0.36)
      .from(subRef.current,   { y: 28, opacity: 0, duration: 0.75 }, 0.55)
      .from(ctaRef.current,   { y: 18, opacity: 0, duration: 0.6  }, 0.72)
  }, [loaded])

  return (
    <section className="hero-section">
      <div className="hero-text">

        <div ref={badgeRef} className="hero-badge">
          <span className="badge-dot" />
          AI-Powered Infrastructure
        </div>

        <h1 className="hero-h1">
          <span ref={line1Ref} className="hero-h1-line">AI &amp; Software Solutions</span>
          <span ref={line2Ref} className="hero-h1-line hero-gradient">That Scale</span>
        </h1>

        <p ref={subRef} className="hero-sub">
          We don't just build websites, software, AI chatbots, integrations, and
          automations — we specialise in connecting everything through a scalable
          infrastructure, so your entire tech stack lives and grows as one
          unified ecosystem.
        </p>

        <div ref={ctaRef} className="hero-cta">
          <button
            className="btn-primary"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            View Our Work
            <svg className="btn-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

      </div>
    </section>
  )
}
