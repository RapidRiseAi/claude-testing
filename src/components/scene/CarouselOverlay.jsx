/**
 * CarouselOverlay — per-card 3-D particle overlay that renders inside/around
 * the HeroOrb cube at scroll progress ≈ 1.0.
 *
 * Strategy
 * ────────
 * • One group positioned/scaled to mirror HeroOrb's motion (same lerp math,
 *   independent scroll listener — HeroOrb's scrollState is module-private).
 * • 7 pre-generated Float32Array particle sets, one per card variant.
 * • Only the active variant is opaque; the previous one fades out simultaneously.
 * • The group does NOT rotate — the overlay serves as a stable inner-light
 *   layer while the cube rotates around it, which looks intentional.
 * • renderOrder 12 puts these above all HeroOrb layers (max 11 in FlowParticles).
 *
 * HeroOrb.jsx is NOT touched.
 */

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { carouselState } from '../../utils/carouselState'
import { getGlowDotTexture } from '../../utils/iconTextures'

/* ── Constants mirroring HeroOrb (do not edit — locked values) ───────────── */
const R     = 1.70
const ORB_X = 2.45
const ORB_Y = 0.18
const END_X = -3.3
const END_SCALE = 0.55

/* ── Variant particle generators ────────────────────────────────────────────
   All positions are in the group's local space (±R before group.scale).
   Aim for 160–240 points — readable without GPU cost.                       */

// 0 · Websites & SEO — webpage wireframe: 5 horizontal content rows
function genWebPortal() {
  const pts = []
  const W = R * 0.76, H = R * 0.72
  // Header bar
  for (let i = 0; i < 36; i++) pts.push(-W + 2*W*(i/35), H*0.73, (Math.random()-.5)*.14)
  // Nav / eyebrow
  for (let i = 0; i < 22; i++) pts.push(-W*.78 + W*1.56*(i/21), H*0.47, (Math.random()-.5)*.10)
  // Three content columns × 3 rows
  for (let col = 0; col < 3; col++) {
    const xc = W * (-0.56 + col * 0.56)
    for (let row = 0; row < 3; row++) {
      const yc = H * (0.12 - row * 0.32)
      for (let k = 0; k < 14; k++)
        pts.push(xc+(Math.random()-.5)*W*.30, yc+(Math.random()-.5)*.14, (Math.random()-.5)*.28)
    }
  }
  // CTA / form cluster bottom-right
  for (let k = 0; k < 20; k++)
    pts.push(W*.35+(Math.random()-.5)*W*.28, -H*.44+(Math.random()-.5)*.22, (Math.random()-.5)*.18)
  // Footer
  for (let i = 0; i < 26; i++) pts.push(-W*.64 + W*1.28*(i/25), -H*.76, (Math.random()-.5)*.09)
  return new Float32Array(pts)
}

// 1 · Custom Software — inner 3-D grid lattice (command-cube / OS core)
function genCommandCube() {
  const pts = []
  const N = 4, S = R * 0.50
  for (let x = 0; x < N; x++)
    for (let y = 0; y < N; y++)
      for (let z = 0; z < N; z++)
        pts.push((-1.5+x)*S+(Math.random()-.5)*.06, (-1.5+y)*S+(Math.random()-.5)*.06, (-1.5+z)*S+(Math.random()-.5)*.06)
  // Three dashboard planes at different depths
  for (let panel = 0; panel < 3; panel++) {
    const pz = (panel-1)*R*.44
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) {
        const px = (-1+i)*R*.50, py = (-1+j)*R*.42
        for (let k = 0; k < 6; k++)
          pts.push(px+(Math.random()-.5)*.18, py+(Math.random()-.5)*.14, pz+(Math.random()-.5)*.09)
      }
  }
  return new Float32Array(pts)
}

// 2 · App Development — three stacked screen rectangles in perspective
function genAppScreens() {
  const pts = []
  const addScreen = (cx,cy,cz,w,h,tY,fill) => {
    // Edges
    for (let i = 0; i < 22; i++) { const t=i/21; pts.push(cx-w/2+t*w, cy+h/2, cz+(t-.5)*w*Math.sin(tY)*.18) }
    for (let i = 0; i < 22; i++) { const t=i/21; pts.push(cx-w/2+t*w, cy-h/2, cz+(t-.5)*w*Math.sin(tY)*.18) }
    for (let i = 0; i < 14; i++) { const t=i/13; pts.push(cx-w/2, cy-h/2+t*h, cz-w/2*Math.sin(tY)*.18) }
    for (let i = 0; i < 14; i++) { const t=i/13; pts.push(cx+w/2, cy-h/2+t*h, cz+w/2*Math.sin(tY)*.18) }
    // Interior fill
    for (let k = 0; k < fill; k++)
      pts.push(cx+(Math.random()-.5)*w*.88, cy+(Math.random()-.5)*h*.84, cz+(Math.random()-.5)*.22)
  }
  addScreen(-0.18, 0.12, 0.05, R*.70, R*1.05, 0.14, 30)
  addScreen( 0.82,-0.28,-0.38, R*.44, R*.68, 0.24, 16)
  addScreen(-0.88,-0.36,-0.32, R*.34, R*.52,-0.18, 10)
  return new Float32Array(pts)
}

