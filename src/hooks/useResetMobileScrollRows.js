import { useEffect } from 'react'

const RESET_DELAYS = [60, 220, 520]

export default function useResetMobileScrollRows(rowSelector, mediaQuery = '(max-width: 760px)') {
  useEffect(() => {
    if (typeof window === 'undefined' || !rowSelector) return

    const media = window.matchMedia(mediaQuery)
    const timers = new Set()
    let frame = 0

    const reset = () => {
      if (!media.matches) return
      document.querySelectorAll(rowSelector).forEach((row) => {
        row.scrollLeft = 0
      })
    }

    const scheduleReset = () => {
      cancelAnimationFrame(frame)
      timers.forEach((timer) => window.clearTimeout(timer))
      timers.clear()
      frame = requestAnimationFrame(reset)
      RESET_DELAYS.forEach((delay) => {
        const timer = window.setTimeout(() => {
          timers.delete(timer)
          reset()
        }, delay)
        timers.add(timer)
      })
    }

    scheduleReset()
    window.addEventListener('pageshow', scheduleReset)
    window.addEventListener('resize', scheduleReset)
    if (media.addEventListener) media.addEventListener('change', scheduleReset)
    else media.addListener(scheduleReset)

    return () => {
      cancelAnimationFrame(frame)
      timers.forEach((timer) => window.clearTimeout(timer))
      window.removeEventListener('pageshow', scheduleReset)
      window.removeEventListener('resize', scheduleReset)
      if (media.removeEventListener) media.removeEventListener('change', scheduleReset)
      else media.removeListener(scheduleReset)
    }
  }, [rowSelector, mediaQuery])
}
