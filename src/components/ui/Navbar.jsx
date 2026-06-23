import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { FIXED_PRICE, CUSTOM_SERVICES } from '../../data/services'

/* ── Line icons (24×24, round caps) — one per service slug ──────────────────── */
const I = {
  window: <><rect x="3" y="4.5" width="18" height="15" rx="2.4" /><path d="M3 8.5h18M6.5 6.4h.01" /></>,
  portal: <><circle cx="12" cy="8.5" r="3.4" /><path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" /></>,
  chart: <><path d="M5 20.5v-6M12 20.5v-11M19 20.5V7" /></>,
  chat: <><path d="M20 13.4a2.4 2.4 0 0 1-2.4 2.4H9l-4.5 3.3.02-3.3A2.4 2.4 0 0 1 4 13.4V7.6a2.4 2.4 0 0 1 2.4-2.4h11.2A2.4 2.4 0 0 1 20 7.6z" /></>,
  code: <><path d="m8.5 7.5-4.5 4.5 4.5 4.5M15.5 7.5l4.5 4.5-4.5 4.5" /></>,
  app: <><rect x="7" y="2.5" width="10" height="19" rx="2.4" /><path d="M11 18.5h2" /></>,
  bolt: <><path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12z" /></>,
  nodes: <><circle cx="6" cy="6" r="2.2" /><circle cx="18" cy="8" r="2.2" /><circle cx="9" cy="18" r="2.2" /><path d="M7.8 7.4 16 8M7.4 16.2 8 7.9M10.8 17l5.6-7.4" /></>,
  spark: <><path d="M12 4.5 13.6 10 19 11.5 13.6 13 12 18.5 10.4 13 5 11.5 10.4 10z" /></>,
  chip: <><rect x="7" y="7" width="10" height="10" rx="2" /><path d="M10 3.5v2M14 3.5v2M10 18.5v2M14 18.5v2M3.5 10h2M3.5 14h2M18.5 10h2M18.5 14h2" /></>,
  trend: <><path d="M3.5 16.5 9 11l3.5 3.5L20.5 6.5" /><path d="M15.5 6.5h5v5" /></>,
}
const SERVICE_ICONS = {
  'website-development': I.window,
  'client-portal': I.portal,
  'smart-dashboards': I.chart,
  'ai-communication-agent': I.chat,
  'software-development': I.code,
  'web-app-development': I.app,
  'automated-workflow': I.bolt,
  'ecosystems': I.nodes,
  'ai-implementation': I.spark,
  'iot-development': I.chip,
  'marketing-seo': I.trend,
}
function ServiceIcon({ slug }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {SERVICE_ICONS[slug] ?? I.spark}
    </svg>
  )
}

function DropdownItem({ s }) {
  return (
    <Link to={`/services/${s.slug}`} className="nav-dd-item">
      <span className="nav-dd-ic"><ServiceIcon slug={s.slug} /></span>
      <span className="nav-dd-text">
        <span className="nav-dd-name">{s.name}</span>
        <span className="nav-dd-tag">{s.tagline}</span>
      </span>
    </Link>
  )
}

function ServicesDropdown() {
  return (
    <div className="nav-dropdown" role="menu">
      <div className="nav-dd-glow" aria-hidden="true" />
      <div className="nav-dd-cols">
        <div className="nav-dd-col">
          <div className="nav-dd-heading">Fixed Price Products</div>
          <div className="nav-dd-list">
            {FIXED_PRICE.map((s) => <DropdownItem key={s.slug} s={s} />)}
          </div>
        </div>
        <div className="nav-dd-col">
          <div className="nav-dd-heading">Custom Services</div>
          <div className="nav-dd-list">
            {CUSTOM_SERVICES.map((s) => <DropdownItem key={s.slug} s={s} />)}
          </div>
        </div>
      </div>
      <Link to="/services" className="nav-dd-footer">
        <span>Explore all services &amp; pricing</span>
        <svg width="14" height="14" viewBox="0 0 15 15" fill="none" aria-hidden="true">
          <path d="M2 7.5h11M8 3l4.5 4.5L8 12" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  )
}

