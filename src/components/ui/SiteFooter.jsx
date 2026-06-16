import { Link } from 'react-router-dom'
import { LEGAL_NAV } from '../../data/legalContent'
import { useConsent } from '../../context/ConsentContext'
import { WHATSAPP_URL } from '../../utils/contactSubmit'
import { REVIEWS_CONFIG } from '../../data/reviewsConfig'

const REG_NUMBER = 'K2024727338'

/* ── Footer link data ─────────────────────────────────────────────────────────
   Routes use real pages only (see App.jsx). Legal pages come from
   src/data/legalContent.js. LinkedIn and X are intentionally excluded until
   confirmed profile URLs exist; do not re-add guessed URLs. */

const SERVICE_LINKS = [
  { label: 'Custom Solutions',       to: '/services/software-development' },
  { label: 'AI Automations',         to: '/services/automated-workflow' },
  { label: 'System Integrations',    to: '/services/ecosystems' },
  { label: 'Dashboards & Analytics', to: '/services/smart-dashboards' },
  { label: 'Consulting',             to: '/services/ai-implementation' },
  { label: 'Website Development',    to: '/services/website-development' },
  { label: 'Client Portals',         to: '/services/client-portal' },
  { label: 'AI Communication Agents', to: '/services/ai-communication-agent' },
  { label: 'Marketing & SEO',        to: '/services/marketing-seo' },
]

const COMPANY_LINKS = [
  { label: 'About Us',     to: '/about' },
  { label: 'Our Process',  to: '/process' },
  { label: 'Case Studies', to: '/proof' },
  { label: 'Industries',   to: '/industries' },
  { label: 'Contact',      to: '/contact' },
]

const LEGAL_LINKS = LEGAL_NAV.map((d) => ({ label: d.label, to: `/${d.slug}` }))

/* ── Brand social icons (real glyphs + brand colours) ─────────────────────── */
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <defs>
      <linearGradient id="ftr-ig" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#FEDA75" /><stop offset="0.35" stopColor="#FA7E1E" />
        <stop offset="0.62" stopColor="#D62976" /><stop offset="0.85" stopColor="#962FBF" /><stop offset="1" stopColor="#4F5BD5" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ftr-ig)" />
    <circle cx="12" cy="12" r="4.3" fill="none" stroke="#fff" strokeWidth="1.7" />
    <circle cx="17.3" cy="6.7" r="1.15" fill="#fff" />
  </svg>
)
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#1877F2" d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
  </svg>
)
const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="2" y="5.2" width="20" height="13.6" rx="4" fill="#FF0000" />
    <path d="M10 8.6l6 3.4-6 3.4z" fill="#fff" />
  </svg>
)
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#25D366" d="M12 2a10 10 0 0 0-8.53 15.2L2 22l4.95-1.45A10 10 0 1 0 12 2z" />
    <path fill="#fff" d="M9.2 7.4c-.18-.4-.37-.41-.54-.42h-.46a.9.9 0 0 0-.65.3c-.22.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.16 1.72 2.74 4.25 3.74 2.1.83 2.53.66 2.98.62.46-.04 1.46-.6 1.66-1.18.2-.58.2-1.07.15-1.18-.06-.1-.22-.16-.46-.28-.24-.12-1.46-.72-1.68-.8-.23-.08-.39-.12-.55.12-.16.25-.63.8-.78.97-.14.16-.29.18-.53.06a6.8 6.8 0 0 1-2-1.24 7.6 7.6 0 0 1-1.4-1.74c-.14-.25 0-.38.1-.5l.36-.45c.12-.16.16-.27.24-.45.08-.16.04-.3-.02-.42z" />
  </svg>
)
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M21.6 12.2c0-.64-.06-1.25-.16-1.84H12v3.48h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.99-4.3 2.99-7.16z" />
    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.23-2.5c-.9.6-2.05.95-3.39.95-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22z" />
    <path fill="#FBBC05" d="M6.41 13.91a6 6 0 0 1 0-3.82V7.5H3.07a10 10 0 0 0 0 9z" />
    <path fill="#EA4335" d="M12 5.97c1.47 0 2.78.5 3.82 1.5l2.85-2.85A10 10 0 0 0 3.07 7.5l3.34 2.59A6 6 0 0 1 12 5.97z" />
  </svg>
)
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" /><path d="m2.5 7.5 9.5 6 9.5-6" />
  </svg>
)
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5z" />
  </svg>
)
const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21.5s-7.5-6.1-7.5-11.4a7.5 7.5 0 0 1 15 0c0 5.3-7.5 11.4-7.5 11.4z" /><circle cx="12" cy="9.8" r="2.7" />
  </svg>
)

