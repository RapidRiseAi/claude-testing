/**
 * PricingHelix — Section 3 ambient background object.
 *
 * Reuses the exact orb particle language from Section 2's last object
 * (CarouselOverlay): the same glow-dot texture, additive blending, and
 * cyan/blue palette — rearranged into a tall vertical helix that twists
 * upward on the far-left edge of the Fixed Pricing section.
 *
 * Performance-conscious:
 *   · ~250 particles only (no heavy storm)
 *   · IntersectionObserver pauses the render loop when off-screen
 *   · Not mounted at all on small screens (no WebGL cost on mobile)
 *   · Sits BEHIND the cards and never captures pointer events
 */

import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo, useState, useEffect } from 'react'
import * as THREE from 'three'
import { getGlowDotTexture } from '../../utils/iconTextures'

/* Mirror the CarouselOverlay cyan/blue palette so the orbs read as the
   "same" particles, simply rearranged into a new form. */
const COLORS = ['#62c8ff', '#4ab8ff', '#78d4ff', '#8ae0ff', '#56bcff']

const HEIGHT  = 7.4   // vertical span (slightly taller than view → clipped top/bottom)
const RADIUS  = 1.06
const TURNS   = 3.1
const STRANDS = 2
const PER     = 92

/* Build a sparse double-helix point cloud with a faint central thread and a
   few ambient floaters for depth. */
function buildHelix() {
  const pos = []
  const col = []
  const c = new THREE.Color()

  const push = (x, y, z, hex) => {
    pos.push(x, y, z)
    c.set(hex); col.push(c.r, c.g, c.b)
  }

  // Two intertwined strands
  for (let s = 0; s < STRANDS; s++) {
    const phase = (s / STRANDS) * Math.PI * 2
    for (let i = 0; i < PER; i++) {
      const t = i / (PER - 1)
      const a = phase + t * TURNS * Math.PI * 2
      const r = RADIUS * (0.80 + 0.20 * Math.sin(t * Math.PI)) // gentle mid bulge
      const y = (t - 0.5) * HEIGHT
      push(
        Math.cos(a) * r + (Math.random() - 0.5) * 0.05,
        y          + (Math.random() - 0.5) * 0.05,
        Math.sin(a) * r + (Math.random() - 0.5) * 0.05,
        COLORS[(s * 2 + (i % 2)) % COLORS.length],
      )
    }
  }

  // Faint shimmer thread down the axis
  for (let i = 0; i < 30; i++) {
    const t = i / 29
    push(
      (Math.random() - 0.5) * 0.22,
      (t - 0.5) * HEIGHT,
      (Math.random() - 0.5) * 0.22,
      '#4ab8ff',
    )
  }

  // Sparse ambient floaters around the helix
  for (let i = 0; i < 36; i++) {
    const a = Math.random() * Math.PI * 2
    const r = RADIUS * (1.25 + Math.random() * 0.95)
    push(
      Math.cos(a) * r,
      (Math.random() - 0.5) * HEIGHT * 1.04,
      Math.sin(a) * r,
      COLORS[(Math.random() * COLORS.length) | 0],
    )
  }

  return { positions: new Float32Array(pos), colors: new Float32Array(col) }
}

function Helix() {
  const ref = useRef()
  const { positions, colors } = useMemo(buildHelix, [])
  const tex = useMemo(() => getGlowDotTexture(), [])

  useFrame((state, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * 0.11                                  // slow twist
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.16 // gentle bob
  })

  return (
    <points ref={ref} position={[-1.25, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.22}
        map={tex}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.82}
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
        alphaTest={0.01}
      />
    </points>
  )
}

export default function PricingHelix() {
  const wrapRef = useRef()
  const [enabled, setEnabled] = useState(false) // desktop/tablet only
  const [inView, setInView]   = useState(false) // pause loop off-screen

  // Desktop only — no WebGL context below the 4-column breakpoint (the helix
  // is hidden via CSS there too, so this avoids any wasted render work).
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(max-width: 1100px)')
    const apply = () => setEnabled(!mq.matches)
    apply()
    mq.addEventListener?.('change', apply)
    return () => mq.removeEventListener?.('change', apply)
  }, [])

  // Only render frames while the section is near the viewport.
  useEffect(() => {
    if (!enabled || !wrapRef.current) return
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '250px' },
    )
    io.observe(wrapRef.current)
    return () => io.disconnect()
  }, [enabled])

  return (
    <div className="fp-helix" aria-hidden="true" ref={wrapRef}>
      {enabled && (
        <Canvas
          frameloop={inView ? 'always' : 'never'}
          camera={{ position: [0, 0, 8.6], fov: 42 }}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          dpr={[1, 1.5]}
        >
          <Helix />
        </Canvas>
      )}
    </div>
  )
}
