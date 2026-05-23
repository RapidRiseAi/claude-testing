import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import {
  buildSoccerBall, greatCircleArc, circleOnSphere, fibonacciSphere,
} from '../../utils/soccerBall'
import { createIconTexture, getGlowDotTexture } from '../../utils/iconTextures'

const R = 2.0

const { vertices, edges, pentagonCenters, hexCenters } = buildSoccerBall()

const pentNeighborVerts = pentagonCenters.map(pc =>
  vertices
    .map((v, i) => ({ i, d: pc.distanceTo(v) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 5)
    .map(x => x.i)
)

// ── Fresnel rim shader ────────────────────────────────────────────────────────
const FRAG_RIM = `
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
const VERT_RIM = `
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
    transparent: true, depthWrite: false, depthTest: false,
    blending: THREE.AdditiveBlending, side: THREE.FrontSide,
    uniforms: {
      glowColor: { value: new THREE.Color(color) },
      power:     { value: power },
      intensity: { value: intensity },
    },
    vertexShader: VERT_RIM, fragmentShader: FRAG_RIM,
  }), [color, power, intensity])
  return (
    <mesh renderOrder={20}>
      <sphereGeometry args={[radius, 96, 96]} />
      <primitive object={mat} attach="material" />
    </mesh>
  )
}

// Faint atmospheric core — writes depth so back icons are occluded,
// but only adds a very subtle deep-navy tint
function AtmosphereCore() {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: true, depthTest: true,
    side: THREE.FrontSide, blending: THREE.NormalBlending,
    uniforms: {},
    vertexShader: `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying vec3 vN; varying vec3 vV;
      void main() {
        float facing = max(dot(vN, vV), 0.0);
        float core   = pow(facing, 1.2);
        float alpha  = 0.28 * core;
        vec3 col = vec3(0.004, 0.018, 0.050);
        gl_FragColor = vec4(col, alpha);
      }
    `,
  }), [])
  return (
    <mesh renderOrder={-3}>
      <sphereGeometry args={[R * 0.985, 96, 96]} />
      <primitive object={mat} attach="material" />
    </mesh>
  )
}

// Soft orb glow sprite behind the sphere
function OrbGlow() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 512
    const ctx = c.getContext('2d')
    const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
    g.addColorStop(0,    'rgba(0, 130, 255, 0.42)')
    g.addColorStop(0.20, 'rgba(0,  95, 220, 0.22)')
    g.addColorStop(0.42, 'rgba(0,  55, 160, 0.08)')
    g.addColorStop(0.68, 'rgba(0,  22,  80, 0.02)')
    g.addColorStop(1,    'rgba(0,   0,  20, 0.00)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 512)
    return new THREE.CanvasTexture(c)
  }, [])
  const s = R * 2.95
  return (
    <sprite scale={[s, s, 1]} position={[0, 0, -0.35]}>
      <spriteMaterial map={tex} transparent blending={THREE.AdditiveBlending}
        depthWrite={false} depthTest={false} />
    </sprite>
  )
}

// ── Curve sampling helpers ────────────────────────────────────────────────────

// Convert an arc (array of [x,y,z] points) into line-segment positions
function arcToSegments(arc, out) {
  for (let k = 0; k < arc.length - 1; k++) {
    out.push(arc[k][0], arc[k][1], arc[k][2])
    out.push(arc[k + 1][0], arc[k + 1][1], arc[k + 1][2])
  }
}

// Convert an arc into DOTTED line segments — every other pair
function arcToDottedSegments(arc, out) {
  for (let k = 0; k < arc.length - 1; k += 2) {
    out.push(arc[k][0], arc[k][1], arc[k][2])
    out.push(arc[k + 1][0], arc[k + 1][1], arc[k + 1][2])
  }
}

