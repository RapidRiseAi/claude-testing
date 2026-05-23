import { useRef, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'

const R = 1.85

const toXYZ = (lat, lon, r = R) => [
  r * Math.cos(lat) * Math.sin(lon),
  r * Math.sin(lat),
  r * Math.cos(lat) * Math.cos(lon),
]

function makeLatRing(lat, r = R, n = 120) {
  return Array.from({ length: n + 1 }, (_, i) =>
    toXYZ(lat, (i / n) * Math.PI * 2, r)
  )
}

// Longitude arc: south pole → north pole at given longitude
function makeLonArc(lon, r = R, n = 120) {
  return Array.from({ length: n + 1 }, (_, i) =>
    toXYZ((i / n) * Math.PI - Math.PI / 2, lon, r)
  )
}

const LAT_DEG = [-60, -40, -20, 0, 20, 40, 60]
const LAT_RADS = LAT_DEG.map(d => d * Math.PI / 180)
const LON_COUNT = 12
const LON_RADS = Array.from({ length: LON_COUNT }, (_, i) => (i * Math.PI * 2) / LON_COUNT)

// 8 octant centers on sphere surface
const OCTANT_POSITIONS = [
  [1, 1, 1], [-1, 1, 1], [1, 1, -1], [-1, 1, -1],
  [1, -1, 1], [-1, -1, 1], [1, -1, -1], [-1, -1, -1],
].map(([x, y, z]) => {
  const s = R / Math.sqrt(3)
  return new THREE.Vector3(x * s, y * s, z * s)
})

const ICON_DATA = [
  {
    label: 'Analytics',
    el: (
      <g>
        <rect x="3" y="12" width="4" height="8" rx="0.5" fill="none" />
        <rect x="10" y="7" width="4" height="13" rx="0.5" fill="none" />
        <rect x="17" y="3" width="4" height="17" rx="0.5" fill="none" />
      </g>
    ),
  },
  {
    label: 'IoT / Chip',
    el: (
      <g>
        <rect x="7" y="7" width="10" height="10" rx="1" fill="none" />
        <line x1="9" y1="7" x2="9" y2="4" /><line x1="12" y1="7" x2="12" y2="4" /><line x1="15" y1="7" x2="15" y2="4" />
        <line x1="9" y1="17" x2="9" y2="20" /><line x1="12" y1="17" x2="12" y2="20" /><line x1="15" y1="17" x2="15" y2="20" />
        <line x1="7" y1="9" x2="4" y2="9" /><line x1="7" y1="12" x2="4" y2="12" /><line x1="7" y1="15" x2="4" y2="15" />
        <line x1="17" y1="9" x2="20" y2="9" /><line x1="17" y1="12" x2="20" y2="12" /><line x1="17" y1="15" x2="20" y2="15" />
      </g>
    ),
  },
  {
    label: 'Identity',
    el: (
      <g>
        <rect x="2" y="5" width="20" height="14" rx="2" fill="none" />
        <circle cx="8" cy="12" r="2.5" fill="none" />
        <line x1="13" y1="10" x2="20" y2="10" />
        <line x1="13" y1="14" x2="18" y2="14" />
      </g>
    ),
  },
  {
    label: 'Integrations',
    el: (
      <g>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </g>
    ),
  },
  {
    label: 'Automation',
    el: (
      <g>
        <circle cx="12" cy="12" r="3" fill="none" />
        <line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" />
        <line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" />
        <line x1="4.9" y1="4.9" x2="7.1" y2="7.1" /><line x1="16.9" y1="16.9" x2="19.1" y2="19.1" />
        <line x1="4.9" y1="19.1" x2="7.1" y2="16.9" /><line x1="16.9" y1="7.1" x2="19.1" y2="4.9" />
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
        <rect x="2" y="3" width="20" height="14" rx="2" fill="none" />
        <line x1="2" y1="7" x2="22" y2="7" />
        <circle cx="5" cy="5" r="0.5" fill="currentColor" />
        <circle cx="8" cy="5" r="0.5" fill="currentColor" />
        <line x1="6" y1="10" x2="18" y2="10" />
        <line x1="6" y1="13" x2="14" y2="13" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </g>
    ),
  },
  {
    label: 'AI Assistant',
    el: (
      <g>
        <rect x="3" y="7" width="18" height="12" rx="2" fill="none" />
        <path d="M8 7V5a1 1 0 011-1h6a1 1 0 011 1v2" fill="none" />
        <circle cx="9" cy="13" r="1" fill="currentColor" />
        <circle cx="15" cy="13" r="1" fill="currentColor" />
        <line x1="10" y1="16" x2="14" y2="16" />
      </g>
    ),
  },
]

function SphereGrid() {
  const dotPositions = useMemo(() => {
    const arr = []
    LAT_RADS.forEach(lat => {
      LON_RADS.forEach(lon => {
        const [x, y, z] = toXYZ(lat, lon)
        arr.push(x, y, z)
      })
    })
    return new Float32Array(arr)
  }, [])

  return (
    <group>
      {LAT_RADS.map((lat, i) => (
        <Line
          key={`lat${i}`}
          points={makeLatRing(lat)}
          color={Math.abs(lat) < 0.01 ? '#00aaff' : '#0e4d99'}
          lineWidth={Math.abs(lat) < 0.01 ? 1.4 : 0.7}
          transparent
          opacity={Math.abs(lat) < 0.01 ? 1 : 0.65}
        />
      ))}

      {LON_RADS.map((lon, i) => (
        <Line
          key={`lon${i}`}
          points={makeLonArc(lon)}
          color={i === 0 ? '#00aaff' : '#0e4d99'}
          lineWidth={i === 0 ? 1.4 : 0.7}
          transparent
          opacity={i === 0 ? 1 : 0.65}
        />
      ))}

      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={dotPositions.length / 3}
            array={dotPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#55ddff"
          sizeAttenuation
          transparent
          opacity={0.9}
        />
      </points>
    </group>
  )
}

function OrbIcon({ position, data, groupRef }) {
  const { camera } = useThree()
  const [hovered, setHovered] = useState(false)
  const [vis, setVis] = useState(true)

  useFrame(() => {
    if (!groupRef.current) return
    const wp = position.clone().applyMatrix4(groupRef.current.matrixWorld)
    const toCamera = camera.position.clone().sub(wp).normalize()
    const normal = wp.clone().normalize()
    setVis(normal.dot(toCamera) > 0.12)
  })

  return (
    <Html position={position.toArray()} center zIndexRange={[10, 0]}>
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: 'rgba(0, 8, 25, 0.82)',
          border: `1.5px solid ${hovered ? '#44ccff' : '#1a6bbf'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          opacity: vis ? 1 : 0,
          pointerEvents: vis ? 'auto' : 'none',
          boxShadow: hovered
            ? '0 0 18px #00aaff, 0 0 40px #0066cc55, inset 0 0 12px #00224455'
            : '0 0 10px #004488aa, inset 0 0 8px #00111a33',
          transition: 'opacity 0.2s, box-shadow 0.25s, border-color 0.25s',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={data.label}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke={hovered ? '#55eeff' : '#2299dd'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          color={hovered ? '#55eeff' : '#2299dd'}
        >
          {data.el}
        </svg>
      </div>
    </Html>
  )
}

export default function HeroOrb() {
  const groupRef = useRef()

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {/* Inner sphere — blocks backside icons */}
      <mesh>
        <sphereGeometry args={[R * 0.94, 32, 32]} />
        <meshBasicMaterial color="#00060f" transparent opacity={0.85} side={THREE.FrontSide} />
      </mesh>

      {/* Outer atmosphere shell */}
      <mesh>
        <sphereGeometry args={[R * 1.08, 32, 32]} />
        <meshBasicMaterial color="#0033aa" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>

      <SphereGrid />

      {OCTANT_POSITIONS.map((pos, i) => (
        <OrbIcon key={i} position={pos} data={ICON_DATA[i]} groupRef={groupRef} />
      ))}
    </group>
  )
}
