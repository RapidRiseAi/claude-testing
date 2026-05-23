import { useRef, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'

const R = 2.1

// Sphere surface point helper
const sph = (lat, lon, r = R) => new THREE.Vector3(
  r * Math.cos(lat) * Math.sin(lon),
  r * Math.sin(lat),
  r * Math.cos(lat) * Math.cos(lon)
)

function makeLatRing(lat, r = R, n = 160) {
  return Array.from({ length: n + 1 }, (_, i) =>
    sph(lat, (i / n) * Math.PI * 2, r).toArray()
  )
}

function makeLonArc(lon, r = R, n = 160) {
  return Array.from({ length: n + 1 }, (_, i) =>
    sph((i / n) * Math.PI - Math.PI / 2, lon, r).toArray()
  )
}

// Circle on sphere surface at angular distance alpha from center point
function circleOnSphere(center, alpha, r = R, n = 128) {
  const norm = center.clone().normalize()
  const ref = Math.abs(norm.y) > 0.85 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)
  const e1 = new THREE.Vector3().crossVectors(norm, ref).normalize()
  const e2 = new THREE.Vector3().crossVectors(e1, norm).normalize()
  return Array.from({ length: n + 1 }, (_, i) => {
    const φ = (i / n) * Math.PI * 2
    return norm.clone()
      .multiplyScalar(Math.cos(alpha))
      .addScaledVector(e1, Math.sin(alpha) * Math.cos(φ))
      .addScaledVector(e2, Math.sin(alpha) * Math.sin(φ))
      .normalize()
      .multiplyScalar(r)
      .toArray()
  })
}

// Grid: lat every 15° (−75 to 75), lon every 15° (24 arcs)
const LAT_RADS = [-75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75].map(d => d * Math.PI / 180)
const LON_COUNT = 24
const LON_RADS = Array.from({ length: LON_COUNT }, (_, i) => (i / LON_COUNT) * Math.PI * 2)

// 8 octant icon positions on the sphere surface
const OCTANT_POSITIONS = [
  [1, 1, 1], [-1, 1, 1], [1, 1, -1], [-1, 1, -1],
  [1, -1, 1], [-1, -1, 1], [1, -1, -1], [-1, -1, -1],
].map(([x, y, z]) => new THREE.Vector3(x, y, z).normalize().multiplyScalar(R))

const ICON_DATA = [
  {
    label: 'Analytics',
    el: (
      <g>
        <rect x="2" y="14" width="4" height="7" rx="0.5" />
        <rect x="9" y="9" width="4" height="12" rx="0.5" />
        <rect x="16" y="4" width="4" height="17" rx="0.5" />
        <line x1="2" y1="2" x2="22" y2="2" />
      </g>
    ),
  },
  {
    label: 'IoT / Chip',
    el: (
      <g>
        <rect x="7" y="7" width="10" height="10" rx="1" />
        <line x1="9" y1="7" x2="9" y2="3" /><line x1="12" y1="7" x2="12" y2="3" /><line x1="15" y1="7" x2="15" y2="3" />
        <line x1="9" y1="17" x2="9" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /><line x1="15" y1="17" x2="15" y2="21" />
        <line x1="7" y1="9" x2="3" y2="9" /><line x1="7" y1="12" x2="3" y2="12" /><line x1="7" y1="15" x2="3" y2="15" />
        <line x1="17" y1="9" x2="21" y2="9" /><line x1="17" y1="12" x2="21" y2="12" /><line x1="17" y1="15" x2="21" y2="15" />
      </g>
    ),
  },
  {
    label: 'Identity',
    el: (
      <g>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <circle cx="8" cy="12" r="2.5" />
        <line x1="13" y1="9.5" x2="20" y2="9.5" />
        <line x1="13" y1="13" x2="19" y2="13" />
        <line x1="13" y1="16" x2="17" y2="16" />
      </g>
    ),
  },
  {
    label: 'Integrations',
    el: (
      <g>
        <path d="M4 4h4v4H4zM16 4h4v4h-4zM4 16h4v4H4zM16 16h4v4h-4z" />
        <line x1="8" y1="6" x2="16" y2="6" />
        <line x1="8" y1="18" x2="16" y2="18" />
        <line x1="6" y1="8" x2="6" y2="16" />
        <line x1="18" y1="8" x2="18" y2="16" />
        <circle cx="12" cy="12" r="1.5" />
      </g>
    ),
  },
  {
    label: 'Automation',
    el: (
      <g>
        <path d="M12 3a9 9 0 100 18A9 9 0 0012 3z" />
        <path d="M12 8v4l3 3" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </g>
    ),
  },
  {
    label: 'Code',
    el: (
      <g>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="14" y1="4" x2="10" y2="20" />
      </g>
    ),
  },
  {
    label: 'Web Platform',
    el: (
      <g>
        <rect x="2" y="3" width="20" height="15" rx="2" />
        <line x1="2" y1="7" x2="22" y2="7" />
        <circle cx="5" cy="5" r="0.8" fill="currentColor" />
        <circle cx="8" cy="5" r="0.8" fill="currentColor" />
        <circle cx="12" cy="14" r="2.5" />
        <line x1="12" y1="11.5" x2="12" y2="11" />
        <line x1="12" y1="16.5" x2="12" y2="17" />
        <line x1="9.5" y1="14" x2="9" y2="14" />
        <line x1="14.5" y1="14" x2="15" y2="14" />
        <line x1="10.3" y1="12.3" x2="9.9" y2="11.9" />
        <line x1="13.7" y1="15.7" x2="14.1" y2="16.1" />
        <line x1="13.7" y1="12.3" x2="14.1" y2="11.9" />
        <line x1="10.3" y1="15.7" x2="9.9" y2="16.1" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="18" x2="12" y2="21" />
      </g>
    ),
  },
  {
    label: 'AI Assistant',
    el: (
      <g>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a1 1 0 011-1h6a1 1 0 011 1v2" />
        <circle cx="9" cy="13" r="1.2" fill="currentColor" />
        <circle cx="15" cy="13" r="1.2" fill="currentColor" />
        <path d="M9.5 16.5a3 3 0 005 0" />
        <line x1="12" y1="3" x2="12" y2="4" />
      </g>
    ),
  },
]

