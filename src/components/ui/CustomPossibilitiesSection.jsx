import { motion } from 'framer-motion'
import {
  CUSTOM_SECTION_COPY,
  customSolutionGroups,
  possibilityChips,
} from '../../data/customSolutions'

/* ── Icons (thin line style, consistent with the rest of the site) ──────────
   Keyed by the `icon` strings used in src/data/customSolutions.js. */
const ICONS = {
  code: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m8.5 7.5-4.5 4.5 4.5 4.5M15.5 7.5l4.5 4.5-4.5 4.5" />
    </svg>
  ),
  user: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.8" /><path d="M5.4 20a6.6 6.6 0 0 1 13.2 0" />
    </svg>
  ),
  bars: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 20.5v-6M12 20.5v-11M19 20.5V7" />
    </svg>
  ),
  chat: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13.5a2.4 2.4 0 0 1-2.4 2.4H9l-4.5 3.4.02-3.4A2.4 2.4 0 0 1 4 13.5v-6A2.4 2.4 0 0 1 6.4 5.1h11.2A2.4 2.4 0 0 1 20 7.5z" />
    </svg>
  ),
  bolt: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12z" />
    </svg>
  ),
  calc: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2.5" width="14" height="19" rx="2" /><path d="M9 7h6M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01" />
    </svg>
  ),
  calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 2.5v4M16 2.5v4" />
    </svg>
  ),
  route: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="2.5" /><circle cx="18" cy="5" r="2.5" /><path d="M8.5 19H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5" />
    </svg>
  ),
  file: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2.5H6.5A1.5 1.5 0 0 0 5 4v16a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 20V7.5z" /><path d="M14 2.5V7.5h5" />
    </svg>
  ),
  checklist: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4 6.5 1.5 1.5L8 5.5M4 12.5l1.5 1.5L8 11.5M4 18.5l1.5 1.5L8 17.5" /><path d="M11.5 7h9M11.5 13h9M11.5 19h9" />
    </svg>
  ),
  menu: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  ),
  flow: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><path d="M10 6.5h7.5v4M14 17.5H6.5v-4" />
    </svg>
  ),
  wrench: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 6.5a4 4 0 0 0-5.6 4.9L3 17.3V21h3.7l5.9-5.9a4 4 0 0 0 4.9-5.6L14.6 12l-2.6-2.6z" />
    </svg>
  ),
  spark: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4.5 13.6 10 19 11.5 13.6 13 12 18.5 10.4 13 5 11.5 10.4 10z" />
    </svg>
  ),
  chip: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 2.5v3.5M15 2.5v3.5M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5" />
    </svg>
  ),
  bell: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 9.5a6 6 0 0 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5" /><path d="M10.3 20a2 2 0 0 0 3.4 0" />
    </svg>
  ),
  globe: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14.5 14.5 0 0 1 0 18M12 3a14.5 14.5 0 0 0 0 18" />
    </svg>
  ),
  funnel: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4.5h18l-7 8.2V20l-4-2v-5.3z" />
    </svg>
  ),
  shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.5 4.5 5.5v6c0 4.6 3.2 8 7.5 10 4.3-2 7.5-5.4 7.5-10v-6z" /><path d="m8.8 11.8 2.3 2.3 4.1-4.4" />
    </svg>
  ),
  layers: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 2.5 9 5-9 5-9-5z" /><path d="m3 12.5 9 5 9-5M3 17.5l9 5 9-5" />
    </svg>
  ),
}
const iconFor = (key) => ICONS[key] ?? ICONS.spark

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 7.5h11M8 3l4.5 4.5L8 12" />
  </svg>
)
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 12.5l4.6 4.6L19.5 6.5" />
  </svg>
)

/* How many chips from the possibilityChips library ride the horizon arc. */
const HORIZON_CHIP_COUNT = 14

const EASE = [0.16, 1, 0.3, 1]
const inView = { once: true, amount: 0.2, margin: '-60px' }

