/**
 * ExpertiseParticles — one unified N=420 particle system that serves both:
 *
 *   Hero hand-off  (p 0.35 → 0.88)  — THREE STATES, fully reversible:
 *     Phase A (p 0.35→0.62): uMorphCore 0→1  — sphere surface → tight core
 *     Phase B (p 0.62→0.88): uMorphTarget 0→1 — tight core → active card shape
 *     Scrolling back simply reverses uMorphTarget then uMorphCore.
 *
 *   Card-change transition (~1 s total, only at p ≥ 0.88):
 *     Collapse: uMorphTarget 1→0  (COLLAPSE_DUR s, ease-in)
 *     Swap:     posTarget buffer swapped at uMorphTarget=0
 *     Expand:   uMorphTarget 0→1  (EXPAND_DUR s, ease-out)
 *     Visual: "orbs contract to a glowing core, then bloom into the new shape."
 *
 *   If scroll retreats below 0.88 mid-transition, the transition is aborted
 *   and scroll-driven values resume — the sphere fully reforms on scroll-up.
 *
 *   Reduced-motion: immediate buffer swap.
 *
 * Performance
 *   - Single <points> element; no per-frame position array writes except on
 *     card change (one Float32Array.set + needsUpdate = true).
 *   - Only group.position/scale, rotation.y, and material.uniforms change
 *     every frame.
 *   - Replaces the old CarouselOverlay (7 separate static point-clouds).
 */

import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { carouselState } from '../../utils/carouselState'
import { getGlowDotTexture } from '../../utils/iconTextures'

/* ── Mirror HeroOrb constants (never edit) ──────────────────────────────────── */
const R         = 1.70
const ORB_X     = 2.45
const ORB_Y     = 0.18
const END_X     = -3.3
const END_SCALE = 0.55

const N      = 420    // total particles
const MAX_OP = 0.94

const COLLAPSE_DUR = 0.35  // seconds — uMorphTarget 1→0 during card change
const EXPAND_DUR   = 0.68  // seconds — uMorphTarget 0→1 during card change

const REDUCED_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ══════════════════════════════════════════════════════════════════════════════
   GEOMETRY HELPERS
══════════════════════════════════════════════════════════════════════════════ */

function addLine(pts, x0,y0,z0, x1,y1,z1, n, jit=0.04) {
  for (let i=0; i<=n; i++) {
    const t = i/n
    pts.push(
      x0+(x1-x0)*t + (Math.random()-.5)*jit,
      y0+(y1-y0)*t + (Math.random()-.5)*jit,
      z0+(z1-z0)*t + (Math.random()-.5)*jit,
    )
  }
}

function addCircle(pts, cx,cy,cz, r, n, jit=0.028) {
  for (let i=0; i<n; i++) {
    const a = (i/n)*Math.PI*2
    pts.push(
      cx + Math.cos(a)*r + (Math.random()-.5)*jit,
      cy + Math.sin(a)*r + (Math.random()-.5)*jit,
      cz +                 (Math.random()-.5)*jit,
    )
  }
}

function addRect(pts, cx,cy,cz, hw,hh, ns,nh, jit=0.03) {
  for (let i=0; i<=ns; i++) {
    const t = i/ns
    pts.push(cx-hw+t*2*hw, cy+hh, cz+(Math.random()-.5)*jit)
    pts.push(cx-hw+t*2*hw, cy-hh, cz+(Math.random()-.5)*jit)
  }
  for (let i=0; i<=nh; i++) {
    const t = i/nh
    pts.push(cx-hw, cy-hh+t*2*hh, cz+(Math.random()-.5)*jit)
    pts.push(cx+hw, cy-hh+t*2*hh, cz+(Math.random()-.5)*jit)
  }
}