// Glow halo sprite behind the orb
function OrbGlow() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 512
    const ctx = c.getContext('2d')
    const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
    g.addColorStop(0,    'rgba(0, 120, 255, 0.80)')
    g.addColorStop(0.18, 'rgba(0, 80, 230, 0.50)')
    g.addColorStop(0.38, 'rgba(0, 50, 180, 0.22)')
    g.addColorStop(0.62, 'rgba(0, 25, 120, 0.07)')
    g.addColorStop(1,    'rgba(0, 5,  60,  0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 512, 512)
    return new THREE.CanvasTexture(c)
  }, [])

  const s = R * 4.8
  return (
    <sprite scale={[s, s, 1]}>
      <spriteMaterial map={tex} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
    </sprite>
  )
}

// Canvas texture for the core sphere — deep blue gradient + micro-dots
function useCoreTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 1024
    const ctx = c.getContext('2d')

    ctx.fillStyle = '#000408'
    ctx.fillRect(0, 0, 1024, 1024)

    // Radial inner glow
    const g = ctx.createRadialGradient(512, 512, 0, 512, 512, 512)
    g.addColorStop(0,   'rgba(0, 60, 180, 0.55)')
    g.addColorStop(0.3, 'rgba(0, 40, 140, 0.30)')
    g.addColorStop(0.65,'rgba(0, 20, 90,  0.12)')
    g.addColorStop(1,   'rgba(0,  5, 40,  0.02)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 1024, 1024)

    // Micro particle dots evenly distributed
    for (let i = 0; i < 6000; i++) {
      // Sample uniformly in the disc (equirectangular sphere projection)
      const u = Math.random()        // 0-1 → longitude
      const v = Math.random()        // 0-1 → latitude (linear, not uniform)
      const x = u * 1024
      const y = v * 1024
      const dist = Math.hypot(x - 512, y - 512) / 512
      if (dist > 1) continue
      const brightness = Math.random()
      const fade = 1 - dist * 0.7
      const alpha = brightness * fade * 0.6
      const r = 90 + Math.floor(brightness * 60)
      const b = 200 + Math.floor(brightness * 55)
      ctx.fillStyle = `rgba(${r}, ${Math.floor(r * 1.3)}, ${b}, ${alpha})`
      ctx.beginPath()
      ctx.arc(x, y, 0.7 + Math.random() * 1.8, 0, Math.PI * 2)
      ctx.fill()
    }
    return new THREE.CanvasTexture(c)
  }, [])
}

