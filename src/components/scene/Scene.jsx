import { Canvas } from '@react-three/fiber'
import { Suspense, useMemo } from 'react'
import * as THREE from 'three'
import HeroOrb from './HeroOrb'

function SubtleStarfield() {
  const positions = useMemo(() => {
    const count = 500
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 30
      arr[i * 3 + 1] = (Math.random() - 0.5) * 30
      arr[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5
    }
    return arr
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        color="#113355"
        sizeAttenuation
        transparent
        opacity={0.5}
        depthWrite={false}
      />
    </points>
  )
}

export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 5.8], fov: 50 }}
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: THREE.NoToneMapping,
      }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#000000']} />
      <SubtleStarfield />
      <Suspense fallback={null}>
        <HeroOrb />
      </Suspense>
    </Canvas>
  )
}
