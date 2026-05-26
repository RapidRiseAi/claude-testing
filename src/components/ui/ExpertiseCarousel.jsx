import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { registerCarousel } from '../../utils/carouselControl'

/* ── Icons ─────────────────────────────────────────────────────────────────── */
const GlobeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)
const CodeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
)
const SmartphoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2"/>
    <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/>
  </svg>
)
const ZapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)
const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.64 5.64l2.12 2.12M16.24 16.24l2.12 2.12M5.64 18.36l2.12-2.12M16.24 7.76l2.12-2.12"/>
    <circle cx="12" cy="12" r="4"/>
  </svg>
)
const NetworkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="4" r="2"/><circle cx="4" cy="20" r="2"/><circle cx="20" cy="20" r="2"/>
    <path d="M12 6v4M12 10l-6.5 8M12 10l6.5 8M5 20h14"/>
  </svg>
)
const TrendingUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
)

/* ── Card data ──────────────────────────────────────────────────────────────── */
const CARDS = [
  {
    number: '01',
    category: 'DIGITAL PRESENCE',
    icon: GlobeIcon,
    title: 'Websites and SEO',
    intro: 'High-performance websites and SEO systems designed to attract, engage, and convert.',
    sections: [
      { label: 'What it is', type: 'text', content: 'Premium websites built to position your brand professionally and turn online attention into qualified enquiries.' },
      { label: 'Capabilities', type: 'bullets', items: ['Custom websites and landing pages', 'Technical SEO and on-page optimization', 'Content structure and keyword targeting', 'Quote, booking, and enquiry flows'] },
      { label: 'Opportunities', type: 'bullets', items: ['Increase organic visibility and traffic', 'Convert more visitors into customers', 'Build stronger digital authority', 'Support ads, SEO, and AI-search visibility'] },
    ],
    route: '/services/website-development',
  },
  {
    number: '02',
    category: 'BUSINESS SYSTEMS',
    icon: CodeIcon,
    title: 'Custom Software',
    intro: 'Purpose-built software designed around the way your business actually works.',
    sections: [
      { label: 'What it is', type: 'text', content: 'Custom digital systems that replace scattered manual processes with controlled, scalable business tools.' },
      { label: 'Capabilities', type: 'bullets', items: ['Internal dashboards and admin panels', 'Client portals and staff tools', 'Quote, booking, and workflow systems', 'Document, reporting, and approval flows'] },
      { label: 'Opportunities', type: 'bullets', items: ['Centralize operations in one place', 'Reduce spreadsheet dependency', 'Improve visibility across the business', 'Build systems competitors cannot easily copy'] },
    ],
    route: '/services/software-development',
  },
  {
    number: '03',
    category: 'DIGITAL PRODUCTS',
    icon: SmartphoneIcon,
    title: 'App Development',
    intro: 'Mobile-ready tools that give customers, staff, or partners a better way to interact with your business.',
    sections: [
      { label: 'What it is', type: 'text', content: 'Web apps and mobile-first platforms that turn everyday operations into smoother digital experiences.' },
      { label: 'Capabilities', type: 'bullets', items: ['Customer portals and profile systems', 'Staff apps and mobile dashboards', 'Status tracking and upload flows', 'Booking, service, and request systems'] },
      { label: 'Opportunities', type: 'bullets', items: ['Improve customer experience', 'Reduce repeated communication', 'Give users access to real-time information', 'Turn your service into a stronger digital product'] },
    ],
    route: '/services/web-app-development',
  },
  {
    number: '04',
    category: 'OPERATIONS',
    icon: ZapIcon,
    title: 'Workflow Automation',
    intro: 'Smart automations that move information between people, tools, and customers without constant manual effort.',
    sections: [
      { label: 'What it is', type: 'text', content: 'Automated workflows that handle repetitive tasks, connect systems, and keep important processes moving.' },
      { label: 'Capabilities', type: 'bullets', items: ['Lead routing and follow-up automation', 'Email, WhatsApp, and form workflows', 'Google Workspace automation', 'Notifications, reminders, and task triggers'] },
      { label: 'Opportunities', type: 'bullets', items: ['Respond faster', 'Reduce human error', 'Prevent missed tasks', 'Free your team from repetitive admin'] },
    ],
    route: '/services/automated-workflow',
  },
  {
    number: '05',
    category: 'INTELLIGENT SYSTEMS',
    icon: SparklesIcon,
    title: 'AI Implementation',
    intro: 'AI assistants and agents that help your business answer, create, search, summarize, and act faster.',
    sections: [
      { label: 'What it is', type: 'text', content: 'Practical AI systems built into your business so your team can work faster and customers can get better support.' },
      { label: 'Capabilities', type: 'bullets', items: ['AI chat assistants and support bots', 'Internal staff assistants', 'Knowledge base and document search', 'AI reply, reporting, and content support'] },
      { label: 'Opportunities', type: 'bullets', items: ['Move beyond basic ChatGPT use', 'Give customers faster answers', 'Help staff make better decisions', 'Turn business knowledge into a usable assistant'] },
    ],
    route: '/services/ai-implementation',
  },
  {
    number: '06',
    category: 'CONNECTED INFRASTRUCTURE',
    icon: NetworkIcon,
    title: 'Connected Ecosystems',
    intro: 'A unified operating layer where your website, software, automations, AI, dashboards, and tools work together.',
    sections: [
      { label: 'What it is', type: 'text', content: 'A connected digital environment that links your systems, data, people, and workflows into one smarter business stack.' },
      { label: 'Capabilities', type: 'bullets', items: ['API and tool integrations', 'Shared data flows and central dashboards', 'CRM-style workflows', 'AI-supported operations'] },
      { label: 'Opportunities', type: 'bullets', items: ['Create one source of truth', 'Break down operational silos', 'Improve business-wide visibility', 'Scale without adding unnecessary complexity'] },
    ],
    route: '/services/ecosystems',
  },
  {
    number: '07',
    category: 'GROWTH INFRASTRUCTURE',
    icon: TrendingUpIcon,
    title: 'Marketing Infrastructure',
    intro: 'Systems that help your business attract, capture, track, and manage demand more effectively.',
    sections: [
      { label: 'What it is', type: 'text', content: 'Growth-focused digital infrastructure that connects marketing activity directly to enquiry handling and operations.' },
      { label: 'Capabilities', type: 'bullets', items: ['Campaign landing pages', 'Lead capture funnels', 'SEO content systems', 'Marketing dashboards and follow-up flows'] },
      { label: 'Opportunities', type: 'bullets', items: ['Capture more qualified enquiries', 'Track marketing performance clearly', 'Prevent leads from getting lost', 'Connect growth activity to real operations'] },
    ],
    route: '/services/marketing-seo',
  },
]