const SOCIALS = [
  { label: 'Rapid Rise AI on Instagram', href: 'https://www.instagram.com/rapidriseai?igsh=dXg4em5hcWN6anhr', Icon: InstagramIcon },
  { label: 'Rapid Rise AI on Facebook', href: 'https://www.facebook.com/share/1CYwJXCkGz/', Icon: FacebookIcon },
  { label: 'Rapid Rise AI on YouTube', href: 'https://youtube.com/@rapidriseai?si=6t1JV7xaCexZWF_S', Icon: YouTubeIcon },
  { label: 'Message Rapid Rise AI on WhatsApp', href: WHATSAPP_URL, Icon: WhatsAppIcon },
  { label: 'Rapid Rise AI on Google', href: REVIEWS_CONFIG.profileUrl, Icon: GoogleIcon },
]

function FooterLink({ link }) {
  return link.to ? (
    <Link className="ftr-link" to={link.to}>{link.label}</Link>
  ) : (
    <a className="ftr-link" href={link.href}>{link.label}</a>
  )
}

function LinkColumn({ heading, links }) {
  return (
    <nav className="ftr-col" aria-label={heading}>
      <p className="ftr-heading">{heading}</p>
      <ul className="ftr-list">
        {links.map((l) => <li key={l.label}><FooterLink link={l} /></li>)}
      </ul>
    </nav>
  )
}

export default function SiteFooter() {
  const { openPreferences } = useConsent()
  return (
    <footer className="ftr" aria-label="Site footer">
      <div className="ftr-container">
        <div className="ftr-grid">
          {/* Brand */}
          <div className="ftr-col ftr-col--brand">
            <div className="ftr-brand-head">
              <img className="ftr-logo" src="/brand/logo.png" alt="Rapid Rise AI" />
              <p className="ftr-brand">Rapid Rise AI</p>
            </div>
            <p className="ftr-brand-desc">
              We build custom AI powered systems that automate, connect, and
              elevate how modern businesses operate.
            </p>
            <div className="ftr-socials">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  className="ftr-social"
                  href={href}
                  aria-label={label}
                  {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <LinkColumn heading="Services" links={SERVICE_LINKS} />
          <LinkColumn heading="Company" links={COMPANY_LINKS} />
          <LinkColumn heading="Legal" links={LEGAL_LINKS} />

          {/* Contact */}
          <div className="ftr-col" aria-label="Contact">
            <p className="ftr-heading">Contact</p>
            <ul className="ftr-list">
              <li>
                <a className="ftr-link ftr-link--icon" href="mailto:team@rapidriseai.com">
                  <MailIcon />
                  team@rapidriseai.com
                </a>
              </li>
              <li>
                <a
                  className="ftr-link ftr-link--icon"
                  href="tel:+27649031234"
                  aria-label="Call Rapid Rise AI: 064 903 1234"
                >
                  <PhoneIcon />
                  064 903 1234
                </a>
              </li>
              <li>
                <span className="ftr-text ftr-text--loc">
                  <PinIcon />
                  South Africa
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom legal bar */}
        <div className="ftr-bar">
          <p className="ftr-bar-line">© 2026 Rapid Rise AI · Reg. No. {REG_NUMBER}. All rights reserved.</p>
          <div className="ftr-bar-meta">
            <button type="button" className="ftr-bar-btn" onClick={openPreferences}>
              Cookie preferences
            </button>
            <span className="ftr-bar-note">Remote projects across South Africa.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
