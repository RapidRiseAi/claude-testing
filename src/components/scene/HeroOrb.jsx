import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import {
  buildSoccerBall, greatCircleArc, circleOnSphere, fibonacciSphere,
} from '../../utils/soccerBall'
import { createIconTexture, getGlowDotTexture } from '../../utils/iconTextures'

const R = 2.0

// ── Build all geometry once at module level ────────────────────────────────────
const { vertices, edges, vertexTriangles, pentagonCenters, hexCenters } = buildSoccerBall()

// For each pentagon, find its 5 nearest truncated-icosahedron vertices
// These are the corners of the pentagonal face — the "spoke endpoints"
const pentNeighborVerts = pentagonCenters.map(pc =>
  vertices
    .map((v, i) => ({ i, d: pc.distanceTo(v) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 5)
    .map(x => x.i)
)

// Adjacent pentagon pairs — icosahedron edges — 30 total
// These become the explicit service-to-service ecosystem connection arcs
const icoEdgeLen = (() => {
  let m = Infinity
  for (let i = 0; i < pentagonCenters.length; i++)
    for (let j = i + 1; j < pentagonCenters.length; j++) {
      const d = pentagonCenters[i].distanceTo(pentagonCenters[j])
      if (d < m) m = d
    }
  return m
})()

const pentAdjPairs = (() => {
  const e = []
  for (let i = 0; i < pentagonCenters.length; i++)
    for (let j = i + 1; j < pentagonCenters.length; j++)
      if (pentagonCenters[i].distanceTo(pentagonCenters[j]) < icoEdgeLen * 1.05)
        e.push([i, j])
  return e
})()

// ── Fresnel rim glow shell ─────────────────────────────────────────────────────
const FRAG = `
  uniform vec3  glowColor;
  uniform float power;
  uniform float intensity;
  varying vec3  vN;
  varying vec3  vV;
  void main() {
    float rim = 1.0 - max(dot(vN, vV), 0.0);
    rim = pow(rim, power) * intensity;
    gl_FragColor = vec4(glowColor, rim);
  }
`
const VERT = `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

function FresnelRim({ radius, color, power, intensity }) {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    side: THREE.FrontSide,
    uniforms: {
      glowColor: { value: new THREE.Color(color) },
      power:     { value: power },
      intensity: { value: intensity },
    },
    vertexShader: VERT, fragmentShader: FRAG,
  }), [color, power, intensity])

  return (
    <mesh renderOrder={12}>
      <sphereGeometry args={[radius, 64, 64]} />
      <primitive object={mat} attach="material" />
    </mesh>
  )
}

// ── Dark glass core — occluder so back-side icons are hidden ──────────────────
// Writes to depth buffer; icon planes with depthTest:true get clipped on back side
function DarkGlassCore() {
  return (
    <mesh renderOrder={-2}>
      <sphereGeometry args={[R * 0.98, 64, 64]} />
      <meshBasicMaterial
        color="#01060f"
        transparent
        opacity={0.88}
        depthWrite={true}
        side={THREE.FrontSide}
        blending={THREE.NormalBlending}
      />
    </mesh>
  )
}

// ── Tight localized glow sprite ────────────────────────────────────────────────
function OrbGlow() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 512
    const ctx = c.getContext('2d')
    const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
    g.addColorStop(0,    'rgba(0, 120, 255, 0.45)')
    g.addColorStop(0.18, 'rgba(0,  90, 220, 0.26)')
    g.addColorStop(0.38, 'rgba(0,  55, 160, 0.12)')
    g.addColorStop(0.62, 'rgba(0,  22,  80, 0.04)')
    g.addColorStop(1,    'rgba(0,   0,  20, 0.00)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 512)
    return new THREE.CanvasTexture(c)
  }, [])
  const s = R * 2.8
  return (
    <sprite scale={[s, s, 1]} position={[0, 0, -0.3]}>
      <spriteMaterial map={tex} transparent blending={THREE.AdditiveBlending}
        depthWrite={false} depthTest={false} />
    </sprite>
  )
}

// ── Soccer ball edge grid — 90 great circle arcs ───────────────────────────────
function SoccerGrid() {
  const geo = useMemo(() => {
    const pts = []
    edges.forEach(([i, j]) => {
      const arc = greatCircleArc(vertices[i], vertices[j], R, 36)
      for (let k = 0; k < arc.length - 1; k++) pts.push(...arc[k], ...arc[k + 1])
    })
    const arr = new Float32Array(pts)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    return g
  }, [])

  return (
    <lineSegments geometry={geo} renderOrder={3}>
      <lineBasicMaterial color="#5abfee" transparent opacity={0.55}
        blending={THREE.AdditiveBlending} depthWrite={false} />
    </lineSegments>
  )
}

// Inner vertex-triangle web
function VertexTriangleGrid() {
  const geo = useMemo(() => {
    const pts = []
    vertexTriangles.forEach(midpoints => {
      const n = midpoints.length
      for (let k = 0; k < n; k++) {
        const a = midpoints[k]
        const b = midpoints[(k + 1) % n]
        const arc = greatCircleArc(a.clone().multiplyScalar(R), b.clone().multiplyScalar(R), R, 14)
        for (let m = 0; m < arc.length - 1; m++) pts.push(...arc[m], ...arc[m + 1])
      }
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3))
    return g
  }, [])
  return (
    <lineSegments geometry={geo} renderOrder={2}>
      <lineBasicMaterial color="#1f5f9a" transparent opacity={0.32}
        blending={THREE.AdditiveBlending} depthWrite={false} />
    </lineSegments>
  )
}

// ── SERVICE CONNECTION ARCS — pentagon-to-pentagon great circle arcs ──────────
// These make the ecosystem connections explicit: every service is wired to others
function ServiceConnectionArcs() {
  const geo = useMemo(() => {
    const pts = []
    pentAdjPairs.forEach(([i, j]) => {
      const arc = greatCircleArc(pentagonCenters[i], pentagonCenters[j], R * 1.003, 28)
      for (let k = 0; k < arc.length - 1; k++) pts.push(...arc[k], ...arc[k + 1])
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3))
    return g
  }, [])
  return (
    <lineSegments geometry={geo} renderOrder={4}>
      <lineBasicMaterial color="#6dd4ff" transparent opacity={0.42}
        blending={THREE.AdditiveBlending} depthWrite={false} />
    </lineSegments>
  )
}

// ── NODE SPOKES — arcs from each icon center to its 5 grid vertex neighbors ───
// This visually WIRES each service icon into the surrounding network
function NodeSpokes() {
  const geo = useMemo(() => {
    const pts = []
    pentagonCenters.forEach((pc, pi) => {
      pentNeighborVerts[pi].forEach(vi => {
        // Arc from pentagon center to the truncated-icosahedron vertex
        const arc = greatCircleArc(pc, vertices[vi], R * 1.002, 18)
        for (let k = 0; k < arc.length - 1; k++) pts.push(...arc[k], ...arc[k + 1])
      })
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3))
    return g
  }, [])
  return (
    <lineSegments geometry={geo} renderOrder={5}>
      <lineBasicMaterial color="#8de8ff" transparent opacity={0.68}
        blending={THREE.AdditiveBlending} depthWrite={false} />
    </lineSegments>
  )
}

// ── SURFACE PARTICLE MATRIX — Fibonacci sphere for digital-skin effect ─────────
function SurfaceDots() {
  const tex = getGlowDotTexture()
  const arr = useMemo(() => fibonacciSphere(1100, R * 1.001), [])
  const count = arr.length / 3
  return (
    <points renderOrder={2}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={arr} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.030} map={tex} color="#3d88bb" sizeAttenuation transparent
        opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} alphaTest={0.01} />
    </points>
  )
}

// ── GRID JUNCTION DOTS — bright dots at every truncated icosahedron vertex ─────
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
    <points renderOrder={5}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={vertices.length} array={arr} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.20} map={tex} color="#c8eeff" sizeAttenuation transparent
        opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} alphaTest={0.01} />
    </points>
  )
}

// Hexagon center fine dots
function HexCenterDots() {
  const tex = getGlowDotTexture()
  const arr = useMemo(() => {
    const out = new Float32Array(hexCenters.length * 3)
    hexCenters.forEach((p, i) => {
      out[i * 3] = p.x * R; out[i * 3 + 1] = p.y * R; out[i * 3 + 2] = p.z * R
    })
    return out
  }, [])
  return (
    <points renderOrder={4}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={hexCenters.length} array={arr} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.10} map={tex} color="#5aabdd" sizeAttenuation transparent
        opacity={0.75} blending={THREE.AdditiveBlending} depthWrite={false} alphaTest={0.01} />
    </points>
  )
}

// Edge midpoint connector dots
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
    <points renderOrder={4}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={arr} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.07} map={tex} color="#4aabde" sizeAttenuation transparent
        opacity={0.65} blending={THREE.AdditiveBlending} depthWrite={false} alphaTest={0.01} />
    </points>
  )
}

// NODE SPOKE ENDPOINT DOTS — bright dots exactly where spokes meet the grid
// These look like "connection terminals" where the icon plugs into the network
function SpokeEndpointDots() {
  const tex = getGlowDotTexture()
  const arr = useMemo(() => {
    const pts = []
    pentagonCenters.forEach((pc, pi) => {
      pentNeighborVerts[pi].forEach(vi => {
        const v = vertices[vi]
        pts.push(v.x * R, v.y * R, v.z * R)
      })
    })
    return new Float32Array(pts)
  }, [])
  const count = arr.length / 3
  return (
    <points renderOrder={6}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={arr} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.28} map={tex} color="#ffffff" sizeAttenuation transparent
        opacity={0.90} blending={THREE.AdditiveBlending} depthWrite={false} alphaTest={0.01} />
    </points>
  )
}

// SERVICE NODE ANCHOR DOTS — bright center anchor at each icon position
function PentagonAnchorDots() {
  const tex = getGlowDotTexture()
  const arr = useMemo(() => {
    const out = new Float32Array(pentagonCenters.length * 3)
    pentagonCenters.forEach((p, i) => {
      out[i * 3] = p.x * R * 1.002
      out[i * 3 + 1] = p.y * R * 1.002
      out[i * 3 + 2] = p.z * R * 1.002
    })
    return out
  }, [])
  return (
    <points renderOrder={8}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={pentagonCenters.length} array={arr} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.32} map={tex} color="#ffffff" sizeAttenuation transparent
        opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} alphaTest={0.01} />
    </points>
  )
}

// CLUSTER PARTICLES — denser particles around each service icon node
function NodeClusterDots() {
  const tex = getGlowDotTexture()
  const arr = useMemo(() => {
    const perNode = 22
    const pts = []
    pentagonCenters.forEach(pc => {
      for (let k = 0; k < perNode; k++) {
        // Random offset within ~0.22 rad of the pentagon center on the sphere
        const alpha = Math.random() * 0.22
        const phi = Math.random() * Math.PI * 2
        // Build an orthogonal frame
        const n = pc.clone().normalize()
        const ref = Math.abs(n.y) > 0.85 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)
        const e1 = new THREE.Vector3().crossVectors(n, ref).normalize()
        const e2 = new THREE.Vector3().crossVectors(e1, n).normalize()
        const pt = n.clone()
          .multiplyScalar(Math.cos(alpha))
          .addScaledVector(e1, Math.sin(alpha) * Math.cos(phi))
          .addScaledVector(e2, Math.sin(alpha) * Math.sin(phi))
          .normalize()
          .multiplyScalar(R * (1.0 + Math.random() * 0.01))
        pts.push(pt.x, pt.y, pt.z)
      }
    })
    return new Float32Array(pts)
  }, [])
  const count = arr.length / 3
  return (
    <points renderOrder={7}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={arr} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.042} map={tex} color="#8bd8ff" sizeAttenuation transparent
        opacity={0.72} blending={THREE.AdditiveBlending} depthWrite={false} alphaTest={0.01} />
    </points>
  )
}

// Inner volume depth particles
function InnerDepthDots() {
  const tex = getGlowDotTexture()
  const arr = useMemo(() => {
    const count = 180
    const out = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = (0.3 + Math.random() * 0.6) * R
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
    <points renderOrder={1}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={arr} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.025} map={tex} color="#1a3d7a" sizeAttenuation transparent
        opacity={0.38} blending={THREE.AdditiveBlending} depthWrite={false} alphaTest={0.01} />
    </points>
  )
}

// ── ICON NODE HALOS — one thin inner ring + one dotted outer ring ─────────────
// Keep these subtle — the spoke lines and cluster dots provide the rest

function NodeInnerRings() {
  const lines = useMemo(() =>
    pentagonCenters.map((c, i) => ({
      key: `ni${i}`,
      pts: circleOnSphere(c, 0.148, R * 1.002),
    }))
  , [])
  return (
    <group>
      {lines.map(({ key, pts }) => (
        <Line key={key} points={pts} color="#78d8ff" lineWidth={1.2}
          transparent opacity={0.72} blending={THREE.AdditiveBlending}
          depthWrite={false} renderOrder={6} />
      ))}
    </group>
  )
}

// Dotted outer halo — rendered as tiny dot particles on a circle
function NodeOuterHaloDots() {
  const tex = getGlowDotTexture()
  const arr = useMemo(() => {
    const perRing = 32
    const pts = []
    pentagonCenters.forEach(c => {
      const ring = circleOnSphere(c, 0.240, R * 1.002, perRing - 1)
      for (let k = 0; k < perRing; k++) {
        const idx = k % ring.length
        pts.push(ring[idx][0], ring[idx][1], ring[idx][2])
      }
    })
    return new Float32Array(pts)
  }, [])
  const count = arr.length / 3
  return (
    <points renderOrder={7}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={arr} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.048} map={tex} color="#90e4ff" sizeAttenuation transparent
        opacity={0.78} blending={THREE.AdditiveBlending} depthWrite={false} alphaTest={0.01} />
    </points>
  )
}

// Animated breathing outer ring
function PulsatingRings() {
  const groupRef = useRef()
  const phases = useMemo(() =>
    pentagonCenters.map((_, i) => (i / pentagonCenters.length) * Math.PI * 2)
  , [])
  const ringPts = useMemo(() => pentagonCenters.map(c => circleOnSphere(c, 0.175, R * 1.003)), [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.children.forEach((child, i) => {
      child.material.opacity = 0.12 + 0.28 * (0.5 + 0.5 * Math.sin(t * 1.05 + phases[i]))
    })
  })

  return (
    <group ref={groupRef}>
      {ringPts.map((pts, i) => (
        <Line key={i} points={pts} color="#aaf0ff" lineWidth={0.8}
          transparent opacity={0.2} blending={THREE.AdditiveBlending}
          depthWrite={false} renderOrder={8} />
      ))}
    </group>
  )
}

// ── ICON PLANES — embedded service node with depthTest for proper occlusion ────
function IconPlane({ center, texIndex }) {
  const tex = useMemo(() => createIconTexture(texIndex), [texIndex])

  const position = useMemo(() =>
    center.clone().multiplyScalar(R * 1.004)
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
      renderOrder={7}
    >
      <planeGeometry args={[0.80, 0.80]} />
      <meshBasicMaterial
        map={tex}
        transparent
        alphaTest={0.01}
        depthTest={true}
        depthWrite={false}
        side={THREE.FrontSide}
        blending={THREE.NormalBlending}
      />
    </mesh>
  )
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────
export default function HeroOrb() {
  const groupRef = useRef()

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.050
  })

  return (
    <group>
      {/* Localized glow — stays behind and around orb only */}
      <OrbGlow />

      <group ref={groupRef}>
        {/* Dark glass occluder — hides back-side icon planes naturally */}
        <DarkGlassCore />

        {/* ── Deepest layer: inner atmosphere ── */}
        <InnerDepthDots />

        {/* ── Surface: Fibonacci particle matrix ── */}
        <SurfaceDots />

        {/* ── Grid structure layers ── */}
        <VertexTriangleGrid />
        <SoccerGrid />

        {/* ── Ecosystem: service-to-service connection arcs ── */}
        <ServiceConnectionArcs />

        {/* ── Hub connectivity: spokes wiring each icon into the grid ── */}
        <NodeSpokes />

        {/* ── Junction dots: at grid intersections and spoke endpoints ── */}
        <EdgeMidpointDots />
        <HexCenterDots />
        <VertexGlowDots />
        <SpokeEndpointDots />

        {/* ── Icon node halos: thin ring + dotted ring ── */}
        <NodeInnerRings />
        <NodeOuterHaloDots />

        {/* ── Cluster particles around icon hubs ── */}
        <NodeClusterDots />

        {/* ── Service icon planes (depthTest:true — occluded on back side) ── */}
        {pentagonCenters.map((c, i) => (
          <IconPlane key={i} center={c} texIndex={i} />
        ))}

        {/* ── Pulsating rings and anchor dots on top ── */}
        <PulsatingRings />
        <PentagonAnchorDots />

        {/* ── Fresnel rim — defines the glass sphere boundary, rendered last ── */}
        <FresnelRim radius={R}         color="#00a8ff" power={2.4} intensity={1.45} />
        <FresnelRim radius={R * 1.010} color="#c0eeff" power={5.8} intensity={1.80} />
        <FresnelRim radius={R * 1.022} color="#0055cc" power={1.5} intensity={0.50} />
      </group>
    </group>
  )
}