// 3 · Workflow Automation — four horizontal lanes with connecting nodes
function genFlowTunnel() {
  const pts = []
  const W = R * 0.80
  const numLanes = 4
  for (let lane = 0; lane < numLanes; lane++) {
    const y = (-1.5 + lane) * R * 0.36
    for (let k = 0; k < 32; k++)
      pts.push(-W + 2*W*(k/31), y+(Math.random()-.5)*.11, (Math.random()-.5)*.30)
  }
  // Vertical connectors
  const xSteps = 5
  for (let s = 0; s < xSteps; s++) {
    const x = -W*.72 + W*1.44*(s/(xSteps-1))
    for (let k = 0; k < 9; k++)
      pts.push(x+(Math.random()-.5)*.07, -R*.52+R*1.04*(k/8), (Math.random()-.5)*.18)
  }
  // Intersection node dots
  for (let s = 0; s < xSteps; s++) {
    const x = -W*.72 + W*1.44*(s/(xSteps-1))
    for (let lane = 0; lane < numLanes; lane++)
      pts.push(x, (-1.5+lane)*R*.36, (Math.random()-.5)*.12)
  }
  return new Float32Array(pts)
}

// 4 · AI Implementation — radial neural core, 8 branches
function genNeuralCore() {
  const pts = []
  // Central cluster
  for (let k = 0; k < 28; k++) {
    const r = Math.random()*.28, phi = Math.random()*Math.PI*2, th = Math.acos(2*Math.random()-1)
    pts.push(r*Math.sin(th)*Math.cos(phi), r*Math.sin(th)*Math.sin(phi), r*Math.cos(th))
  }
  // 8 branches
  const dirs = [[.7,.7,0],[-.7,.7,0],[.7,-.7,0],[-.7,-.7,0],[0,.9,.5],[0,-.9,.5],[.9,0,-.4],[-.9,0,-.4]]
  for (const [bx,by,bz] of dirs) {
    const len = Math.sqrt(bx*bx+by*by+bz*bz)
    const ex=bx/len*R*.82, ey=by/len*R*.82, ez=bz/len*R*.82
    for (let k = 0; k < 16; k++) {
      const t = k/15
      pts.push(ex*t+(Math.random()-.5)*.07, ey*t+(Math.random()-.5)*.07, ez*t+(Math.random()-.5)*.07)
    }
    for (let k = 0; k < 8; k++)
      pts.push(ex+(Math.random()-.5)*.20, ey+(Math.random()-.5)*.20, ez+(Math.random()-.5)*.20)
  }
  return new Float32Array(pts)
}

// 5 · Connected Ecosystems — central hub + 6 satellite nodes with connectors
function genConnectedNodes() {
  const pts = []
  // Central hub
  for (let k = 0; k < 22; k++) {
    const r = Math.random()*.24, phi = Math.random()*Math.PI*2, th = Math.acos(2*Math.random()-1)
    pts.push(r*Math.sin(th)*Math.cos(phi), r*Math.sin(th)*Math.sin(phi), r*Math.cos(th))
  }
  const nodes = [
    [ R*.70, 0, 0],[-R*.70, 0, 0],
    [0, R*.70, 0],[0,-R*.70, 0],
    [ R*.44, 0, R*.58],[-R*.44, 0,-R*.58],
  ]
  for (const [nx,ny,nz] of nodes) {
    for (let k = 0; k < 14; k++)
      pts.push(nx+(Math.random()-.5)*.20, ny+(Math.random()-.5)*.20, nz+(Math.random()-.5)*.20)
    for (let k = 0; k < 12; k++) {
      const t = k/11
      pts.push(nx*t+(Math.random()-.5)*.05, ny*t+(Math.random()-.5)*.05, nz*t+(Math.random()-.5)*.05)
    }
  }
  // Inter-node connections (ring)
  for (let a = 0; a < nodes.length; a++) {
    const [ax,ay,az] = nodes[a], [bx,by,bz] = nodes[(a+1)%nodes.length]
    for (let k = 0; k < 8; k++) {
      const t = k/7
      pts.push(ax+(bx-ax)*t+(Math.random()-.5)*.06, ay+(by-ay)*t+(Math.random()-.5)*.06, az+(bz-az)*t+(Math.random()-.5)*.06)
    }
  }
  return new Float32Array(pts)
}