function addCubeEdges(pts, cx,cy,cz, s, ns=18, jit=0.022) {
  const c = [
    [-s,-s,-s],[s,-s,-s],[s,s,-s],[-s,s,-s],
    [-s,-s, s],[s,-s, s],[s,s, s],[-s,s, s],
  ]
  const edges = [
    [0,1],[1,2],[2,3],[3,0],
    [4,5],[5,6],[6,7],[7,4],
    [0,4],[1,5],[2,6],[3,7],
  ]
  for (const [a,b] of edges)
    addLine(pts, cx+c[a][0],cy+c[a][1],cz+c[a][2],
                 cx+c[b][0],cy+c[b][1],cz+c[b][2], ns, jit)
}

function addBezier(pts, p0,p1,p2,p3, n, jit=0.030) {
  for (let i=0; i<=n; i++) {
    const t=i/n, mt=1-t
    pts.push(
      mt*mt*mt*p0[0]+3*mt*mt*t*p1[0]+3*mt*t*t*p2[0]+t*t*t*p3[0] + (Math.random()-.5)*jit,
      mt*mt*mt*p0[1]+3*mt*mt*t*p1[1]+3*mt*t*t*p2[1]+t*t*t*p3[1] + (Math.random()-.5)*jit,
      mt*mt*mt*p0[2]+3*mt*mt*t*p1[2]+3*mt*t*t*p2[2]+t*t*t*p3[2] + (Math.random()-.5)*jit,
    )
  }
}

function padTo(pts, targetN) {
  while (pts.length < targetN*3)
    pts.push((Math.random()-.5)*0.06, (Math.random()-.5)*0.06, (Math.random()-.5)*0.06)
  return new Float32Array(pts.slice(0, targetN*3))
}

/* ══════════════════════════════════════════════════════════════════════════════
   SPHERE START STATE  — matches fading InteractiveMiniOrbs surface positions
══════════════════════════════════════════════════════════════════════════════ */
function genSphere() {
  const pts = []
  for (let i=0; i<N; i++) {
    const phi   = Math.acos(2*Math.random()-1)
    const theta = Math.random()*Math.PI*2
    const r     = R*(0.997 + Math.random()*0.005)
    pts.push(
      r*Math.sin(phi)*Math.cos(theta),
      r*Math.cos(phi),
      r*Math.sin(phi)*Math.sin(theta),
    )
  }
  return new Float32Array(pts)
}

/* ══════════════════════════════════════════════════════════════════════════════
   CORE STATE  — tight glowing cluster (intermediate morph state)
   Particles here overlap heavily under additive blending → bright core glow.
══════════════════════════════════════════════════════════════════════════════ */
function genCore() {
  const pts = new Float32Array(N * 3)
  for (let i=0; i<N; i++) {
    const phi   = Math.acos(2*Math.random()-1)
    const theta = Math.random()*Math.PI*2
    const r     = R * 0.055 * (0.4 + Math.random()*0.6)
    pts[i*3]   = r*Math.sin(phi)*Math.cos(theta)
    pts[i*3+1] = r*Math.cos(phi)
    pts[i*3+2] = r*Math.sin(phi)*Math.sin(theta)
  }
  return pts
}

/* ══════════════════════════════════════════════════════════════════════════════
   CARD SHAPE GENERATORS  — each returns exactly N×3 Float32Array
   All shapes have significant Z-depth so the slow auto-rotation reveals 3-D.
══════════════════════════════════════════════════════════════════════════════ */

/* 01 — Websites & SEO — extruded 3-D browser frame */
function genBrowserFrame() {
  const pts = []
  const W=R*.80, H=R*.70, D=R*.40
  addRect(pts, 0,0, D*.5,  W,H, 46,36, 0.025)
  addRect(pts, 0,0,-D*.5,  W*.90,H*.90, 40,30, 0.025)
  for (const [sx,sy] of [[1,1],[1,-1],[-1,1],[-1,-1]])
    addLine(pts, sx*W,sy*H,D*.5, sx*W*.90,sy*H*.90,-D*.5, 10, 0.015)
  addLine(pts, -W*.92,H*.58,D*.5+.02, W*.92,H*.58,D*.5+.02, 44, 0.015)
  for (let d=0; d<3; d++)
    addCircle(pts, -W*.68+d*W*.125, H*.77, D*.5+.02, W*.027, 9, 0.008)
  return padTo(pts, N)
}

