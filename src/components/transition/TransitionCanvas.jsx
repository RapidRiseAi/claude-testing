import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getGlowDotTexture } from '../../utils/iconTextures'
import { transitionState } from './transitionState'
import { getTransitionShapes, fillFromCard, CARD_COLORS } from './transitionShapes'

/* Camera + framing. The object reads at ~half the screen height in the centre.
   CAM_Z is the distance to the orb plane (z=0), used for px→world anchoring. */
const CAM_Z = 7.5
const FOV = 40
const S_OBJ = 0.95           // uniform scale of the orb cloud → matches the live service/home object size
const BASE_SIZE = 0.045      // base gl_PointSize before per-orb + perspective (crisp, not bloomed)

/* Blend the four keyframes (source shape → sphere → exploded → dest shape)
   entirely on the GPU. `position` IS the centre-sphere; aFrom/aTo are the object
   shapes; aExplode is the per-orb outward burst vector. Each phase scalar ramps
   independently so the controller can overlap them for a seamless beat. */
const VERT = /* glsl */ `
  uniform float uGather, uSuck, uExplode, uReassemble;
  uniform float uSize, uScale, uTime;
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute vec3 aExplode;
  attribute float aSize;
  attribute float aSeed;
  varying float vTw;
  varying float vGlow;
  void main() {
    vec3 sphere = position;
    vec3 p = mix(aFrom, sphere, uGather);   // gather: object shape → sphere
    p *= (1.0 - 0.22 * uSuck);              // black hole: tighten toward centre
    p += aExplode * uExplode;               // explode: burst outward
    p = mix(p, aTo, uReassemble);           // reassemble: cloud → dest shape

    float tw = 0.5 + 0.5 * sin(uTime * 2.0 + aSeed * 30.0);
    vTw = tw;
    vGlow = uExplode;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float flare = 1.0 + uExplode * 1.8 + uSuck * 0.6;
    gl_PointSize = uSize * aSize * flare * (0.65 + tw * 0.35) * (uScale / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`

