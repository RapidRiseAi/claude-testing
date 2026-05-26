import { useEffect, useRef } from 'react'

export default function useScrollSnap() {
  const lockRef = useRef(false)

  useEffect(() => {
    const getSections = () =>
      Array.from(document.querySelectorAll('#scroll-content section'))

    const snapTo = (direction) => {
      if (lockRef.current) return
      const sections = getSections()
      if (!sections.length) return

      const scrollY = window.scrollY
      const vh = window.innerHeight

      let currentIndex = 0
      for (let i = 0; i < sections.length; i++) {
        if (scrollY >= sections[i].offsetTop - vh * 0.3) {
          currentIndex = i
        }
      }

      const targetIndex =
        direction > 0
          ? Math.min(currentIndex + 1, sections.length - 1)
          : Math.max(currentIndex - 1, 0)

      if (targetIndex === currentIndex) return

      lockRef.current = true
      window.scrollTo({ top: sections[targetIndex].offsetTop, behavior: 'smooth' })
      setTimeout(() => { lockRef.current = false }, 1050)
    }

    const onWheel = (e) => {
      e.preventDefault()
      snapTo(e.deltaY)
    }

    let touchStartY = 0
    const onTouchStart = (e) => { touchStartY = e.touches[0].clientY }
    const onTouchEnd = (e) => {
      const delta = touchStartY - e.changedTouches[0].clientY
      if (Math.abs(delta) > 40) snapTo(delta)
    }

    const onKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); snapTo(1) }
      if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); snapTo(-1) }
    }

    window.addEventListener('wheel',      onWheel,      { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend',   onTouchEnd,   { passive: true })
    window.addEventListener('keydown',    onKeyDown)

    return () => {
      window.removeEventListener('wheel',      onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend',   onTouchEnd)
      window.removeEventListener('keydown',    onKeyDown)
    }
  }, [])
}
