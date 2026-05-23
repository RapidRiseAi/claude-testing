import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import {
  buildSoccerBall, greatCircleArc, circleOnSphere, fibonacciSphere,
} from '../../utils/soccerBall'
import { createIconTexture, getGlowDotTexture } from '../../utils/iconTextures'

const R = 2.1

// ── Build all geometry once at module level ───────────────────────────────────
const { vertices, edges, adj, vertexTriangles, pentagonCenters, hexCenters } = buildSoccerBall()

// ── Glow sprite ───────────────────────────────────────────────────────────────
function OrbGlow() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 512
    const ctx = c.getContext('2d')
    const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
    g.addColorStop(0,    'rgba(0, 150, 255, 1.00)')
    g.addColorStop(0.10, 'rgba(0, 120, 255, 0.85)')
    g.addColorStop(0.25, 'rgba(0,  90, 230, 0.55)')
    g.addColorStop(0.45, 'rgba(0,  55, 180, 0.28)')
    g.addColorStop(0.68, 'rgba(0,  28, 120, 0.10)')
    g.addColorStop(1,    'rgba(0,   8,  55, 0.00)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 512)
    return new THREE.CanvasTexture(c)
  }, [])
  const s = R * 6.5
  return (
    <sprite scale={[s, s, 1]}>
      <spriteMaterial
        map={tex}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        depthTest={false}
      />
    </sprite>
  )
}

// Secondary softer glow halo — wider, dimmer
function OrbHalo() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 256
    const ctx = c.getContext('2d')
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    g.addColorStop(0,    'rgba(0, 80, 200, 0.30)')
    g.addColorStop(0.40, 'rgba(0, 50, 160, 0.12)')
    g.addColorStop(0.75, 'rgba(0, 20,  90, 0.04)')
    g.addColorStop(1,    'rgba(0,  0,  30, 0.00)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256)
    return new THREE.CanvasTexture(c)
  }, [])
  const s = R * 10.5
  return (
    <sprite scale={[s, s, 1]}>
      <spriteMaterial
        map={tex}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        depthTest={false}
      />
    </sprite>
  )
}

// ── Soccer ball edge grid — all 90 edges as great circle arcs ────────────────
function SoccerGrid() {
  const { positions, count } = useMemo(() => {
    const pts = []
    edges.forEach(([i, j]) => {
      const arc = greatCircleArc(vertices[i], vertices[j], R, 32)
      for (let k = 0; k < arc.length - 1; k++) pts.push(...arc[k], ...arc[k + 1])
    })
    return { positions: new Float32Array(pts), count: pts.length / 3 }
  }, [])

  return (
    <lineSegments renderOrder={1}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial
        color="#00aaff"
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  )
}

// Brighter, thicker secondary grid pass for the primary lines (adds glow depth)
function SoccerGridBright() {
  const { positions, count } = useMemo(() => {
    const pts = []
    edges.forEach(([i, j]) => {
      const arc = greatCircleArc(vertices[i], vertices[j], R * 1.001, 20)
      for (let k = 0; k < arc.length - 1; k++) pts.push(...arc[k], ...arc[k + 1])
    })
    return { positions: new Float32Array(pts), count: pts.length / 3 }
  }, [])

  return (
    <lineSegments renderOrder={2}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial
        color="#55ddff"
        transparent
        opacity={0.30}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  )
}

// ── Vertex triangles — inner web of 60 small triangles at each vertex ─────────
function VertexTriangleGrid() {
  const { positions, count } = useMemo(() => {
    const pts = []
    vertexTriangles.forEach(midpoints => {
      const n = midpoints.length
      for (let k = 0; k < n; k++) {
        const a = midpoints[k]
        const b = midpoints[(k + 1) % n]
        const arc = greatCircleArc(
          a.clone().multiplyScalar(R),
          b.clone().multiplyScalar(R),
          R, 16
        )
        for (let m = 0; m < arc.length - 1; m++) pts.push(...arc[m], ...arc[m + 1])
      }
    })
    return { positions: new Float32Array(pts), count: pts.length / 3 }
  }, [])

  return (
    <lineSegments renderOrder={1}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial
        color="#0077cc"
        transparent
        opacity={0.50}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  )
}

