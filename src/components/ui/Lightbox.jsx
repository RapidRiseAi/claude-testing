import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import './Lightbox.css'

/* Accessible fullscreen image gallery. Controlled by the parent: render it only
   when `images` is set, and provide `onClose`. Keyboard: ← → to navigate, Esc to
   close. Body scroll is locked while open. */
export default function Lightbox({ images = [], start = 0, title, onClose }) {
  const n = images.length
  const [i, setI] = useState(start)
  const go = useCallback((d) => setI((p) => (p + d + n) % n), [n])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.classList.add('rr-lightbox-open')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      document.body.classList.remove('rr-lightbox-open')
    }
  }, [go, onClose])

  if (!n) return null

  return createPortal(
    <div className="lb-root" role="dialog" aria-modal="true" aria-label={title ? `${title} gallery` : 'Gallery'} onClick={onClose}>
      <button className="lb-close" type="button" aria-label="Close gallery" onClick={onClose}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        <span className="lb-close-label">Close</span>
      </button>

      <div className="lb-stage" onClick={(e) => e.stopPropagation()}>
        {n > 1 && (
          <button className="lb-nav lb-prev" type="button" aria-label="Previous image" onClick={() => go(-1)}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
        )}
        <img className="lb-img" src={images[i]} alt={`${title || 'Screen'} — ${i + 1} of ${n}`} />
        {n > 1 && (
          <button className="lb-nav lb-next" type="button" aria-label="Next image" onClick={() => go(1)}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        )}
      </div>

      <div className="lb-bar" onClick={(e) => e.stopPropagation()}>
        {title && <span className="lb-title">{title}</span>}
        <span className="lb-count">{i + 1} / {n}</span>
      </div>

      {n > 1 && (
        <div className="lb-thumbs" onClick={(e) => e.stopPropagation()}>
          {images.map((src, k) => (
            <button
              key={src}
              type="button"
              className={`lb-thumb${k === i ? ' is-active' : ''}`}
              aria-label={`Go to image ${k + 1}`}
              onClick={() => setI(k)}
            >
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  )
}