/* 02 — Custom Software — cube inside a larger cube */
function genCommandCube() {
  const pts = []
  addCubeEdges(pts, 0,0,0, R*.82, 18, 0.024)
  addCubeEdges(pts, 0,0,0, R*.36, 10, 0.018)
  for (const x of[-1,1]) for (const y of[-1,1]) for (const z of[-1,1])
    addLine(pts, x*R*.82,y*R*.82,z*R*.82, x*R*.36,y*R*.36,z*R*.36, 4, 0.016)
  return padTo(pts, N)
}

/* 03 — App Development — three stacked phone panels with real Z offset */
function genAppStack() {
  const pts = []
  const pw=R*.36, ph=R*.74
  addRect(pts, -R*.18, 0,   R*.28, pw,   ph,   30,44, 0.022)
  addCircle(pts, -R*.18, ph*.84, R*.30,  R*.034, 10, 0.008)
  addLine(pts, -R*.18-pw*.62,-ph*.83,R*.29, -R*.18+pw*.62,-ph*.83,R*.29, 16, 0.012)
  addRect(pts,  R*.24,-R*.07,-R*.08, pw*.88,ph*.84, 22,36, 0.022)
  addCircle(pts,  R*.24, ph*.84*.84-R*.07,-R*.06, R*.030, 9, 0.008)
  addRect(pts,  R*.56,-R*.16,-R*.38, pw*.74,ph*.68, 16,26, 0.022)
  return padTo(pts, N)
}

/* 04 — Workflow Automation — S-curve with 3 circular glowing nodes */
function genWorkflowPath() {
  const pts = []
  const n0 = [-R*.56,-R*.72,-R*.04]
  const n1 = [ R*.06, R*.02, R*.10]
  const n2 = [ R*.60, R*.72, R*.04]
  for (const [nx,ny,nz] of [n0,n1,n2]) {
    addCircle(pts, nx,ny,nz, R*.130, 26, 0.018)
    addCircle(pts, nx,ny,nz, R*.058, 14, 0.012)
  }
  addBezier(pts, n0, [n0[0]+R*.28,n0[1]+R*.52,n0[2]], [n1[0]-R*.28,n1[1]-R*.40,n1[2]], n1, 52, 0.028)
  addBezier(pts, n1, [n1[0]+R*.26,n1[1]+R*.44,n1[2]], [n2[0]-R*.26,n2[1]-R*.42,n2[2]], n2, 52, 0.028)
  return padTo(pts, N)
}

/* 05 — AI Implementation — particle sphere core + tilted orbital ring + satellite */
function genIntelligenceOrbit() {
  const pts = []
  const cR=R*.36, oR=R*.84, tilt=Math.PI/5.5
  for (let i=0; i<108; i++) {
    const phi=Math.acos(2*Math.random()-1), theta=Math.random()*Math.PI*2
    const r=cR*(0.96+Math.random()*.08)
    pts.push(r*Math.sin(phi)*Math.cos(theta), r*Math.cos(phi), r*Math.sin(phi)*Math.sin(theta))
  }
  for (let i=0; i<76; i++) {
    const a = (i/76)*Math.PI*2
    pts.push(
      Math.cos(a)*oR                          + (Math.random()-.5)*.022,
      Math.sin(a)*oR*Math.sin(tilt)           + (Math.random()-.5)*.022,
      Math.sin(a)*oR*Math.cos(tilt)           + (Math.random()-.5)*.022,
    )
  }
  const satA = Math.PI*.42
  for (let k=0; k<14; k++) {
    const sa = satA + (Math.random()-.5)*.20
    const rr = oR*(1+(Math.random()-.5)*.06)
    pts.push(Math.cos(sa)*rr, Math.sin(sa)*rr*Math.sin(tilt), Math.sin(sa)*rr*Math.cos(tilt))
  }
  return padTo(pts, N)
}

