import { Link } from 'react-router-dom'
import { LEGAL_NAV } from '../../data/legalContent'

/* ── Footer link data ─────────────────────────────────────────────────────────
   Routes use existing pages (/services/:slug — see src/data/services.js).
   Legal links point at the real legal pages (see src/data/legalContent.js and
   the routes in App.jsx).

   LEGAL PLACEHOLDERS — verify and replace before publishing: company
   registration number, registered address, VAT number, Information Officer.
   Do NOT invent these values; they render as visible [Add …] placeholders. */

const SERVICE_LINKS = [
  { label: 'Website Development',       to: '/services/website-development' },
  { label: 'Client Portals',            to: '/services/client-portal' },
  { label: 'Smart Dashboards',          to: '/services/smart-dashboards' },
  { label: 'AI Communication Agents',   to: '/services/ai-communication-agent' },
  { label: 'Workflow Automation',       to: '/services/automated-workflow' },
  { label: 'Custom Software',           to: '/services/software-development' },
  { label: 'Managed Marketing Services', to: '/services/marketing-seo' },
  { label: 'Business Automation',       to: '/services/automated-workflow' },
  { label: 'AI Implementation',         to: '/services/ai-implementation' },
  { label: 'Connected Ecosystems',      to: '/services/ecosystems' },
]

const PRODUCT_LINKS = [
  { label: 'Fixed Pricing Services',    to: '/services' },
  { label: 'Website Packages',          to: '/services/website-development' },
  { label: 'Client Portal Packages',    to: '/services/client-portal' },
  { label: 'Dashboard Packages',        to: '/services/smart-dashboards' },
  { label: 'AI Support Agent Packages', to: '/services/ai-communication-agent' },
  { label: 'Custom Builds',             to: '/services/software-development' },
  { label: 'Payment Plans',             to: '/services' },
]

const COMPANY_LINKS = [
  { label: 'Our Work',            to: '/proof' },
  { label: 'About',               to: '/about' },
  { label: 'Services & Pricing',  to: '/services' },
  { label: 'Contact',             href: 'mailto:team@rapidriseai.com' },
  { label: 'Request a Quote',     href: 'mailto:team@rapidriseai.com?subject=Quote%20request' },
  { label: 'Start a Custom Build', href: 'mailto:team@rapidriseai.com?subject=Custom%20build%20enquiry' },
]

const LEGAL_LINKS = LEGAL_NAV.map((d) => ({ label: d.label, to: `/${d.slug}` }))

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
            <p className="ftr-brand-note">
              Built for businesses that want smarter systems, less manual work,
              and better digital infrastructure.
            </p>
          </div>

          <LinkColumn heading="Services" links={SERVICE_LINKS} />
          <LinkColumn heading="Products" links={PRODUCT_LINKS} />
          <LinkColumn heading="Company" links={COMPANY_LINKS} />
          <LinkColumn heading="Legal" links={LEGAL_LINKS} />

          {/* Contact */}
          <div className="ftr-col" aria-label="Contact">
            <p className="ftr-heading">Contact</p>
            <ul className="ftr-list">
              <li><a className="ftr-link" href="mailto:team@rapidriseai.com">team@rapidriseai.com</a></li>
              <li><span className="ftr-text">South Africa</span></li>
              <li><span className="ftr-text">Remote projects across South Africa.</span></li>
            </ul>
            <ul className="ftr-list ftr-list--fineprint">
              <li><span className="ftr-text">Rapid Rise AI (Pty) Ltd</span></li>
              <li><span className="ftr-text ftr-placeholder">Company registration: [Add company registration number]</span></li>
              <li><span className="ftr-text ftr-placeholder">Registered address: [Add registered business address]</span></li>
              <li><span className="ftr-text ftr-placeholder">VAT: [Add VAT number if applicable]</span></li>
              <li><span className="ftr-text ftr-placeholder">Information Officer: [Add Information Officer name]</span></li>
              <li>
                <span className="ftr-text">
                  Information Officer email:{' '}
                  <a className="ftr-link" href="mailto:team@rapidriseai.com">team@rapidriseai.com</a>
                </span>
              </li>
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
