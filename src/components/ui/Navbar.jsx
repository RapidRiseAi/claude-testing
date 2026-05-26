import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const NAV_LINKS = ['Services', 'Work', 'About', 'Contact']

function RRMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" className="navbar-rr-mark" aria-hidden="true">
      <rect width="30" height="30" rx="7" fill="url(#navbar-rr-g)"/>
      <text x="4" y="21" fontFamily="Inter, system-ui, sans-serif" fontSize="14" fontWeight="800" fill="white" letterSpacing="-0.5">RR</text>
      <defs>
        <linearGradient id="navbar-rr-g" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1055cc"/>
          <stop offset="1" stopColor="#0da8ec"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function Navbar({ loaded }) {
  const navRef = useRef()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!loaded) return
    gsap.fromTo(
      navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.75, delay: 0.1, ease: 'power3.out' }
    )
  }, [loaded])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav ref={navRef} className={`navbar${scrolled ? ' navbar--scrolled' : ''}`} style={{ opacity: 0 }}>
      <div className="navbar-inner">
        <div className="navbar-brand">
          <RRMark />
          <span className="navbar-logo">Rapid Rise AI</span>
        </div>
        <div className="navbar-links">
          {NAV_LINKS.map(l => (
            <a key={l} href="#" className="navbar-link">{l}</a>
          ))}
        </div>
        <button className="navbar-cta-btn">
          Request a Quote
          <svg className="navbar-cta-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </nav>
  )
}
