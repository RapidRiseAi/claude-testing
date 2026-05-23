import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { buildSoccerBall, greatCircleArc, circleOnSphere } from '../../utils/soccerBall'
import { createIconTexture } from '../../utils/iconTextures'

const R = 2.1

// ─── Pre-build geometry (module level — runs once) ────────────────────────
const { vertices, edges, pentagonCenters } = buildSoccerBall()

// ─── Glow sprite ─────────────────────────────────────────────────────────

function OrbGlow() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 512
    const ctx = c.getContext('2d')
    const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
    g.addColorStop(0,    'rgba(0, 130, 255, 0.85)')
    g.addColorStop(0.20, 'rgba(0,  85, 230, 0.50)')
    g.addColorStop(0.42, 'rgba(0,  50, 185, 0.22)')
    g.addColorStop(0.68, 'rgba(0,  24, 120, 0.07)')
    g.addColorStop(1,    'rgba(0,   6,  55, 0.00)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 512)
    return new THREE.CanvasTexture(c)
  }, [])
  const s = R * 5.2
  return (
    <sprite scale={[s, s, 1]}>
      <spriteMaterial map={tex} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
    </sprite>
  )
}

// ─── Dark core sphere (canvas texture with inner dot-field) ───────────────

function useCoreTex() {
  return useMemo(() => {
    const S = 512
    const c = document.createElement('canvas'); c.width = c.height = S
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#000408'; ctx.fillRect(0, 0, S, S)
    const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
    g.addColorStop(0,    'rgba(0, 55, 170, 0.55)')
    g.addColorStop(0.35, 'rgba(0, 35, 130, 0.28)')
    g.addColorStop(0.70, 'rgba(0, 18, 85,  0.10)')
    g.addColorStop(1,    'rgba(0,  5, 35,  0.02)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S)
    // Micro-particle dots distributed in disc
    for (let i = 0; i < 5000; i++) {
      const a = Math.random() * Math.PI * 2
      const r = Math.sqrt(Math.random()) * 256
      const x = 256 + r * Math.cos(a), y = 256 + r * Math.sin(a)
      const fade = 1 - r / 256
      const alpha = Math.random() * fade * 0.65
      const b = Math.floor(150 + Math.random() * 100)
      ctx.fillStyle = `rgba(60,${Math.floor(b * 0.55)},${b},${alpha})`
      ctx.beginPath(); ctx.arc(x, y, 0.6 + Math.random() * 1.8, 0, Math.PI * 2); ctx.fill()
    }
    return new THREE.CanvasTexture(c)
  }, [])
}

// ─── Soccer ball grid ─────────────────────────────────────────────────────

function SoccerGrid() {
  // All 90 edges batched into a single LineSegments draw call
  const { positions, count } = useMemo(() => {
    const pts = []
    edges.forEach(([i, j]) => {
      const arc = greatCircleArc(vertices[i], vertices[j], R, 28)
      for (let k = 0; k < arc.length - 1; k++) {
        pts.push(...arc[k], ...arc[k + 1])
      }
    })
    return { positions: new Float32Array(pts), count: pts.length / 3 }
  }, [])

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color="#0088cc" transparent opacity={0.90} depthWrite={false} />
    </lineSegments>
  )
}

// ─── Pentagon node rings (2 concentric sphere-surface circles per icon) ───

function NodeRings() {
  const ringLines = useMemo(() =>
    pentagonCenters.flatMap((c, idx) => [
      { key: `${idx}a`, pts: circleOnSphere(c, 0.195, R), color: '#00ccff', w: 1.8 },
      { key: `${idx}b`, pts: circleOnSphere(c, 0.340, R), color: '#0077bb', w: 1.0 },
    ])
  , [])

  return (
    <group>
      {ringLines.map(({ key, pts, color, w }) => (
        <Line key={key} points={pts} color={color} lineWidth={w} transparent opacity={0.95} />
      ))}
    </group>
  )
}

// Bright white dot at each pentagon center (visual grid node)
function NodeDots() {
  const arr = useMemo(() => {
    const out = new Float32Array(pentagonCenters.length * 3)
    pentagonCenters.forEach((p, i) => {
      out[i * 3] = p.x * R; out[i * 3 + 1] = p.y * R; out[i * 3 + 2] = p.z * R
    })
    return out
  }, [])
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={pentagonCenters.length} array={arr} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.22} color="#ffffff" sizeAttenuation transparent opacity={1} depthWrite={false} />
    </points>
  )
}

// ─── Icon planes — true 3D geometry on sphere surface ────────────────────

function IconPlane({ center, texIndex }) {
  const tex = useMemo(() => createIconTexture(texIndex), [texIndex])

  // Position slightly above the dark core surface to avoid z-fight
  const position = useMemo(() => center.clone().multiplyScalar(R * 0.928), [center])

  // Quaternion that orients the plane so its +Z normal faces outward
  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion()
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), center.clone().normalize())
    return q
  }, [center])

  return (
    <mesh
      position={position.toArray()}
      quaternion={quaternion.toArray()}
      renderOrder={1}
    >
      <planeGeometry args={[0.88, 0.88]} />
      <meshBasicMaterial
        map={tex}
        transparent
        alphaTest={0.08}
        depthTest
        depthWrite
        side={THREE.FrontSide}
      />
    </mesh>
  )
}

// ─── Main component ───────────────────────────────────────────────────────

export default function HeroOrb() {
  const groupRef = useRef()
  const coreTex = useCoreTex()

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.07
  })

  return (
    <group>
      <OrbGlow />

      <group ref={groupRef}>
        {/* Dark core — occludes backside geometry via depth buffer */}
        <mesh renderOrder={-1}>
          <sphereGeometry args={[R * 0.922, 48, 48]} />
          <meshBasicMaterial map={coreTex} depthWrite />
        </mesh>

        {/* Outer rim shell */}
        <mesh>
          <sphereGeometry args={[R * 1.04, 32, 32]} />
          <meshBasicMaterial
            color="#0044bb" transparent opacity={0.045}
            side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false}
          />
        </mesh>

        <SoccerGrid />
        <NodeRings />
        <NodeDots />

        {pentagonCenters.map((c, i) => (
          <IconPlane key={i} center={c} texIndex={i} />
        ))}
      </group>
    </group>
  )
}
