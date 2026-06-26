import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/* Scroll-reveal for inner pages — mirrors the home page's framer-motion entrance
   (expo-out, fade + rise) but driven by one shared IntersectionObserver so no
   page has to wire motion per element.

   Progressive enhancement: the `reveal-on` class is what arms the hidden initial
   state in CSS. We add it in useLayoutEffect (before paint, so there's no
   flash-of-visible-then-hidden) only when motion is allowed. If JS is disabled
   or the user prefers reduced motion, `reveal-on` is never added and every
   section renders fully visible. */

// Heroes are EXCLUDED from the 1s / bottom-15% timing — they always load in
// immediately and fully (as they did before), so the top of every page is never
// blank. The 1s-on-load rule applies only to the content BELOW the hero.
const HERO_SELECTOR = '.pg-hero, .services-hero, .sd-hero, .legal-head, .placeholder-page'
const SECTION_SELECTOR = '.pg-section, .services-section, .sd-section, .legal-section, .legal-cta'
const REVEAL_SELECTOR = `${HERO_SELECTOR}, ${SECTION_SELECTOR}`

export default function useReveal() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const root = document.documentElement
    root.classList.add('reveal-on')

    const openedAt = performance.now()
    const timers = []

    const observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            obs.unobserve(entry.target)
            // Heroes reveal immediately. Below-hero blocks on the first screen ease
            // in ~1s after the page opens (so a page never looks empty before you
            // scroll); blocks reached later by scrolling reveal immediately — by
            // then the 1s window has already passed.
            const isHero = entry.target.matches(HERO_SELECTOR)
            const wait = isHero ? 0 : Math.max(0, 1000 - (performance.now() - openedAt))
            if (wait > 16) timers.push(setTimeout(() => entry.target.classList.add('is-in'), wait))
            else entry.target.classList.add('is-in')
          }
        }
      },
      // Reveal the moment the element's TOP edge crosses the screen's bottom-15%
      // line — viewport-relative (%), so it behaves identically on any screen size
      // or aspect ratio. threshold:0 = fire on the first pixel that enters (the top
      // edge), rather than waiting for 10% of the block to show.
      { threshold: 0, rootMargin: '0px 0px -15% 0px' },
    )

    document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => observer.observe(el))

    return () => {
      observer.disconnect()
      timers.forEach(clearTimeout)
    }
  }, [pathname])
}