// Vertex colors: brighter at front (positive eye-z after rotation),
// fading toward the back so back-side curves read as faint depth
function buildVertexColors(positionsArr, colorFront, colorBack, mix = 0.65) {
  const n = positionsArr.length / 3
  const cols = new Float32Array(n * 3)
  const front = new THREE.Color(colorFront)
  const back  = new THREE.Color(colorBack)
  for (let i = 0; i < n; i++) {
    // Use local z as a proxy for facing (will be roughly correct under rotation)
    const z = positionsArr[i * 3 + 2]
    // Normalize z in roughly [-R, R] to [0,1], emphasize front
    const t = THREE.MathUtils.clamp((z / R) * 0.5 + 0.5, 0, 1)
    const k = Math.pow(t, 1.6) * mix + (1 - mix)
    cols[i * 3]     = THREE.MathUtils.lerp(back.r, front.r, k)
    cols[i * 3 + 1] = THREE.MathUtils.lerp(back.g, front.g, k)
    cols[i * 3 + 2] = THREE.MathUtils.lerp(back.b, front.b, k)
  }
  return cols
}

// ── Reusable additive line layer (with optional vertex colors) ────────────────
function AdditiveLines({ positions, color, opacity, renderOrder = 3, vertexColors = false, colorFront, colorBack }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    if (vertexColors) {
      const cols = buildVertexColors(positions, colorFront ?? color, colorBack ?? '#02132e')
      g.setAttribute('color', new THREE.BufferAttribute(cols, 3))
    }
    return g
  }, [positions, vertexColors, colorFront, colorBack, color])
  return (
    <lineSegments geometry={geo} renderOrder={renderOrder}>
      <lineBasicMaterial
        color={vertexColors ? '#ffffff' : color}
        vertexColors={vertexColors}
        transparent opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false} depthTest={false}
      />
    </lineSegments>
  )
}

// ── PRIMARY CURVED NETWORK ────────────────────────────────────────────────────

// Latitude rings — soft horizontal sphere-following curves
function LatitudeRings() {
  const positions = useMemo(() => {
    const pts = []
    const yAxis = new THREE.Vector3(0, 1, 0)
    // Latitudes at varied densities — denser near equator
    const alphas = [
      0.30, 0.55, 0.80, 1.05, 1.30, 1.55,         // top→equator
      Math.PI / 2,                                  // equator (slightly emphasized)
      Math.PI - 1.55, Math.PI - 1.30, Math.PI - 1.05,
      Math.PI - 0.80, Math.PI - 0.55, Math.PI - 0.30,
    ]
    alphas.forEach(alpha => {
      const ring = circleOnSphere(yAxis, alpha, R * 1.001, 120)
      arcToSegments(ring, pts)
    })
    return new Float32Array(pts)
  }, [])
  return (
    <AdditiveLines positions={positions}
      color="#7ad4ff" opacity={0.55} renderOrder={4}
      vertexColors colorFront="#bfeaff" colorBack="#0a3a70"
    />
  )
}

// Longitude meridians — pole-to-pole sweeping arcs
function LongitudeMeridians() {
  const positions = useMemo(() => {
    const pts = []
    const N = 16
    const north = new THREE.Vector3(0, 1, 0)
    const south = new THREE.Vector3(0, -1, 0)
    for (let i = 0; i < N; i++) {
      const phi = (i / N) * Math.PI * 2
      // Use an equatorial point to define the meridian plane
      const eq = new THREE.Vector3(Math.cos(phi), 0, Math.sin(phi))
      // Two halves to form a full great circle through poles
      const arc1 = greatCircleArc(north, eq, R * 1.0015, 32)
      const arc2 = greatCircleArc(eq, south, R * 1.0015, 32)
      arcToSegments(arc1, pts)
      arcToSegments(arc2, pts)
    }
    return new Float32Array(pts)
  }, [])
  return (
    <AdditiveLines positions={positions}
      color="#6fc8f5" opacity={0.42} renderOrder={4}
      vertexColors colorFront="#a8e2ff" colorBack="#082a60"
    />
  )
}