/* 06 — Connected Ecosystems — central cube + 4 satellite cubes with connectors */
function genConnectedCubes() {
  const pts = []
  const cs=R*.26, ss=R*.18, dist=R*.80
  addCubeEdges(pts, 0,0,0, cs, 7, 0.018)
  const sats = [
    [ 0,      dist,  R*.08],
    [ 0,     -dist, -R*.08],
    [-dist,   0,     R*.10],
    [ dist,   0,    -R*.10],
  ]
  for (const [sx,sy,sz] of sats) {
    addCubeEdges(pts, sx,sy,sz, ss, 5, 0.014)
    const len = Math.sqrt(sx*sx+sy*sy+sz*sz)
    const nx=sx/len*cs, ny=sy/len*cs, nz=sz/len*cs
    addLine(pts, nx,ny,nz, sx-sx/len*ss, sy-sy/len*ss, sz-sz/len*ss, 10, 0.018)
  }
  return padTo(pts, N)
}

/* 07 — Managed Marketing Services — 3-D funnel */
function genFunnel() {
  const pts = []
  const topW=R*.82, botW=R*.12, topY=R*.70, botY=-R*.68, D=R*.30
  const H = topY-botY
  addLine(pts, -topW,topY, D*.5, -botW,botY, 0,  40, 0.038)
  addLine(pts,  topW,topY, D*.5,  botW,botY, 0,  40, 0.038)
  addLine(pts, -topW,topY, D*.5, topW,topY, D*.5, 52, 0.038)
  addLine(pts, -botW,botY, 0, botW,botY, 0, 12, 0.025)
  addLine(pts, -topW*.88,topY*.96,-D*.5, -botW*.88,botY*.96, 0, 28, 0.038)
  addLine(pts,  topW*.88,topY*.96,-D*.5,  botW*.88,botY*.96, 0, 28, 0.038)
  addLine(pts, -topW*.88,topY*.96,-D*.5,  topW*.88,topY*.96,-D*.5, 40, 0.038)
  for (let lv=1; lv<=2; lv++) {
    const t=lv/3, y=topY-H*t
    const wl=(topW+(botW-topW)*t)*.80, zl=D*.5*(1-t)
    addLine(pts, -wl,y,zl, wl,y,zl, Math.ceil(wl*11), 0.030)
  }
  for (let k=0; k<38; k++) {
    const t=Math.random(), y=topY-H*t
    const wl=(topW+(botW-topW)*t)*.68, zl=D*.5*(1-t)
    pts.push((Math.random()-.5)*wl*2, y, (Math.random()-.5)*zl*2 + zl*.5)
  }
  return padTo(pts, N)
}

/* ── Registry ────────────────────────────────────────────────────────────────── */
const GENERATORS = [
  genBrowserFrame,
  genCommandCube,
  genAppStack,
  genWorkflowPath,
  genIntelligenceOrbit,
  genConnectedCubes,
  genFunnel,
]

const COLORS = [
  '#68ccff',
  '#4ab8ff',
  '#78d4ff',
  '#5ab8ff',
  '#8ae0ff',
  '#54bbff',
  '#4caaff',
]

/* ── Three-state morph shader ───────────────────────────────────────────────────
   position   = sphere surface (starting state)
   aPosCore   = tight glowing cluster (intermediate state)
   aPosTarget = active card shape (final state, swapped on card change)

   uMorphCore   : 0 = sphere,  1 = core
   uMorphTarget : 0 = core,    1 = card

   Scroll drives: sphere → core → card as p goes 0.35 → 0.62 → 0.88
   Card change:   animates uMorphTarget 1→0→1 only (sphere never touched again)
   Scroll-back:   reverses both uniforms — sphere reforms fully.
 ────────────────────────────────────────────────────────────────────────────── */