const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColorFrom, uColorTo, uColorHot;
  uniform float uOpacity, uReassemble, uExplode, uSuck;
  varying float vTw;
  varying float vGlow;
  void main() {
    vec4 tex = texture2D(uMap, gl_PointCoord);
    if (tex.a < 0.01) discard;
    // Object colour: source blue → destination blue across the reassemble.
    vec3 base = mix(uColorFrom, uColorTo, uReassemble);
    // White-hot ONLY at the peak of the burst; cools back to blue as the orbs
    // are pulled into the destination object (flare fades out with reassemble).
    float flare = clamp((uExplode + uSuck * 0.3) * (1.0 - uReassemble), 0.0, 1.0);
    vec3 col = mix(base, uColorHot, flare);
    float a = tex.a * uOpacity * (0.8 + vTw * 0.4);
    gl_FragColor = vec4(col * (1.0 + flare * 0.5), a);
  }`

/* ── Page-dissolve swarm ──────────────────────────────────────────────────────
   The page disintegrating into particles. At each transition the controller
   scans the source page's visible elements (rects + colours) into
   transitionState.pageCells; the swarm respawns its particles FROM those rects,
   tinted with those colours — so the real headline/buttons/cards visibly break
   into particles where they actually are, then spiral into the black-hole core.
   `position` holds world-space spawn points; the shader spirals them inward with
   gravitational acceleration. Driven by the SUCK phase only. */
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

/* px (viewport) → world offset on the z=0 plane, so the orb cloud can sit over
   the real object's on-screen position. The canvas is fixed/inset:0 so anchor
   px (from getBoundingClientRect / clientX) share the canvas pixel space. */
function anchorWorld(anchor, size) {
  if (!anchor) return { x: 0, y: 0 }
  const vH = 2 * CAM_Z * Math.tan((FOV * Math.PI) / 180 / 2)
  const vW = vH * (size.width / size.height)
  return {
    x: (anchor.x / size.width - 0.5) * vW,
    y: -(anchor.y / size.height - 0.5) * vH,
  }
}

function TransitionOrbs({ maxCount }) {
  const shapes = useMemo(() => getTransitionShapes(maxCount), [maxCount])
  const { size } = useThree()
  const tex = useMemo(() => getGlowDotTexture(), [])
  const groupRef = useRef()

  // Persistent attribute buffers; aFrom/aTo are refilled when the indices change.
  const aFrom = useMemo(() => new Float32Array(shapes.count * 3), [shapes])
  const aTo = useMemo(() => new Float32Array(shapes.count * 3), [shapes])
  const fromAttr = useRef()
  const toAttr = useRef()
  const lastFrom = useRef(-1)
  const lastTo = useRef(-1)

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: {
          uGather: { value: 0 },
          uSuck: { value: 0 },
          uExplode: { value: 0 },
          uReassemble: { value: 0 },
          uOpacity: { value: 0 },
          uSize: { value: BASE_SIZE },
          uScale: { value: size.height / 2 },
          uTime: { value: 0 },
          uMap: { value: tex },
          uColorFrom: { value: new THREE.Color(CARD_COLORS[0]) },
          uColorTo: { value: new THREE.Color(CARD_COLORS[0]) },
          uColorHot: { value: new THREE.Color('#eaf6ff') },
        },
      }),
    [tex, size.height],
  )

  useFrame(({ clock }, delta) => {
    const ts = transitionState
    const u = material.uniforms

    // Refill source / dest shapes when a new transition seeds new indices.
    if (lastFrom.current !== ts.fromIndex) {
      fillFromCard(aFrom, ts.fromIndex, shapes)
      if (fromAttr.current) fromAttr.current.needsUpdate = true
      u.uColorFrom.value.setStyle(CARD_COLORS[ts.fromIndex] ?? CARD_COLORS[0])
      lastFrom.current = ts.fromIndex
    }
    if (lastTo.current !== ts.toIndex) {
      fillFromCard(aTo, ts.toIndex, shapes)
      if (toAttr.current) toAttr.current.needsUpdate = true
      u.uColorTo.value.setStyle(CARD_COLORS[ts.toIndex] ?? CARD_COLORS[0])
      lastTo.current = ts.toIndex
    }

    u.uGather.value = ts.gather
    u.uSuck.value = ts.suck
    u.uExplode.value = ts.explode
    u.uReassemble.value = ts.reassemble
    u.uOpacity.value = ts.opacity
    u.uTime.value = clock.elapsedTime
    u.uScale.value = size.height / 2

    const g = groupRef.current
    if (g) {
      g.scale.setScalar(S_OBJ)
      // Anchor the cloud: gather pulls source→centre, reassemble pushes centre→dest.
      const src = anchorWorld(ts.srcAnchor, size)
      const dst = anchorWorld(ts.dstAnchor, size)
      let ox = 0, oy = 0
      if (ts.reassemble > 0.0001) {
        ox = dst.x * ts.reassemble
        oy = dst.y * ts.reassemble
      } else {
        ox = src.x * (1 - ts.gather)
        oy = src.y * (1 - ts.gather)
      }
      g.position.set(ox, oy, 0)
      // Spin: a slow idle turn, accelerating hard through the black hole + burst.
      g.rotation.y += delta * (0.25 + 3.0 * ts.suck + 1.6 * ts.explode)
      g.rotation.x = 0.12 * Math.sin(clock.elapsedTime * 0.4)
    }
  })

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={shapes.count}
            array={shapes.sphere}
            itemSize={3}
          />
          <bufferAttribute
            ref={fromAttr}
            attach="attributes-aFrom"
            count={shapes.count}
            array={aFrom}
            itemSize={3}
          />
          <bufferAttribute
            ref={toAttr}
            attach="attributes-aTo"
            count={shapes.count}
            array={aTo}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aExplode"
            count={shapes.count}
            array={shapes.explode}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aSize"
            count={shapes.count}
            array={shapes.sizes}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-aSeed"
            count={shapes.count}
            array={shapes.seeds}
            itemSize={1}
          />
        </bufferGeometry>
        <primitive object={material} attach="material" />
      </points>
    </group>
  )
}

/* Persistent full-screen overlay. frameloop flips to 'never' when idle so the
   second canvas costs zero GPU between transitions; 'always' while running. */
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
        <TransitionOrbs maxCount={maxCount} />
      </Canvas>
    </div>
  )
}
