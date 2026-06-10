import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

/* ── Icons (thin line style, consistent with the rest of the site) ─────────── */
const CodeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m8.5 7.5-4.5 4.5 4.5 4.5M15.5 7.5l4.5 4.5-4.5 4.5" />
  </svg>
)
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="3.8" /><path d="M5.4 20a6.6 6.6 0 0 1 13.2 0" />
  </svg>
)
const BarsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 20.5v-6M12 20.5v-11M19 20.5V7" />
  </svg>
)
const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 13.5a2.4 2.4 0 0 1-2.4 2.4H9l-4.5 3.4.02-3.4A2.4 2.4 0 0 1 4 13.5v-6A2.4 2.4 0 0 1 6.4 5.1h11.2A2.4 2.4 0 0 1 20 7.5z" />
  </svg>
)
const BoltIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12z" />
  </svg>
)
const CalcIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2.5" width="14" height="19" rx="2" /><path d="M9 7h6M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01" />
  </svg>
)
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 2.5v4M16 2.5v4" />
  </svg>
)
const RouteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="2.5" /><circle cx="18" cy="5" r="2.5" /><path d="M8.5 19H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5" />
  </svg>
)
const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2.5H6.5A1.5 1.5 0 0 0 5 4v16a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 20V7.5z" /><path d="M14 2.5V7.5h5" />
  </svg>
)
const ChecklistIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m4 6.5 1.5 1.5L8 5.5M4 12.5l1.5 1.5L8 11.5M4 18.5l1.5 1.5L8 17.5" /><path d="M11.5 7h9M11.5 13h9M11.5 19h9" />
  </svg>
)
const MenuBoardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" />
  </svg>
)
const FlowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><path d="M10 6.5h7.5v4M14 17.5H6.5v-4" />
  </svg>
)
const WrenchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 6.5a4 4 0 0 0-5.6 4.9L3 17.3V21h3.7l5.9-5.9a4 4 0 0 0 4.9-5.6L14.6 12l-2.6-2.6z" />
  </svg>
)
const SparkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4.5 13.6 10 19 11.5 13.6 13 12 18.5 10.4 13 5 11.5 10.4 10z" />
  </svg>
)
const ChipIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 2.5v3.5M15 2.5v3.5M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5" />
  </svg>
)
const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 7.5h11M8 3l4.5 4.5L8 12" />
  </svg>
)

/* ── Possibility items ───────────────────────────────────────────────────────
   The first VISIBLE_DESKTOP items render on the arc; everything after them is
   ready to swap in later — reorder this list to change what is shown. */
const POSSIBILITIES = [
  { label: 'Custom Websites',          icon: CodeIcon },
  { label: 'Client Portals',           icon: UserIcon },
  { label: 'Smart Dashboards',         icon: BarsIcon },
  { label: 'AI Chat Agents',           icon: SparkIcon },
  { label: 'WhatsApp Automations',     icon: ChatIcon },
  { label: 'Quote Calculators',        icon: CalcIcon },
  { label: 'Booking Systems',          icon: CalendarIcon },
  { label: 'Document Collection',      icon: FileIcon },
  { label: 'Inspection Systems',       icon: ChecklistIcon },
  { label: 'CRM Workflows',            icon: FlowIcon },
  { label: 'Reporting Systems',        icon: BarsIcon },
  { label: 'IoT Integrations',         icon: ChipIcon },
  // Easy to surface later — bump any of these into the visible set above:
  { label: 'Lead Routing',             icon: RouteIcon },
  { label: 'Digital Menus',            icon: MenuBoardIcon },
  { label: 'Internal Staff Tools',     icon: WrenchIcon },
  { label: 'Google Workspace Automation', icon: BoltIcon },
  { label: 'Payment Integrations',     icon: CalcIcon },
  { label: 'Customer Support Systems', icon: ChatIcon },
  { label: 'Knowledge Bases',          icon: FileIcon },
  { label: 'Reminder Systems',         icon: CalendarIcon },
]
const VISIBLE_DESKTOP = 12

