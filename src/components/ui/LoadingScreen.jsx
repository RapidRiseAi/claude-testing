import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function LoadingScreen({ onDone }) {
  const wrapRef = useRef()
  const ringRef = useRef()
  const logoRef = useRef()
  const tagRef  = useRef()
  const barRef  = useRef()
  const fillRef = useRef()

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete() {
        gsap.to(wrapRef.current, {
          yPercent: -100,
          duration: 0.9,
          ease: 'power3.inOut',
          onStart: () => setTimeout(onDone, 350),
        })
      },
    })
    tl
      .from(ringRef.current, { scale: 0.5, opacity: 0, duration: 0.8, ease: 'back.out(1.6)' })
      .from(logoRef.current, { y: 16, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
      .from(tagRef.current,  { y: 10, opacity: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
      .from(barRef.current,  { opacity: 0, duration: 0.3 }, '-=0.1')
      .to(fillRef.current,   { width: '100%', duration: 1.35, ease: 'power2.inOut' })
      .to({}, { duration: 0.3 })
  }, [onDone])

  return (
    <div ref={wrapRef} className="ls-root">
      <div className="ls-inner">
        <div ref={ringRef} className="ls-rings">
          <div className="ls-ring ls-ring--1" />
          <div className="ls-ring ls-ring--2" />
          <div className="ls-ring ls-ring--3" />
          <img className="ls-mark" src="/brand/logo.png" alt="Rapid Rise AI" />
        </div>
        <div ref={logoRef} className="ls-logo">Rapid Rise AI</div>
        <div ref={tagRef}  className="ls-tag">AI &amp; Software Infrastructure</div>
        <div ref={barRef}  className="ls-bar">
          <div ref={fillRef} className="ls-fill" />
        </div>
      </div>
    </div>
  )
}