const VERT = /* glsl */`
  attribute vec3 aPosCore;
  attribute vec3 aPosTarget;
  uniform float uMorphCore;
  uniform float uMorphTarget;
  uniform float uSize;
  uniform float uScale;
  varying float vZ;

  void main() {
    vec3 atCore = mix(position, aPosCore, uMorphCore);
    vec3 pos    = mix(atCore, aPosTarget, uMorphTarget);
    vZ          = pos.z;
    vec4 mv     = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uSize * (uScale / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`
const FRAG = /* glsl */`
  uniform sampler2D uMap;
  uniform vec3      uColor;
  uniform float     uOpacity;
  varying float     vZ;

  void main() {
    vec4 tex = texture2D(uMap, gl_PointCoord);
    if (tex.a < 0.01) discard;
    float bright = 0.75 + clamp(vZ * 0.17, -0.20, 0.25);
    gl_FragColor = vec4(uColor * bright, tex.a * uOpacity);
  }
`

/* ══════════════════════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
export default function ExpertiseParticles() {
  const groupRef  = useRef()
  const pointsRef = useRef()
  const scrollRef = useRef(0)
  const baseSRef  = useRef(1.0)

  // Transition state (mutated only in useFrame — no re-renders)
  const activeRef = useRef(0)
  const phaseRef  = useRef('idle')    // 'idle' | 'collapsing' | 'expanding' | 'crossfade'
  const timerRef  = useRef(0)
  const crossRef  = useRef(0)

  // Geometry: three position buffers
  const posSphere = useMemo(() => genSphere(), [])
  const posCore   = useMemo(() => genCore(),   [])
  const cardBufs  = useMemo(() => GENERATORS.map(g => g()), [])
  // posTarget is mutable — swapped in-place on card change
  const posTarget = useMemo(() => new Float32Array(cardBufs[0]), [cardBufs])

  const tex  = useMemo(() => getGlowDotTexture(), [])
  const { size } = useThree()

  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite:  false,
    depthTest:   false,
    blending:    THREE.AdditiveBlending,
    uniforms: {
      uMorphCore:   { value: 0 },
      uMorphTarget: { value: 0 },
      uSize:        { value: 0.090 },
      uScale:       { value: size.height / 2 },
      uMap:         { value: tex },
      uColor:       { value: new THREE.Color(COLORS[0]) },
      uOpacity:     { value: 0 },
    },
    vertexShader:   VERT,
    fragmentShader: FRAG,
  }), [tex, size.height])

  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = Math.min(1, Math.max(0, window.scrollY / window.innerHeight))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const p    = scrollRef.current
    const lerp = Math.min(1, delta * 8)
    const g    = groupRef.current

    /* ── Position mirrors HeroOrb scroll math ────────────────────────────── */
    g.position.x += (ORB_X + (END_X - ORB_X)*p - g.position.x) * lerp
    g.position.y += (ORB_Y * (1-p)              - g.position.y) * lerp

    /* ── Scroll-driven scale (no transition scale multiplier) ────────────── */
    const targetBaseS = 1.0 + (END_SCALE - 1.0)*p
    baseSRef.current += (targetBaseS - baseSRef.current) * lerp
    g.scale.setScalar(baseSRef.current)

    /* ── Slow Y rotation — makes 3-D depth visible ───────────────────────── */
    g.rotation.y += delta * 0.022

    /* ── Three-state scroll morph values ────────────────────────────────────
       coreT: sphere→core  at p 0.35→0.62
       cardT: core→card    at p 0.62→0.88
    ─────────────────────────────────────────────────────────────────────── */
    const coreT = Math.max(0, Math.min(1, (p - 0.35) / 0.27))
    const cardT = Math.max(0, Math.min(1, (p - 0.62) / 0.26))

    /* ── Abort transition if scroll retreats below 0.88 ─────────────────── */
    if (p < 0.88 && phaseRef.current !== 'idle') {
      phaseRef.current = 'idle'
      timerRef.current = 0
    }

    /* ── Silent card sync when still in sphere/core phase ───────────────── */
    const wanted = carouselState.activeCard
    if (wanted !== activeRef.current && p < 0.88) {
      activeRef.current = wanted
      posTarget.set(cardBufs[wanted])
      if (pointsRef.current?.geometry?.attributes?.aPosTarget)
        pointsRef.current.geometry.attributes.aPosTarget.needsUpdate = true
      material.uniforms.uColor.value.setStyle(COLORS[wanted])
    }

    /* ── Detect card change (only when fully in card mode and idle) ──────── */
    if (wanted !== activeRef.current && phaseRef.current === 'idle' && p >= 0.88) {
      phaseRef.current = REDUCED_MOTION ? 'crossfade' : 'collapsing'
      timerRef.current = 0
      crossRef.current = 0
    }

    timerRef.current += delta

    /* ── Advance transition phase ────────────────────────────────────────── */
    if (phaseRef.current === 'collapsing') {
      const t     = Math.min(1, timerRef.current / COLLAPSE_DUR)
      const eased = t * t  // ease-in
      material.uniforms.uMorphCore.value   = 1.0
      material.uniforms.uMorphTarget.value = 1.0 - eased  // 1→0

      if (t >= 1) {
        // Swap to latest requested card at the compact core moment
        activeRef.current = carouselState.activeCard
        posTarget.set(cardBufs[activeRef.current])
        if (pointsRef.current?.geometry?.attributes?.aPosTarget)
          pointsRef.current.geometry.attributes.aPosTarget.needsUpdate = true
        material.uniforms.uColor.value.setStyle(COLORS[activeRef.current])
        material.uniforms.uMorphTarget.value = 0.0
        phaseRef.current = 'expanding'
        timerRef.current = 0
      }
    } else if (phaseRef.current === 'expanding') {
      const t     = Math.min(1, timerRef.current / EXPAND_DUR)
      const eased = 1 - Math.pow(1 - t, 3)  // ease-out cubic
      material.uniforms.uMorphCore.value   = 1.0
      material.uniforms.uMorphTarget.value = eased  // 0→1

      if (t >= 1) {
        material.uniforms.uMorphTarget.value = 1.0
        phaseRef.current = 'idle'
        // Another card change arrived while expanding — immediately re-collapse
        if (carouselState.activeCard !== activeRef.current) {
          phaseRef.current = 'collapsing'
          timerRef.current = 0
        }
      }
    } else if (phaseRef.current === 'crossfade') {
      // Reduced-motion: swap at midpoint, no morph animation
      crossRef.current = Math.min(1, timerRef.current / 0.40)
      material.uniforms.uMorphCore.value   = 1.0
      material.uniforms.uMorphTarget.value = crossRef.current < 0.5 ? 0.0 : 1.0
      if (crossRef.current >= 0.5 && activeRef.current !== carouselState.activeCard) {
        activeRef.current = carouselState.activeCard
        posTarget.set(cardBufs[activeRef.current])
        if (pointsRef.current?.geometry?.attributes?.aPosTarget)
          pointsRef.current.geometry.attributes.aPosTarget.needsUpdate = true
        material.uniforms.uColor.value.setStyle(COLORS[activeRef.current])
      }
      if (crossRef.current >= 1) phaseRef.current = 'idle'
    } else {
      /* Idle: scroll drives both morph uniforms directly */
      material.uniforms.uMorphCore.value   = coreT
      material.uniforms.uMorphTarget.value = cardT
    }

    /* ── Opacity fades in as sphere begins collapsing (coreT 0→1) ────────── */
    material.uniforms.uOpacity.value = coreT * MAX_OP
    material.uniforms.uScale.value   = size.height / 2
  })

  return (
    <group ref={groupRef} position={[ORB_X, ORB_Y, 0]}>
      <points ref={pointsRef} renderOrder={12}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={N}
            array={posSphere}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aPosCore"
            count={N}
            array={posCore}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aPosTarget"
            count={N}
            array={posTarget}
            itemSize={3}
          />
        </bufferGeometry>
        <primitive object={material} attach="material" />
      </points>
    </group>
  )
}