// ── Pentagon node rings ────────────────────────────────────────────────────────
function NodeRings() {
  const ringLines = useMemo(() =>
    pentagonCenters.flatMap((c, idx) => [
      { key: `${idx}a`, pts: circleOnSphere(c, 0.175, R),    color: '#00ccff', w: 2.2 },
      { key: `${idx}b`, pts: circleOnSphere(c, 0.310, R),    color: '#0099dd', w: 1.2 },
      { key: `${idx}c`, pts: circleOnSphere(c, 0.340, R * 1.001), color: '#0055aa', w: 0.8 },
    ])
  , [])

  return (
    <group>
      {ringLines.map(({ key, pts, color, w }) => (
        <Line
          key={key}
          points={pts}
          color={color}
          lineWidth={w}
          transparent
          opacity={0.92}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          renderOrder={3}
        />
      ))}
    </group>
  )
}

// ── Hexagon center subtle rings ────────────────────────────────────────────────
function HexRings() {
  const rings = useMemo(() =>
    hexCenters.map((c, idx) => ({
      key: `h${idx}`,
      pts: circleOnSphere(c, 0.18, R),
    }))
  , [])

  return (
    <group>
      {rings.map(({ key, pts }) => (
        <Line
          key={key}
          points={pts}
          color="#003d7a"
          lineWidth={0.6}
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          renderOrder={1}
        />
      ))}
    </group>
  )
}

// ── Multi-layer dot field ──────────────────────────────────────────────────────

// Large bright vertex glow dots
function VertexGlowDots() {
  const tex = getGlowDotTexture()
  const arr = useMemo(() => {
    const out = new Float32Array(vertices.length * 3)
    vertices.forEach((v, i) => {
      out[i * 3] = v.x * R; out[i * 3 + 1] = v.y * R; out[i * 3 + 2] = v.z * R
    })
    return out
  }, [])
  return (
    <points renderOrder={4}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={vertices.length} array={arr} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.38}
        map={tex}
        color="#aaeeff"
        sizeAttenuation
        transparent
        opacity={1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        alphaTest={0.01}
      />
    </points>
  )
}

// Pentagon center bright anchor dots
function PentagonDots() {
  const tex = getGlowDotTexture()
  const arr = useMemo(() => {
    const out = new Float32Array(pentagonCenters.length * 3)
    pentagonCenters.forEach((p, i) => {
      out[i * 3] = p.x * R; out[i * 3 + 1] = p.y * R; out[i * 3 + 2] = p.z * R
    })
    return out
  }, [])
  return (
    <points renderOrder={5}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={pentagonCenters.length} array={arr} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.52}
        map={tex}
        color="#ffffff"
        sizeAttenuation
        transparent
        opacity={0.95}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        alphaTest={0.01}
      />
    </points>
  )
}

// Edge midpoint fine dots
function EdgeMidpointDots() {
  const tex = getGlowDotTexture()
  const arr = useMemo(() => {
    const pts = []
    edges.forEach(([i, j]) => {
      const mid = vertices[i].clone().add(vertices[j]).normalize()
      pts.push(mid.x * R, mid.y * R, mid.z * R)
    })
    return new Float32Array(pts)
  }, [])
  const count = arr.length / 3
  return (
    <points renderOrder={3}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={arr} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        map={tex}
        color="#55bbff"
        sizeAttenuation
        transparent
        opacity={0.80}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        alphaTest={0.01}
      />
    </points>
  )
}

// Dense Fibonacci surface haze dots
function SurfaceDots() {
  const tex = getGlowDotTexture()
  const arr = useMemo(() => fibonacciSphere(420, R), [])
  const count = arr.length / 3
  return (
    <points renderOrder={1}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={arr} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        map={tex}
        color="#0066bb"
        sizeAttenuation
        transparent
        opacity={0.55}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        alphaTest={0.01}
      />
    </points>
  )
}