// Tilted great circles — organic complexity, paths that wrap naturally
function TiltedGreatCircles() {
  const positions = useMemo(() => {
    const pts = []
    // Deterministic pseudo-random axis directions
    const axes = []
    const N = 14
    for (let i = 0; i < N; i++) {
      const t = i / N
      const u = (i * 0.6180339887) % 1
      const phi = Math.acos(2 * u - 1)
      const theta = t * Math.PI * 2
      axes.push(new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta),
      ))
    }
    axes.forEach(axis => {
      // Great circle = small circle of angular radius PI/2 around this axis
      const ring = circleOnSphere(axis, Math.PI / 2, R * 1.001, 120)
      arcToSegments(ring, pts)
    })
    return new Float32Array(pts)
  }, [])
  return (
    <AdditiveLines positions={positions}
      color="#54b6e8" opacity={0.30} renderOrder={3}
      vertexColors colorFront="#9ad8ff" colorBack="#06224a"
    />
  )
}

// Underlying soccer-ball edge structure — kept as a faint structural underlay,
// no longer dominant. Provides geometric scaffolding for icon hubs.
function SoccerScaffold() {
  const positions = useMemo(() => {
    const pts = []
    edges.forEach(([i, j]) => {
      const arc = greatCircleArc(vertices[i], vertices[j], R, 18)
      arcToSegments(arc, pts)
    })
    return new Float32Array(pts)
  }, [])
  return (
    <AdditiveLines positions={positions}
      color="#3a8fcc" opacity={0.22} renderOrder={3}
      vertexColors colorFront="#7fc8ee" colorBack="#041a40"
    />
  )
}

// Dotted micro-trails — premium detail, broken paths between random sphere points
function DottedDataTrails() {
  const positions = useMemo(() => {
    const pts = []
    // Build 40 random great-circle segments between sphere points
    const N = 40
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < N; i++) {
      const a = new THREE.Vector3(
        Math.cos(i * golden), Math.sin(i * 1.7) * 0.8, Math.sin(i * golden)
      ).normalize()
      const b = new THREE.Vector3(
        Math.cos(i * golden + 2.3), Math.cos(i * 1.3) * 0.85, Math.sin(i * golden + 2.3)
      ).normalize()
      const arc = greatCircleArc(a, b, R * 1.006, 40)
      arcToDottedSegments(arc, pts)
    }
    return new Float32Array(pts)
  }, [])
  return (
    <AdditiveLines positions={positions}
      color="#a0e6ff" opacity={0.55} renderOrder={6}
      vertexColors colorFront="#dff5ff" colorBack="#0a2a5c"
    />
  )
}

// Per-icon branching arcs — each service hub fans curved connections outward
function IconBranches() {
  const positions = useMemo(() => {
    const pts = []
    pentagonCenters.forEach((pc, i) => {
      // Connect this icon to 4 distant pentagons + 3 hex centers via long curves
      const others = pentagonCenters
        .map((p, j) => ({ p, j, d: pc.distanceTo(p) }))
        .filter(x => x.j !== i)
        .sort((a, b) => b.d - a.d)
        .slice(0, 4)
      others.forEach(({ p }) => {
        const arc = greatCircleArc(pc, p, R * 1.004, 48)
        arcToSegments(arc, pts)
      })
      const hexTargets = hexCenters
        .map((h, j) => ({ h, j, d: pc.distanceTo(h) }))
        .sort((a, b) => a.d - b.d)
        .slice(2, 5) // skip the very nearest; reach further into network
      hexTargets.forEach(({ h }) => {
        const arc = greatCircleArc(pc, h, R * 1.005, 36)
        arcToSegments(arc, pts)
      })
    })
    return new Float32Array(pts)
  }, [])
  return (
    <AdditiveLines positions={positions}
      color="#7adfff" opacity={0.50} renderOrder={5}
      vertexColors colorFront="#caf2ff" colorBack="#0a2e60"
    />
  )
}