/* Planet-horizon arc placement (flattened by the ≤1100px media query). */
function arcStyle(i, n, { drop, tilt, scaleEdge, fadeEdge, baseScale = 1, baseFade = 1 }) {
  const t = n > 1 ? (i - (n - 1) / 2) / ((n - 1) / 2) : 0
  return {
    '--cp-drop': `${(drop * t * t).toFixed(1)}px`,
    '--cp-tilt': `${(tilt * t).toFixed(2)}deg`,
    '--cp-scale': (baseScale * (1 - scaleEdge * Math.abs(t))).toFixed(3),
    '--cp-fade': (baseFade * (1 - fadeEdge * Math.abs(t))).toFixed(3),
  }
}

function PossibilityChip({ chip, style, index }) {
  const Icon = iconFor(chip.icon)
  return (
    <motion.span
      className="cp-chip"
      style={style}
      title={chip.category}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={inView}
      transition={{ duration: 0.45, delay: 0.08 + index * 0.035, ease: EASE }}
    >
      <span className="cp-chip-inner">
        <Icon />
        {chip.label}
      </span>
    </motion.span>
  )
}

function SolutionGroup({ group, index }) {
  const Icon = iconFor(group.icon)
  return (
    <motion.article
      className="cp-group"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={inView}
      transition={{ duration: 0.55, delay: 0.05 + index * 0.07, ease: EASE }}
    >
      <div className="cp-group-head">
        <span className="cp-group-icon" aria-hidden="true"><Icon /></span>
        <h3 className="cp-group-title">{group.title}</h3>
      </div>
      <p className="cp-group-value">{group.businessValue}</p>
      <ul className="cp-group-list">
        {group.examples.map((ex) => (
          <li key={ex}><CheckIcon />{ex}</li>
        ))}
      </ul>
    </motion.article>
  )
}

export default function CustomPossibilitiesSection() {
  const horizonChips = possibilityChips.slice(0, HORIZON_CHIP_COUNT)
  const rowA = horizonChips.slice(0, Math.ceil(horizonChips.length / 2))
  const rowB = horizonChips.slice(Math.ceil(horizonChips.length / 2))

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
          <p className="cp-eyebrow">{CUSTOM_SECTION_COPY.eyebrow}</p>
          <h2 className="cp-title">
            {CUSTOM_SECTION_COPY.title.replace(/\?$/, '')}<span className="cp-dot">?</span>
          </h2>
          <p className="cp-sub">{CUSTOM_SECTION_COPY.sub}</p>
        </motion.header>

        {/* Possibility horizon — featured chips on a subtle curved band */}
        <div className="cp-stage">
          <div className="cp-row cp-row--a">
            {rowA.map((chip, i) => (
              <PossibilityChip
                key={chip.label}
                chip={chip}
                index={i}
                style={arcStyle(i, rowA.length, { drop: 26, tilt: 5, scaleEdge: 0.09, fadeEdge: 0.22 })}
              />
            ))}
          </div>
          <div className="cp-row cp-row--b">
            {rowB.map((chip, i) => (
              <PossibilityChip
                key={chip.label}
                chip={chip}
                index={i + rowA.length}
                style={arcStyle(i, rowB.length, { drop: 20, tilt: 4, scaleEdge: 0.08, fadeEdge: 0.24, baseScale: 0.95, baseFade: 0.92 })}
              />
            ))}
          </div>
          <div className="cp-horizon" aria-hidden="true" />
        </div>

        {/* Grouped idea library — real systems for real business problems */}
        <div className="cp-groups">
          {customSolutionGroups.map((group, i) => (
            <SolutionGroup key={group.title} group={group} index={i} />
          ))}
        </div>

        {/* CTA block */}
        <motion.div
          className="cp-cta"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0, margin: '0px 0px 30% 0px' }}
          transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
        >
          <h3 className="cp-cta-title">Need something that does not fit into a package?</h3>
          <p className="cp-cta-sub">
            Tell us what you are trying to build. We will help shape the right
            system, scope, and starting point for your budget.
          </p>
          <div className="cp-cta-actions">
            <a className="cp-btn-primary" href="mailto:team@rapidriseai.com?subject=Custom%20build%20enquiry">
              Start a Custom Build
              <ArrowIcon />
            </a>
            <a className="cp-btn-ghost" href="mailto:team@rapidriseai.com?subject=Quote%20request">
              Request a Quote
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
