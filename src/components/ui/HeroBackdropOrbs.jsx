import './HeroBackdropOrbs.css'

/* Ambient depth layer for the whole home page — a field of soft, slowly drifting
   orbs that stay pinned to the viewport behind the content as you scroll (see the
   CSS for the fixed/z-index layering vs the 3-D object + wave). Purely decorative
   (aria-hidden, pointer-events:none) and it freezes under prefers-reduced-motion.
   Tune ORB_COUNT + the ranges below to taste. */

const ORB_COUNT = 48

/* Stable GLSL-style hash → deterministic "random" in [0,1). Using this instead of
   Math.random() keeps the field identical on every render, so the orbs never
   reshuffle or flicker when the hero re-renders, while still looking scattered. */
const rand = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/* RGB triplets only — alpha is driven by each orb's animated opacity below. */
const TINTS = {
  blue:  '120, 170, 250',
  white: '220, 234, 255',
  cyan:  '140, 205, 255',
}
// Weighted toward blue/white so the field matches the brand and stays quiet.
const TINT_KEYS = ['blue', 'white', 'cyan', 'blue', 'white']

const ORBS = Array.from({ length: ORB_COUNT }, (_, i) => {
  const r = (k) => rand(i * 7 + k)
  const size = 3 + r(0) * 5                 // 3–8px — small, star-like
  const peak = 0.14 + r(1) * 0.20           // 0.14–0.34 peak opacity (subtle)
  const tint = TINT_KEYS[Math.floor(r(2) * TINT_KEYS.length)]
  return {
    left:   4 + r(3) * 92,                  // %
    top:    6 + r(4) * 86,                  // %
    size,
    dx:    (r(5) - 0.5) * 36,               // ±18px slow drift
    dy:    (r(6) - 0.5) * 30,               // ±15px
    dur:    16 + r(7) * 13,                 // 16–29s per drift cycle
    tw:     7 + r(8) * 6,                   // 7–13s twinkle
    dDelay: -r(9) * 24,                     // negative delays desync drift starts
    tDelay: -r(2) * 12,                     // …and twinkle starts
    oMax:   peak,
    oMin:   peak * 0.45,
    rgb:    TINTS[tint],
  }
})

export default function HeroBackdropOrbs() {
  return (
    <div className="hero-orbs" aria-hidden="true">
      {ORBS.map((o, i) => (
        <span
          key={i}
          className="hero-orb"
          style={{
            left: `${o.left}%`,
            top: `${o.top}%`,
            width: `${o.size}px`,
            height: `${o.size}px`,
            '--core': `rgb(${o.rgb})`,
            '--dx': `${o.dx}px`,
            '--dy': `${o.dy}px`,
            '--dur': `${o.dur}s`,
            '--tw': `${o.tw}s`,
            '--d-delay': `${o.dDelay}s`,
            '--t-delay': `${o.tDelay}s`,
            '--o-min': o.oMin,
            '--o-max': o.oMax,
          }}
        />
      ))}
    </div>
  )
}