// Short bright spokes — icon plugs directly into its 5 nearest vertex nodes
function NodeSpokes() {
  const positions = useMemo(() => {
    const pts = []
    pentagonCenters.forEach((pc, pi) => {
      pentNeighborVerts[pi].forEach(vi => {
        const arc = greatCircleArc(pc, vertices[vi], R * 1.003, 18)
        arcToSegments(arc, pts)
      })
    })
    return new Float32Array(pts)
  }, [])
  return (
    <AdditiveLines positions={positions}
      color="#bfeeff" opacity={0.82} renderOrder={7}
      vertexColors colorFront="#ffffff" colorBack="#0a3878"
    />
  )
}

// ── Reusable additive points layer ────────────────────────────────────────────
function AdditiveDots({ positions, size, color, opacity, renderOrder = 4 }) {
  const tex = getGlowDotTexture()
  const count = positions.length / 3
  return (
    <points renderOrder={renderOrder}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={size} map={tex} color={color} sizeAttenuation transparent
        opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false}
        alphaTest={0.01} />
    </points>
  )
}

function SurfaceDots() {
  const arr = useMemo(() => fibonacciSphere(1800, R * 1.001), [])
  return <AdditiveDots positions={arr} size={0.028} color="#4a96cc" opacity={0.62} renderOrder={2} />
}
function SurfaceDotsSecondary() {
  const arr = useMemo(() => fibonacciSphere(900, R * 1.012), [])
  return <AdditiveDots positions={arr} size={0.020} color="#86c8f0" opacity={0.48} renderOrder={3} />
}

// Bright junctions at every truncated-icosahedron vertex
function VertexGlowDots() {
  const arr = useMemo(() => {
    const out = new Float32Array(vertices.length * 3)
    vertices.forEach((v, i) => {
      out[i * 3] = v.x * R; out[i * 3 + 1] = v.y * R; out[i * 3 + 2] = v.z * R
    })
    return out
  }, [])
  return <AdditiveDots positions={arr} size={0.16} color="#d6f2ff" opacity={0.92} renderOrder={7} />
}

function HexCenterDots() {
  const arr = useMemo(() => {
    const out = new Float32Array(hexCenters.length * 3)
    hexCenters.forEach((p, i) => {
      out[i * 3] = p.x * R * 1.001; out[i * 3 + 1] = p.y * R * 1.001; out[i * 3 + 2] = p.z * R * 1.001
    })
    return out
  }, [])
  return <AdditiveDots positions={arr} size={0.11} color="#8edcff" opacity={0.78} renderOrder={5} />
}

// Tiny intersection sparkles distributed along latitudes/meridians for richness
function MicroSparkles() {
  const arr = useMemo(() => {
    const pts = []
    const golden = Math.PI * (3 - Math.sqrt(5))
    const N = 320
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2
      const radius = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = golden * i * 2.0
      pts.push(
        Math.cos(theta) * radius * R * 1.005,
        y * R * 1.005,
        Math.sin(theta) * radius * R * 1.005,
      )
    }
    return new Float32Array(pts)
  }, [])
  return <AdditiveDots positions={arr} size={0.038} color="#cfeeff" opacity={0.70} renderOrder={5} />
}

// Spoke endpoint terminals — twinkling
function SpokeEndpointDots() {
  const arr = useMemo(() => {
    const pts = []
    pentagonCenters.forEach((_, pi) => {
      pentNeighborVerts[pi].forEach(vi => {
        const v = vertices[vi]
        pts.push(v.x * R * 1.002, v.y * R * 1.002, v.z * R * 1.002)
      })
    })
    return new Float32Array(pts)
  }, [])
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) ref.current.opacity = 0.78 + 0.18 * Math.sin(clock.getElapsedTime() * 2.1)
  })
  const tex = getGlowDotTexture()
  return (
    <points renderOrder={8}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={arr.length / 3} array={arr} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial ref={ref} size={0.22} map={tex} color="#ffffff" sizeAttenuation transparent
        opacity={0.88} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false}
        alphaTest={0.01} />
    </points>
  )
}