/* ── Mobile slide-down menu — touch-friendly replacement for the hover mega-menu.
   The desktop row (links + CTA) is hidden by CSS ≤1100px; this panel takes over,
   toggled by the hamburger. Tapping any link closes it (route change also does). */
function MobileMenu({ open, onClose }) {
  const ALL = [...FIXED_PRICE, ...CUSTOM_SERVICES]
  return (
    <div className={`nav-mobile${open ? ' nav-mobile--open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu" aria-hidden={!open}>
      <div className="nav-mobile-scroll">
        <div className="nav-mobile-primary">
          <Link to="/services" className="nav-mobile-link" onClick={onClose}>Services &amp; Pricing</Link>
          <Link to="/proof" className="nav-mobile-link" onClick={onClose}>Proof</Link>
          <Link to="/about" className="nav-mobile-link" onClick={onClose}>About</Link>
          <Link to="/process" className="nav-mobile-link" onClick={onClose}>Process</Link>
          <Link to="/industries" className="nav-mobile-link" onClick={onClose}>Industries</Link>
          <Link to="/contact" className="nav-mobile-link" onClick={onClose}>Contact</Link>
        </div>

        <div className="nav-mobile-section">
          <span className="nav-mobile-heading">Services</span>
          <div className="nav-mobile-services">
            {ALL.map((s) => (
              <Link key={s.slug} to={`/services/${s.slug}`} className="nav-mobile-svc" onClick={onClose}>
                <span className="nav-mobile-svc-ic"><ServiceIcon slug={s.slug} /></span>
                <span className="nav-mobile-svc-name">{s.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <Link className="nav-mobile-cta" to="/contact" onClick={onClose}>
          Start Your Project
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </div>
  )
}

export default function Navbar({ loaded }) {
  const navRef = useRef()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (!loaded) return
    gsap.fromTo(
      navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.75, delay: 0.1, ease: 'power3.out' }
    )
  }, [loaded])

  // The bar is permanently fixed in place. We only track scroll to deepen the
  // glass once the page leaves the very top — it never hides.
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Close the menu whenever the route changes (a link was tapped).
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  // Lock body scroll + close on Escape while the menu is open.
  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [menuOpen])

  return (
    <nav
      ref={navRef}
      className={`navbar${scrolled ? ' navbar--scrolled' : ''}${menuOpen ? ' navbar--menu-open' : ''}`}
      style={{ opacity: 0 }}
    >
      {/* Full-bleed glass on its own layer (sibling of the inner row, NOT an
          ancestor of the dropdown) so the dropdown can run its own
          backdrop-filter — a nested backdrop-filter is disabled by an ancestor
          that also has one. Spans the whole screen width; fades in on scroll. */}
      <span className="navbar-glass" aria-hidden="true" />

      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <img
            className="navbar-rr-mark"
            src="/brand/logo.png"
            alt="Rapid Rise AI"
            width="30"
            height="30"
            style={{ borderRadius: 7, objectFit: 'cover' }}
          />
          <span className="navbar-logo">Rapid Rise AI</span>
        </Link>

        <div className="navbar-links">
          {/* Services & Pricing — CSS :hover drives the dropdown */}
          <div className="navbar-link-wrap">
            <Link to="/services" className="navbar-link navbar-link--drop">
              Services &amp; Pricing
              <svg className="nav-chevron" width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <ServicesDropdown />
          </div>

          <Link to="/proof"  className="navbar-link">Proof</Link>
          <Link to="/about"  className="navbar-link">About</Link>
        </div>

        <Link className="navbar-cta-btn" to="/contact">
          Start Your Project
          <svg className="navbar-cta-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>

        {/* Hamburger — only shown ≤1100px (CSS). Toggles the mobile panel. */}
        <button
          type="button"
          className="navbar-burger"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="navbar-burger-box" aria-hidden="true">
            <span className="navbar-burger-line" />
            <span className="navbar-burger-line" />
            <span className="navbar-burger-line" />
          </span>
        </button>

      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </nav>
  )
}