/* ── Position → animation props ────────────────────────────────────────────── */
function getCardAnim(pos) {
  if (pos === 0)  return { x: 0,   scale: 1.00, opacity: 1.0, rotateY:  0, filter: 'blur(0px)' }
  if (pos === 1)  return { x: 82,  scale: 0.96, opacity: 1.0, rotateY: -2, filter: 'blur(0px)' }
  if (pos === 2)  return { x: 154, scale: 0.92, opacity: 0.9, rotateY: -4, filter: 'blur(0px)' }
  if (pos >= 3)   return { x: 220, scale: 0.88, opacity: 0,   rotateY: -6, filter: 'blur(0px)' }
  /* previous */  return { x: -60, scale: 0.92, opacity: 0,   rotateY:  4, filter: 'blur(2px)' }
}
function getZIndex(pos) {
  if (pos === 0) return 30
  if (pos === 1) return 20
  if (pos === 2) return 10
  return 0
}

const TRANSITION = { duration: 0.72, ease: [0.16, 1, 0.3, 1] }

/* ── Card inner content ─────────────────────────────────────────────────────── */
function CardInner({ card, isActive }) {
  const Icon = card.icon
  return (
    <div className="ec-inner">
      <div className="ec-top">
        <div className="ec-icon-box" aria-hidden="true"><Icon /></div>
        <div className="ec-meta">
          <span className="ec-number">{card.number}</span>
          <span className="ec-category">{card.category}</span>
        </div>
      </div>

      <h3 className="ec-title">{card.title}</h3>
      <p className="ec-intro">{card.intro}</p>

      <div className="ec-divider" aria-hidden="true" />

      <div className="ec-sections">
        {card.sections.map((sec) => (
          <div key={sec.label} className="ec-section">
            <div className="ec-section-label">{sec.label}</div>
            {sec.type === 'text' ? (
              <p className="ec-section-text">{sec.content}</p>
            ) : (
              <ul className="ec-bullets">
                {sec.items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            )}
          </div>
        ))}
      </div>

      {isActive && (
        <div className="ec-cta-hint" aria-hidden="true">
          Explore
          <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
            <path d="M2 7.5h11M8 3l4.5 4.5L8 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────────────────────── */
export default function ExpertiseCarousel() {
  const [activeCard, setActiveCard] = useState(0)
  const activeCardRef = useRef(0)
  const navigate = useNavigate()

  /* keep ref in sync for carouselControl (avoids stale closure) */
  useEffect(() => { activeCardRef.current = activeCard }, [activeCard])

  /* register with scroll-snap hook */
  useEffect(() => {
    registerCarousel({
      onAdvance: (dir) =>
        setActiveCard(prev => Math.max(0, Math.min(CARDS.length - 1, prev + dir))),
      activeRef: activeCardRef,
      total: CARDS.length,
    })
  }, [])

  const handleCardClick = useCallback((cardIndex, pos) => {
    if (pos === 0) {
      navigate(CARDS[cardIndex].route)
    } else if (pos === 1 || pos === 2) {
      setActiveCard(cardIndex)
    }
  }, [navigate])

  return (
    <section className="expertise-section" data-carousel="" aria-label="Our expertise">

      {/* Left column — transparent, HeroOrb shows through from fixed canvas */}
      <div className="expertise-left" aria-hidden="true" />

      {/* Right column — heading + card carousel */}
      <div className="expertise-right">

        <div className="expertise-heading-block">
          <p className="expertise-eyebrow">OUR EXPERTISE</p>
          <h2 className="expertise-h2">Solutions that scale with your vision.</h2>
        </div>

        <div className="ec-carousel-wrap" role="region" aria-label="Expertise cards">
          {CARDS.map((card, i) => {
            const pos = i - activeCard
            const anim = getCardAnim(pos)
            const isActive = pos === 0
            const isVisible = pos >= 0 && pos <= 2

            return (
              <motion.div
                key={card.number}
                className={`expertise-card${isActive ? ' expertise-card--active' : ''}`}
                style={{ zIndex: getZIndex(pos) }}
                animate={anim}
                transition={TRANSITION}
                onClick={() => handleCardClick(i, pos)}
                role={isActive ? 'link' : isVisible ? 'button' : undefined}
                aria-label={
                  isActive
                    ? `${card.title} — click to explore`
                    : isVisible
                    ? `Show ${card.title}`
                    : undefined
                }
                tabIndex={isVisible ? 0 : -1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleCardClick(i, pos)
                  }
                }}
              >
                <CardInner card={card} isActive={isActive} />
              </motion.div>
            )
          })}
        </div>

        {/* Progress indicator — subtle dots only */}
        <div className="ec-progress" aria-hidden="true">
          {CARDS.map((_, i) => (
            <button
              key={i}
              className={`ec-progress-dot${i === activeCard ? ' ec-progress-dot--active' : ''}`}
              onClick={() => setActiveCard(i)}
              tabIndex={-1}
              aria-hidden="true"
            />
          ))}
        </div>

      </div>
    </section>
  )
}