// Pentagon anchor dots (icon centers — bright cores)
function PentagonAnchorDots() {
  const arr = useMemo(() => {
    const out = new Float32Array(pentagonCenters.length * 3)
    pentagonCenters.forEach((p, i) => {
      out[i * 3] = p.x * R * 1.003; out[i * 3 + 1] = p.y * R * 1.003; out[i * 3 + 2] = p.z * R * 1.003
    })
    return out
  }, [])
  return <AdditiveDots positions={arr} size={0.26} color="#ffffff" opacity={0.85} renderOrder={9} />
}

// Cluster particles around each icon hub — animated
function NodeClusterDots() {
  const tex = getGlowDotTexture()
  const { positions, count } = useMemo(() => {
    const perNode = 36
    const pts = []
    pentagonCenters.forEach(pc => {
      const n = pc.clone().normalize()
      const ref = Math.abs(n.y) > 0.85 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)
      const e1 = new THREE.Vector3().crossVectors(n, ref).normalize()
      const e2 = new THREE.Vector3().crossVectors(e1, n).normalize()
      for (let k = 0; k < perNode; k++) {
        const alpha = 0.05 + Math.random() * 0.24
        const phi = Math.random() * Math.PI * 2
        const pt = n.clone()
          .multiplyScalar(Math.cos(alpha))
          .addScaledVector(e1, Math.sin(alpha) * Math.cos(phi))
          .addScaledVector(e2, Math.sin(alpha) * Math.sin(phi))
          .normalize()
          .multiplyScalar(R * (1.0 + Math.random() * 0.012))
        pts.push(pt.x, pt.y, pt.z)
      }
    })
    return { positions: new Float32Array(pts), count: pts.length / 3 }
  }, [])

  const matRef = useRef()
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.opacity = 0.60 + 0.18 * Math.sin(clock.getElapsedTime() * 1.3)
  })

  return (
    <points renderOrder={8}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial ref={matRef} size={0.038} map={tex} color="#9ce0ff" sizeAttenuation
        transparent opacity={0.70} blending={THREE.AdditiveBlending} depthWrite={false}
        depthTest={false} alphaTest={0.01} />
    </points>
  )
}

// Soft volume particles inside the sphere
function InnerDepthDots() {
  const arr = useMemo(() => {
    const count = 320
    const out = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = (0.20 + Math.random() * 0.74) * R
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = Math.random() * Math.PI * 2
      out[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      out[i * 3 + 1] = r * Math.cos(phi)
      out[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    return out
  }, [])
  return <AdditiveDots positions={arr} size={0.022} color="#2862a5" opacity={0.42} renderOrder={1} />
}

// ── Icon node halos — dotted rings, feel embedded not decorative ──────────────

function NodeDottedRings() {
  const tex = getGlowDotTexture()
  const arr = useMemo(() => {
    const perRing = 42
    const pts = []
    pentagonCenters.forEach(c => {
      const ring = circleOnSphere(c, 0.155, R * 1.003, perRing)
      for (let k = 0; k < perRing; k++) {
        pts.push(ring[k][0], ring[k][1], ring[k][2])
      }
    })
    return new Float32Array(pts)
  }, [])
  return (
    <points renderOrder={8}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={arr.length / 3} array={arr} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.034} map={tex} color="#aae6ff" sizeAttenuation transparent
        opacity={0.80} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false}
        alphaTest={0.01} />
    </points>
  )
}

