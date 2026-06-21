import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getGlowDotTexture } from '../../utils/iconTextures'
import { transitionState } from './transitionState'

/* Camera + framing for the swarm. CAM_Z is the distance to the z=0 plane, used to
   map page px → world for the spawn points. */
const CAM_Z = 7.5
const FOV = 40

/* ── Page-dissolve swarm ──────────────────────────────────────────────────────
   The PAGE disintegrating into particles (the OBJECT morph is done by the one
   persistent HeroOrb — see worldState / HeroOrb's transition branch). At each
   transition the controller scans the source page's visible elements (rects +
   colours) into transitionState.pageCells; the swarm respawns its particles FROM
   those rects, tinted with those colours — so the real headline/buttons/cards
   visibly break into particles where they actually are, then spiral into the
   black-hole core. Driven by the SUCK phase only. */
const SWARM_VERT = /* glsl */ `
  uniform float uImplode, uTime, uScale, uSize, uOpacity;
  attribute float aSeed, aSizeS;
  attribute vec3 aColor;
  varying float vA;
  varying float vHot;
  varying vec3 vCol;
  void main() {
    vec2 home = position.xy;                               // world-space spawn point
    float r0 = length(home) + 1e-4;
    float ang0 = atan(home.y, home.x);
    float pull = uImplode * uImplode * uImplode;           // accelerate inward
    float r = r0 * (1.0 - pull);
    float swirl = uImplode * (2.2 + 3.4 / (r0 * 0.25 + 0.4)) + aSeed * 6.2831;
    float ang = ang0 + swirl + uTime * 0.12;
    vec3 p = vec3(cos(ang) * r, sin(ang) * r, position.z * (1.0 - pull));

    float fin = smoothstep(0.0, 0.10, uImplode);           // appear as the page dissolves
    float fout = 1.0 - smoothstep(0.84, 1.0, uImplode);    // consumed at the core
    vA = uOpacity * fin * fout;
    vHot = pull;
    vCol = aColor;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float accel = 1.0 + pull * 1.8;                         // brighten + grow as they rush in
    gl_PointSize = uSize * aSizeS * accel * (uScale / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`

const SWARM_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColorHot;
  varying float vA;
  varying float vHot;
  varying vec3 vCol;
  void main() {
    vec4 tex = texture2D(uMap, gl_PointCoord);
    if (tex.a < 0.01) discard;
    vec3 col = mix(vCol, uColorHot, clamp(vHot * 0.85, 0.0, 1.0));  // element colour → white-hot core
    gl_FragColor = vec4(col * (1.0 + vHot * 0.5), tex.a * vA);
  }`

function SwarmPoints({ count }) {
  const { size } = useThree()
  const tex = useMemo(() => getGlowDotTexture(), [])
  const homeAttr = useRef()
  const colorAttr = useRef()
  const lastSeed = useRef(-1)

  const { home, color, seeds, sizes } = useMemo(() => {
    const home = new Float32Array(count * 3)
    const color = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      seeds[i] = Math.random()
      sizes[i] = 0.7 + Math.random() * 0.7
      color[i * 3] = 0.45; color[i * 3 + 1] = 0.72; color[i * 3 + 2] = 1.0
    }
    return { home, color, seeds, sizes }
  }, [count])

  // Respawn the swarm from the scanned page cells (or a viewport-fill fallback).
  const respawn = (cells) => {
    const vH = 2 * CAM_Z * Math.tan((FOV * Math.PI) / 180 / 2)
    const vW = vH * (size.width / size.height)
    const toWorldX = (px) => (px / size.width - 0.5) * vW
    const toWorldY = (py) => -(py / size.height - 0.5) * vH
    let total = 0
    const cum = []
    if (cells && cells.length) { for (const c of cells) { total += c.area; cum.push(total) } }
    for (let k = 0; k < count; k++) {
      let px, py, r, g, b
      if (total > 0) {
        const t = Math.random() * total
        let ci = 0
        while (ci < cum.length - 1 && cum[ci] < t) ci++
        const c = cells[ci]
        px = c.x + Math.random() * c.w
        py = c.y + Math.random() * c.h
        r = c.r / 255; g = c.g / 255; b = c.b / 255
      } else {
        px = Math.random() * size.width
        py = Math.random() * size.height
        r = 0.45; g = 0.72; b = 1.0
      }
      home[k * 3] = toWorldX(px)
      home[k * 3 + 1] = toWorldY(py)
      home[k * 3 + 2] = (Math.random() - 0.5) * 1.5
      color[k * 3] = r; color[k * 3 + 1] = g; color[k * 3 + 2] = b
    }
    if (homeAttr.current) homeAttr.current.needsUpdate = true
    if (colorAttr.current) colorAttr.current.needsUpdate = true
  }

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        vertexShader: SWARM_VERT,
        fragmentShader: SWARM_FRAG,
        uniforms: {
          uImplode: { value: 0 },
          uOpacity: { value: 0 },
          uTime: { value: 0 },
          uScale: { value: size.height / 2 },
          uSize: { value: 0.05 },
          uMap: { value: tex },
          uColorHot: { value: new THREE.Color('#eaf6ff') },
        },
      }),
    [tex, size.height],
  )

  useFrame(({ clock }) => {
    const ts = transitionState
    const u = material.uniforms
    if (ts.swarmSeedId !== lastSeed.current) {
      lastSeed.current = ts.swarmSeedId
      respawn(ts.pageCells)
    }
    u.uScale.value = size.height / 2
    u.uTime.value = clock.elapsedTime
    u.uImplode.value = ts.suck
    // Visible only through the suck; gone before the explosion builds the new page.
    u.uOpacity.value = ts.suck > 0 ? 1 - ts.explode : 0
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute ref={homeAttr} attach="attributes-position" count={count} array={home} itemSize={3} />
        <bufferAttribute ref={colorAttr} attach="attributes-aColor" count={count} array={color} itemSize={3} />
        <bufferAttribute attach="attributes-aSeed" count={count} array={seeds} itemSize={1} />
        <bufferAttribute attach="attributes-aSizeS" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <primitive object={material} attach="material" />
    </points>
  )
}

/* Persistent full-screen overlay. Now it ONLY draws the page-dissolve swarm — the
   OBJECT morph is done by the one persistent HeroOrb itself. frameloop flips to
   'never' when idle so it costs zero GPU between transitions. */
export default function TransitionCanvas({ active, maxCount }) {
  return (
    <div className={`transition-canvas${active ? ' is-active' : ''}`} aria-hidden="true">
      <Canvas
        frameloop={active ? 'always' : 'never'}
        camera={{ position: [0, 0, CAM_Z], fov: FOV }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <SwarmPoints count={Math.round(maxCount * 0.45)} />
      </Canvas>
    </div>
  )
}