const EASE = [0.16, 1, 0.3, 1]
const inView = { once: true, amount: 0.25, margin: '-60px' }

/* Planet-horizon arc: chips drop and tilt toward the edges like points on the
   top of a large circle. t ∈ [-1, 1] across the row; values land in CSS custom
   properties so the ≤1100px media query can flatten the arc with one rule. */
function arcStyle(i, n, { drop, tilt, scaleEdge, fadeEdge, baseScale = 1, baseFade = 1 }) {
  const t = n > 1 ? (i - (n - 1) / 2) / ((n - 1) / 2) : 0
  return {
    '--cp-drop': `${(drop * t * t).toFixed(1)}px`,
    '--cp-tilt': `${(tilt * t).toFixed(2)}deg`,
    '--cp-scale': (baseScale * (1 - scaleEdge * Math.abs(t))).toFixed(3),
    '--cp-fade': (baseFade * (1 - fadeEdge * Math.abs(t))).toFixed(3),
  }
}

function PossibilityChip({ item, style, index }) {
  const Icon = item.icon
  return (
    <motion.span
      className="cp-chip"
      style={style}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={inView}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.045, ease: EASE }}
    >
      <span className="cp-chip-inner">
        <Icon />
        {item.label}
      </span>
    </motion.span>
  )
}

export default function CustomPossibilitiesSection() {
  const visible = POSSIBILITIES.slice(0, VISIBLE_DESKTOP)
  const rowA = visible.slice(0, Math.ceil(visible.length / 2))
  const rowB = visible.slice(Math.ceil(visible.length / 2))

  return (
    <section className="cp-section" aria-label="Custom solutions we can build">
      <div className="cp-container">
        <motion.header
          className="cp-head"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <p className="cp-eyebrow">Custom Solutions</p>
          <h2 className="cp-title">
            What could we build around your business<span className="cp-dot">?</span>
          </h2>
          <p className="cp-sub">
            From simple automations to connected business ecosystems, we design
            custom systems around the way your team, customers, and operations
            actually work.
          </p>
        </motion.header>

        {/* Possibility horizon — chips along a curved orbital band */}
        <div className="cp-stage" aria-hidden={false}>
          <div className="cp-row cp-row--a">
            {rowA.map((item, i) => (
              <PossibilityChip
                key={item.label}
                item={item}
                index={i}
                style={arcStyle(i, rowA.length, { drop: 44, tilt: 7, scaleEdge: 0.12, fadeEdge: 0.28 })}
              />
            ))}
          </div>
          <div className="cp-row cp-row--b">
            {rowB.map((item, i) => (
              <PossibilityChip
                key={item.label}
                item={item}
                index={i + rowA.length}
                style={arcStyle(i, rowB.length, { drop: 34, tilt: 5.5, scaleEdge: 0.10, fadeEdge: 0.30, baseScale: 0.94, baseFade: 0.9 })}
              />
            ))}
          </div>

          {/* The horizon itself: a glowing dome rim + a few drifting orbs */}
          <div className="cp-horizon" aria-hidden="true" />
          <span className="cp-orb cp-orb--1" aria-hidden="true" />
          <span className="cp-orb cp-orb--2" aria-hidden="true" />
          <span className="cp-orb cp-orb--3" aria-hidden="true" />
          <span className="cp-orb cp-orb--4" aria-hidden="true" />
          <span className="cp-orb cp-orb--5" aria-hidden="true" />
        </div>

        {/* CTA block */}
        <motion.div
          className="cp-cta"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0, margin: '0px 0px 30% 0px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
        >
          <h3 className="cp-cta-title">Need something that does not fit into a package?</h3>
          <p className="cp-cta-sub">
            Tell us what you are trying to build. We will help shape the right
            system, scope, and starting point for your budget.
          </p>
          <div className="cp-cta-actions">
            <Link className="cp-btn-primary" to="/services">
              Start a Custom Build
              <ArrowIcon />
            </Link>
            <a className="cp-btn-ghost" href="mailto:team@rapidriseai.com?subject=Quote%20request">
              Request a Quote
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