function NodeOuterDottedRings() {
  const tex = getGlowDotTexture()
  const arr = useMemo(() => {
    const perRing = 56
    const pts = []
    pentagonCenters.forEach(c => {
      const ring = circleOnSphere(c, 0.245, R * 1.004, perRing)
      for (let k = 0; k < perRing; k++) {
        pts.push(ring[k][0], ring[k][1], ring[k][2])
      }
    })
    return new Float32Array(pts)
  }, [])
  return (
    <points renderOrder={8}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={arr.length / 3} array={arr} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.025} map={tex} color="#7dcfff" sizeAttenuation transparent
        opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false}
        alphaTest={0.01} />
    </points>
  )
}

// Pulsating breathing rings — soft activity around each node
function PulsatingRings() {
  const groupRef = useRef()
  const phases = useMemo(() =>
    pentagonCenters.map((_, i) => (i / pentagonCenters.length) * Math.PI * 2)
  , [])
  const ringPts = useMemo(() => pentagonCenters.map(c => circleOnSphere(c, 0.195, R * 1.006)), [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.children.forEach((child, i) => {
      child.material.opacity = 0.08 + 0.28 * (0.5 + 0.5 * Math.sin(t * 1.0 + phases[i]))
    })
  })

  return (
    <group ref={groupRef}>
      {ringPts.map((pts, i) => (
        <Line key={i} points={pts} color="#bbf4ff" lineWidth={0.7}
          transparent opacity={0.18} blending={THREE.AdditiveBlending}
          depthWrite={false} depthTest={false} renderOrder={9} />
      ))}
    </group>
  )
}

// Icon plane — front-facing, occluded by AtmosphereCore depth when on back side
function IconPlane({ center, texIndex }) {
  const tex = useMemo(() => createIconTexture(texIndex), [texIndex])
  const position = useMemo(() => center.clone().multiplyScalar(R * 1.005), [center])
  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion()
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), center.clone().normalize())
    return q
  }, [center])
  return (
    <mesh
      position={position.toArray()}
      quaternion={quaternion.toArray()}
      renderOrder={8}
    >
      <planeGeometry args={[0.78, 0.78]} />
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

// ── Main component ────────────────────────────────────────────────────────────
export default function HeroOrb() {
  const groupRef = useRef()

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.045
  })

  return (
    <group>
      <OrbGlow />

      <group ref={groupRef}>
        {/* Faint Fresnel atmosphere — provides depth occlusion only */}
        <AtmosphereCore />

        {/* Volume + surface particle fields */}
        <InnerDepthDots />
        <SurfaceDots />
        <SurfaceDotsSecondary />

        {/* CURVED FLOWING NETWORK — primary visual layer */}
        <SoccerScaffold />          {/* subtle geometric scaffolding */}
        <TiltedGreatCircles />      {/* organic complexity */}
        <LatitudeRings />           {/* sphere-following horizontal flow */}
        <LongitudeMeridians />      {/* pole-to-pole flow */}
        <IconBranches />            {/* curved service-to-service routes */}
        <DottedDataTrails />        {/* premium micro-trails */}
        <NodeSpokes />              {/* bright icon plugs */}

        {/* Junction dots */}
        <HexCenterDots />
        <VertexGlowDots />
        <MicroSparkles />
        <SpokeEndpointDots />

        {/* Icon halos — dotted, embedded feel */}
        <NodeDottedRings />
        <NodeOuterDottedRings />

        {/* Living particles around hubs */}
        <NodeClusterDots />

        {/* Icon planes (occluded on back side via AtmosphereCore depth) */}
        {pentagonCenters.map((c, i) => (
          <IconPlane key={i} center={c} texIndex={i} />
        ))}

        {/* Animated activity rings */}
        <PulsatingRings />

        {/* Bright icon center anchors */}
        <PentagonAnchorDots />

        {/* Fresnel rim layers define the glass sphere boundary */}
        <FresnelRim radius={R}         color="#00a0ff" power={2.5} intensity={1.30} />
        <FresnelRim radius={R * 1.010} color="#caf0ff" power={6.0} intensity={1.80} />
        <FresnelRim radius={R * 1.022} color="#0055cc" power={1.5} intensity={0.42} />
      </group>
    </group>
  )
}
