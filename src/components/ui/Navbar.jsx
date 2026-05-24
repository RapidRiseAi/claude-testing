import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const NAV_LINKS = ['Services', 'Work', 'About', 'Contact']

export default function Navbar({ loaded }) {
  const navRef = useRef()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!loaded) return
    gsap.fromTo(
      navRef.current,
      { y: -72, opacity: 0 },
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
        <span className="navbar-logo">Rapid Rise AI</span>
        <div className="navbar-links">
          {NAV_LINKS.map(l => (
            <a key={l} href="#" className="navbar-link">{l}</a>
          ))}
        </div>
        <button className="navbar-cta-btn">Get Started</button>
      </div>
    </nav>
  )
}
