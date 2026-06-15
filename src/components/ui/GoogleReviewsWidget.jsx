import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useConsent } from '../../context/ConsentContext'
import { REVIEWS_CONFIG } from '../../data/reviewsConfig'
import './GoogleReviewsWidget.css'

const MIN_KEY = 'rr-reviews-min'
const REVIEW_ROTATE_MS = 6500
const REVIEW_MAX_CHARS = 260

/* The widget never fully disappears — closing it collapses it to a small pill
   that re-expands on click, so visitors keep one-tap access to the profile.
   The collapsed/expanded choice is remembered (functional UI preference, not
   tracking — localStorage can throw in private mode, so it's guarded). */
function readMinimized() {
  try {
    const v = window.localStorage.getItem(MIN_KEY)
    return v === null ? true : v === '1' // first visit → start collapsed
  } catch {
    return true
  }
}
function writeMinimized(v) {
  try {
    window.localStorage.setItem(MIN_KEY, v ? '1' : '0')
  } catch {
    /* session-only */
  }
}

/* "Thabo Mokoena" -> "TM" for a first-party avatar (no Google-hosted images). */
function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

function truncate(text = '') {
  if (text.length <= REVIEW_MAX_CHARS) return text
  return text.slice(0, REVIEW_MAX_CHARS).replace(/\s+\S*$/, '') + '…'
}

/* ── Brand marks / icons ─────────────────────────────────────────────────── */
const GoogleG = ({ size = 20 }) => (
  <svg className="grw-g" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
    <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1 .7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
    <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1z" />
    <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 12 0 12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z" />
  </svg>
)
const ArrowUpRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 17.5 17.5 6.5M8.5 6.5h9v9" />
  </svg>
)

/* Five stars with a gold overlay clipped to the fractional rating (handles 4.9). */
function Stars({ value, size = 15 }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100))
  const Row = ({ fill }) =>
    Array.from({ length: 5 }, (_, i) => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={fill} aria-hidden="true">
        <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.9 6.1 20.97l1.1-6.47-4.7-4.58 6.5-.95z" />
      </svg>
    ))
  return (
    <span className="grw-stars" role="img" aria-label={`${value} out of 5 stars`}>
      <span className="grw-stars-base">{Row({ fill: 'rgba(120,150,190,0.32)' })}</span>
      <span className="grw-stars-fill" style={{ width: `${pct}%` }}>{Row({ fill: '#FBBC05' })}</span>
    </span>
  )
}

export default function GoogleReviewsWidget() {
  // Don't compete with the first-visit privacy banner (it owns the bottom edge).
  const { bannerOpen } = useConsent()

  const [minimized, setMinimized] = useState(() => readMinimized())
  const [idx, setIdx] = useState(0)

  // Top N reviews by rating — "your best ones first". Computed from static data.
  const reviews = useMemo(() => {
    return [...REVIEWS_CONFIG.reviews].sort((a, b) => b.rating - a.rating).slice(0, REVIEWS_CONFIG.maxReviews)
  }, [])

  // Rotate through the featured reviews while expanded.
  useEffect(() => {
    if (minimized || reviews.length < 2) return
    const id = setInterval(() => setIdx((i) => (i + 1) % reviews.length), REVIEW_ROTATE_MS)
    return () => clearInterval(id)
  }, [minimized, reviews.length])

  const minimize = () => { writeMinimized(true); setMinimized(true) }
  const expand = () => { writeMinimized(false); setMinimized(false) }

  if (bannerOpen) return null

  const { rating, total, profileUrl, businessName } = REVIEWS_CONFIG
  const review = reviews[idx]

  return (
    <div className="grw">
      <AnimatePresence mode="wait">
        {minimized ? (
          // ── Collapsed pill — one click brings the full card back ──────────
          <motion.button
            key="mini"
            type="button"
            className="grw-mini"
            onClick={expand}
            aria-label={`Open ${businessName} Google reviews`}
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          >
            <GoogleG size={18} />
            <span className="grw-mini-score">{Number(rating).toFixed(1)}</span>
            <Stars value={Number(rating)} size={12} />
            <svg className="grw-mini-expand" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 10l4-4 4 4M8 18l4-4 4 4" />
            </svg>
          </motion.button>
        ) : (
          // ── Expanded card ─────────────────────────────────────────────────
          <motion.aside
            key="full"
            className="grw-card glass-card glass-card--bright"
            aria-label={`${businessName} Google reviews`}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          >
            <button type="button" className="grw-close" onClick={minimize} aria-label="Minimize reviews widget">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
              </svg>
            </button>

            {/* Header — overall rating, links to the profile */}
            <a className="grw-head" href={profileUrl} target="_blank" rel="noopener noreferrer">
              <GoogleG />
              <div className="grw-head-text">
                <span className="grw-label">Google Reviews</span>
                <div className="grw-rating-row">
                  <strong className="grw-score">{Number(rating).toFixed(1)}</strong>
                  <Stars value={Number(rating)} />
                </div>
                {total > 0 && <span className="grw-count">Based on {total} reviews</span>}
              </div>
            </a>

            {/* Featured review — rotates through your top 3 */}
            <AnimatePresence mode="wait">
              {review && (
                <motion.blockquote
                  key={idx}
                  className="grw-review"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.32 }}
                >
                  <div className="grw-review-head">
                    <span className="grw-avatar" aria-hidden="true">{initials(review.author)}</span>
                    <div className="grw-review-meta">
                      <span className="grw-review-author">{review.author}</span>
                      <span className="grw-review-sub">
                        <Stars value={review.rating} size={12} />
                        {review.when ? <span className="grw-review-when">· {review.when}</span> : null}
                      </span>
                    </div>
                  </div>
                  <p className="grw-review-text">“{truncate(review.text)}”</p>
                </motion.blockquote>
              )}
            </AnimatePresence>

            {/* Rotation dots */}
            {reviews.length > 1 && (
              <div className="grw-dots" role="tablist" aria-label="Featured reviews">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`grw-dot ${i === idx ? 'is-active' : ''}`}
                    aria-label={`Show review ${i + 1}`}
                    aria-selected={i === idx}
                    role="tab"
                    onClick={() => setIdx(i)}
                  />
                ))}
              </div>
            )}

            {/* The "see more" message */}
            <a className="grw-more" href={profileUrl} target="_blank" rel="noopener noreferrer">
              See more reviews on Google <ArrowUpRight />
            </a>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}
