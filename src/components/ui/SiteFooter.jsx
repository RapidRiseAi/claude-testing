import { Link } from 'react-router-dom'

/* ── Footer link data ─────────────────────────────────────────────────────────
   Routes point at existing pages where they exist (/services/:slug — see
   src/data/services.js). Legal links go to /legal/:slug placeholder pages
   until the real documents are published.

   LEGAL PLACEHOLDERS — verify and replace before publishing:
   company registration number, registered address, VAT number. Do NOT invent
   these values; they are rendered as visible [Add …] placeholders on purpose. */

const SERVICE_LINKS = [
  { label: 'Website Development',      to: '/services/website-development' },
  { label: 'Client Portals',           to: '/services/client-portal' },
  { label: 'Smart Dashboards',         to: '/services/smart-dashboards' },
  { label: 'AI Communication Agents',  to: '/services/ai-communication-agent' },
  { label: 'Workflow Automation',      to: '/services/automated-workflow' },
  { label: 'Custom Software',          to: '/services/software-development' },
  { label: 'Managed Marketing Services', to: '/services/marketing-seo' },
]

const COMPANY_LINKS = [
  { label: 'Our Work',           to: '/proof' },
  { label: 'Services & Pricing', to: '/services' },
  { label: 'About',              to: '/about' },
  { label: 'Contact',            href: 'mailto:team@rapidriseai.com' },
  { label: 'Request a Quote',    href: 'mailto:team@rapidriseai.com?subject=Quote%20request' },
]

const LEGAL_LINKS = [
  { label: 'Privacy Policy',               to: '/legal/privacy-policy' },
  { label: 'Terms of Service',             to: '/legal/terms-of-service' },
  { label: 'PAIA Manual',                  to: '/legal/paia-manual' },
  { label: 'Cookie Notice',                to: '/legal/cookie-notice' },
  { label: 'POPIA Notice',                 to: '/legal/popia-notice' },
  { label: 'Refund / Cancellation Policy', to: '/legal/refund-policy' },
]

function FooterLink({ link }) {
  return link.to ? (
    <Link className="ftr-link" to={link.to}>{link.label}</Link>
  ) : (
    <a className="ftr-link" href={link.href}>{link.label}</a>
  )
}

export default function SiteFooter() {
  return (
    <footer className="ftr" aria-label="Site footer">
      <div className="ftr-container">
        <div className="ftr-grid">
          {/* Brand */}
          <div className="ftr-col ftr-col--brand">
            <p className="ftr-brand">Rapid Rise AI</p>
            <p className="ftr-brand-desc">
              AI, software, automation, and connected business systems built for
              modern growth.
            </p>
            <p className="ftr-brand-tagline">
              Custom software. AI systems. Business automation.
            </p>
          </div>

          {/* Services */}
          <nav className="ftr-col" aria-label="Services">
            <p className="ftr-heading">Services</p>
            <ul className="ftr-list">
              {SERVICE_LINKS.map((l) => <li key={l.label}><FooterLink link={l} /></li>)}
            </ul>
          </nav>

          {/* Company */}
          <nav className="ftr-col" aria-label="Company">
            <p className="ftr-heading">Company</p>
            <ul className="ftr-list">
              {COMPANY_LINKS.map((l) => <li key={l.label}><FooterLink link={l} /></li>)}
            </ul>
          </nav>

          {/* Legal */}
          <nav className="ftr-col" aria-label="Legal">
            <p className="ftr-heading">Legal</p>
            <ul className="ftr-list">
              {LEGAL_LINKS.map((l) => <li key={l.label}><FooterLink link={l} /></li>)}
            </ul>
          </nav>

          {/* Contact */}
          <div className="ftr-col" aria-label="Contact">
            <p className="ftr-heading">Contact</p>
            <ul className="ftr-list">
              <li><a className="ftr-link" href="mailto:team@rapidriseai.com">team@rapidriseai.com</a></li>
              <li><span className="ftr-text">South Africa</span></li>
              <li><span className="ftr-text">Available for remote projects across South Africa.</span></li>
            </ul>
            <ul className="ftr-list ftr-list--fineprint">
              <li><span className="ftr-text">Rapid Rise AI (Pty) Ltd</span></li>
              <li><span className="ftr-text ftr-placeholder">Company registration: [Add company registration number]</span></li>
              <li><span className="ftr-text ftr-placeholder">Registered address: [Add registered business address]</span></li>
              <li><span className="ftr-text ftr-placeholder">VAT: [Add VAT number if applicable]</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom legal bar */}
        <div className="ftr-bar">
          <p className="ftr-bar-line">
            © 2026 Rapid Rise AI (Pty) Ltd. All rights reserved.
            <span className="ftr-bar-sep" aria-hidden="true">·</span>
            <span className="ftr-placeholder">Company Reg: [Add company registration number]</span>
            <span className="ftr-bar-sep" aria-hidden="true">·</span>
            South Africa
          </p>
          <p className="ftr-bar-disclaimer">
            Information on this website is provided for general business purposes
            and does not constitute legal, financial, or technical advice.
          </p>
          <p className="ftr-bar-note">Built by Rapid Rise AI.</p>
        </div>
      </div>
    </footer>
  )
}