// Sphere grid: lat rings + lon arcs + bright intersection dots
function SphereGrid() {
  const dotPositions = useMemo(() => {
    const arr = []
    LAT_RADS.forEach(lat => {
      LON_RADS.forEach(lon => {
        const p = sph(lat, lon)
        arr.push(p.x, p.y, p.z)
      })
    })
    return new Float32Array(arr)
  }, [])

  const dotCount = LAT_RADS.length * LON_RADS.length

  return (
    <group>
      {/* Latitude rings */}
      {LAT_RADS.map((lat, i) => {
        const isEq = Math.abs(lat) < 0.01
        return (
          <Line
            key={`lat${i}`}
            points={makeLatRing(lat)}
            color={isEq ? '#22eeff' : '#0077cc'}
            lineWidth={isEq ? 2.2 : 1.1}
            transparent
            opacity={isEq ? 1 : 0.8}
          />
        )
      })}

      {/* Longitude arcs */}
      {LON_RADS.map((lon, i) => {
        const isPrime = i === 0
        return (
          <Line
            key={`lon${i}`}
            points={makeLonArc(lon)}
            color={isPrime ? '#22eeff' : '#0077cc'}
            lineWidth={isPrime ? 2.2 : 1.1}
            transparent
            opacity={isPrime ? 1 : 0.8}
          />
        )
      })}

      {/* Intersection dots — bright white-blue */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={dotCount}
            array={dotPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.07}
          color="#aaddff"
          sizeAttenuation
          transparent
          opacity={1}
          depthWrite={false}
        />
      </points>
    </group>
  )
}

// Concentric circles on sphere surface around each icon — these ARE the grid nodes
function IconRings({ positions }) {
  const lines = useMemo(() => {
    const result = []
    positions.forEach((pos, idx) => {
      result.push({ points: circleOnSphere(pos, 0.20), idx, ring: 0 })
      result.push({ points: circleOnSphere(pos, 0.36), idx, ring: 1 })
    })
    return result
  }, [positions])

  return (
    <group>
      {lines.map(({ points, idx, ring }) => (
        <Line
          key={`icon-ring-${idx}-${ring}`}
          points={points}
          color={ring === 0 ? '#00ddff' : '#0088cc'}
          lineWidth={ring === 0 ? 1.6 : 1.0}
          transparent
          opacity={ring === 0 ? 1 : 0.75}
        />
      ))}
    </group>
  )
}

// Large bright dot at each icon center (marks grid node)
function IconNodeDots({ positions }) {
  const arr = useMemo(() => {
    const out = new Float32Array(positions.length * 3)
    positions.forEach((p, i) => {
      out[i * 3] = p.x; out[i * 3 + 1] = p.y; out[i * 3 + 2] = p.z
    })
    return out
  }, [positions])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length} array={arr} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.18} color="#ffffff" sizeAttenuation transparent opacity={0.95} depthWrite={false} />
    </points>
  )
}

// Individual icon — HTML overlay, visibility driven by DOM ref (no setState per frame)
function OrbIcon({ position, data, groupRef }) {
  const { camera } = useThree()
  const [hovered, setHovered] = useState(false)
  const wrapRef = useRef()

  useFrame(() => {
    if (!groupRef.current || !wrapRef.current) return
    const wp = position.clone().applyMatrix4(groupRef.current.matrixWorld)
    const toCamera = camera.position.clone().sub(wp).normalize()
    const facing = wp.clone().normalize().dot(toCamera) > 0.15
    wrapRef.current.style.opacity = facing ? '1' : '0'
    wrapRef.current.style.pointerEvents = facing ? 'auto' : 'none'
  })

  return (
    <Html position={position.toArray()} center zIndexRange={[100, 0]}>
      <div ref={wrapRef} style={{ opacity: 1, pointerEvents: 'auto', transition: 'opacity 0.18s' }}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          title={data.label}
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'rgba(0, 4, 18, 0.88)',
            border: `1.5px solid ${hovered ? '#66ffff' : '#0088cc'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: hovered
              ? '0 0 28px #00eeff, 0 0 70px #0066cc66, inset 0 0 20px #002244'
              : '0 0 16px #0066bb99, 0 0 40px #003388aa, inset 0 0 12px #00091a',
            transition: 'box-shadow 0.3s, border-color 0.3s',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={hovered ? '#aaffff' : '#22bbee'}
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            color={hovered ? '#aaffff' : '#22bbee'}
          >
            {data.el}
          </svg>
        </div>
      </div>
    </Html>
  )
}

export default function HeroOrb() {
  const groupRef = useRef()
  const coreTexture = useCoreTexture()

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.08
  })

  return (
    <group>
      {/* Glow halo — outside rotating group so it stays centered */}
      <OrbGlow />

      <group ref={groupRef}>
        {/* Core sphere — dark with inner glow texture, occludes backside geometry */}
        <mesh renderOrder={-1}>
          <sphereGeometry args={[R * 0.925, 48, 48]} />
          <meshBasicMaterial map={coreTexture} depthWrite />
        </mesh>

        {/* Outer rim glow shell */}
        <mesh>
          <sphereGeometry args={[R * 1.04, 32, 32]} />
          <meshBasicMaterial
            color="#0044bb"
            transparent
            opacity={0.05}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <SphereGrid />
        <IconRings positions={OCTANT_POSITIONS} />
        <IconNodeDots positions={OCTANT_POSITIONS} />

        {OCTANT_POSITIONS.map((pos, i) => (
          <OrbIcon key={i} position={pos} data={ICON_DATA[i]} groupRef={groupRef} />
        ))}
      </group>
    </group>
  )
}