// Inner volume particle cloud — gives depth and volume
function InnerParticles() {
  const tex = getGlowDotTexture()
  const arr = useMemo(() => {
    const count = 600
    const out = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Uniform random inside sphere of radius R*0.92
      const r = Math.cbrt(Math.random()) * R * 0.92
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = Math.random() * Math.PI * 2
      out[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      out[i * 3 + 1] = r * Math.cos(phi)
      out[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    return out
  }, [])
  const count = arr.length / 3
  return (
    <points renderOrder={0}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={arr} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        map={tex}
        color="#003d88"
        sizeAttenuation
        transparent
        opacity={0.45}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        alphaTest={0.01}
      />
    </points>
  )
}

// ── Icon planes — true 3D geometry on sphere surface ─────────────────────────
function IconPlane({ center, texIndex }) {
  const tex = useMemo(() => createIconTexture(texIndex), [texIndex])

  const position = useMemo(() =>
    center.clone().multiplyScalar(R * 0.940)
  , [center])

  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion()
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), center.clone().normalize())
    return q
  }, [center])

  return (
    <mesh
      position={position.toArray()}
      quaternion={quaternion.toArray()}
      renderOrder={6}
    >
      <planeGeometry args={[0.92, 0.92]} />
      <meshBasicMaterial
        map={tex}
        transparent
        alphaTest={0.01}
        depthTest={true}
        depthWrite={true}
        side={THREE.FrontSide}
      />
    </mesh>
  )
}

// ── Animated pulse ring at each pentagon — draws attention to icon nodes ──────
function PulsatingNodeRings() {
  const groupRef = useRef()
  const ringsData = useMemo(() => pentagonCenters.map((c, i) => ({
    center: c,
    phase: (i / pentagonCenters.length) * Math.PI * 2,
  })), [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.children.forEach((child, i) => {
      const { phase } = ringsData[i]
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.4 + phase)
      child.material.opacity = pulse * 0.6
    })
  })

  const ringPts = useMemo(() =>
    pentagonCenters.map(c => circleOnSphere(c, 0.230, R))
  , [])

  return (
    <group ref={groupRef}>
      {ringPts.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color="#00ffff"
          lineWidth={1.4}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          renderOrder={4}
        />
      ))}
    </group>
  )
}

// ── Equatorial band accent rings ───────────────────────────────────────────────
function AccentRings() {
  const rings = useMemo(() => [
    { center: new THREE.Vector3(0, 1, 0), alpha: Math.PI / 2,   color: '#003399', w: 0.7, opacity: 0.35 },
    { center: new THREE.Vector3(1, 0, 0), alpha: Math.PI / 2,   color: '#002288', w: 0.5, opacity: 0.25 },
    { center: new THREE.Vector3(0, 0, 1), alpha: Math.PI / 2,   color: '#002288', w: 0.5, opacity: 0.25 },
  ], [])

  const lines = useMemo(() => rings.map((r, i) => ({
    ...r,
    pts: circleOnSphere(r.center, r.alpha, R * 1.002),
    key: `ar${i}`,
  })), [rings])

  return (
    <group>
      {lines.map(({ key, pts, color, w, opacity }) => (
        <Line
          key={key}
          points={pts}
          color={color}
          lineWidth={w}
          transparent
          opacity={opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          renderOrder={0}
        />
      ))}
    </group>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function HeroOrb() {
  const groupRef = useRef()

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.065
  })

  return (
    <group>
      {/* Glows outside the rotating group so they stay stationary */}
      <OrbHalo />
      <OrbGlow />

      <group ref={groupRef}>
        {/* Main soccer ball edge grid */}
        <SoccerGrid />
        <SoccerGridBright />

        {/* Inner vertex triangle web */}
        <VertexTriangleGrid />

        {/* Hexagon and pentagon rings */}
        <HexRings />
        <NodeRings />

        {/* Equatorial accent circles */}
        <AccentRings />

        {/* Dot layers — from inner to outer */}
        <InnerParticles />
        <SurfaceDots />
        <EdgeMidpointDots />
        <VertexGlowDots />
        <PentagonDots />

        {/* Pulsating rings behind icons */}
        <PulsatingNodeRings />

        {/* Icons embedded as flat planes on sphere surface */}
        {pentagonCenters.map((c, i) => (
          <IconPlane key={i} center={c} texIndex={i} />
        ))}
      </group>
    </group>
  )
}