// 6 · Managed Marketing Services — converging funnel, rising signal line
function genGrowthFunnel() {
  const pts = []
  const levels = 7
  for (let lv = 0; lv < levels; lv++) {
    const t   = lv / (levels - 1)
    const y   = R * (.70 - t * 1.40)
    const rad = R * (.82 - t * .62)
    const count = Math.floor(26 + (1-t) * 20)
    for (let k = 0; k < count; k++) {
      const angle = (k / count) * Math.PI * 2
      const r = rad * (.60 + Math.random() * .40)
      pts.push(r*Math.cos(angle), y+(Math.random()-.5)*.13, r*Math.sin(angle)*.48)
    }
  }
  // Rising signal line right side
  for (let k = 0; k < 24; k++) {
    const t = k/23
    pts.push(R*(.10 + t*.52)+(Math.random()-.5)*.07, -R*.58 + t*R*1.26+(Math.random()-.5)*.09, (Math.random()-.5)*.18)
  }
  return new Float32Array(pts)
}

const GENERATORS = [
  genWebPortal, genCommandCube, genAppScreens, genFlowTunnel,
  genNeuralCore, genConnectedNodes, genGrowthFunnel,
]

/* Per-variant visual tuning */
const COLORS = [
  '#5cc4ff', // 0 web-portal
  '#4ab8ff', // 1 command-cube
  '#7dd4ff', // 2 app-screens
  '#38a8ff', // 3 flow-tunnel
  '#88e0ff', // 4 neural
  '#52baff', // 5 ecosystems
  '#46a4ff', // 6 marketing
]
const SIZES = [0.074, 0.068, 0.076, 0.070, 0.066, 0.072, 0.070]
const MAX_OPACITY = 0.78

/* ── Component ──────────────────────────────────────────────────────────────── */
export default function CarouselOverlay() {
  const groupRef   = useRef()
  const matRefs    = useRef([])
  const scrollRef  = useRef(0)
  const activeRef  = useRef(0)
  const prevRef    = useRef(0)
  const transRef   = useRef(1.0)   // 0 = mid-transition, 1 = settled

  // Own scroll listener — mirrors HeroOrb's scrollState math without touching it
  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = Math.min(1, Math.max(0, window.scrollY / window.innerHeight))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Pre-generate all 7 variant position arrays once
  const variants = useMemo(() => GENERATORS.map(g => g()), [])

  const tex = useMemo(() => getGlowDotTexture(), [])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    // ── Mirror HeroOrb position / scale ───────────────────────────────────────
    const p = scrollRef.current
    const lerpAmt   = Math.min(1, delta * 8)
    const targetX   = ORB_X + (END_X - ORB_X) * p
    const targetY   = ORB_Y * (1 - p)
    const targetS   = 1.0 + (END_SCALE - 1.0) * p
    const g = groupRef.current
    g.position.x += (targetX - g.position.x) * lerpAmt
    g.position.y += (targetY - g.position.y) * lerpAmt
    const curS = g.scale.x
    g.scale.setScalar(curS + (targetS - curS) * lerpAmt)

    // Only visible once cube is mostly formed (scroll > 0.80)
    const scrollVis = Math.max(0, Math.min(1, (p - 0.80) / 0.20))

    // ── Card-change transition ─────────────────────────────────────────────────
    const current = carouselState.activeCard
    if (activeRef.current !== current) {
      prevRef.current   = activeRef.current
      activeRef.current = current
      transRef.current  = 0
    }
    transRef.current = Math.min(1, transRef.current + delta * 2.0) // ~500 ms

    // ── Per-variant opacity ────────────────────────────────────────────────────
    const tr = transRef.current
    for (let i = 0; i < 7; i++) {
      const mat = matRefs.current[i]
      if (!mat) continue
      let op = 0
      if (i === activeRef.current)                              op = scrollVis * tr * MAX_OPACITY
      else if (i === prevRef.current && activeRef.current !== prevRef.current)
                                                                op = scrollVis * (1 - tr) * MAX_OPACITY
      mat.opacity  = op
      mat.visible  = op > 0.005
    }
  })

  return (
    <group ref={groupRef} position={[ORB_X, ORB_Y, 0]}>
      {variants.map((positions, i) => (
        <points key={i} renderOrder={12}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={positions.length / 3}
              array={positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            ref={el => { matRefs.current[i] = el }}
            size={SIZES[i]}
            map={tex}
            color={COLORS[i]}
            sizeAttenuation
            transparent
            opacity={0}
            visible={false}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            depthTest={false}
            alphaTest={0.01}
          />
        </points>
      ))}
    </group>
  )
}
