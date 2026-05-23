import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import HeroOrb from './HeroOrb'

function Background() {
  return (
    <>
      <color attach="background" args={['#000814']} />
      <fog attach="fog" args={['#000814', 12, 30]} />
    </>
  )
}

function SubtleParticles() {
  const count = 600
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20
  }
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#224466" sizeAttenuation transparent opacity={0.6} />
    </points>
  )
}

export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0.3, 5.2], fov: 52 }}
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      dpr={[1, 2]}
    >
      <Background />
      <SubtleParticles />

      <Suspense fallback={null}>
        <HeroOrb />
      </Suspense>

      <EffectComposer>
        <Bloom
          intensity={2.2}
          luminanceThreshold={0.08}
          luminanceSmoothing={0.85}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  )
}
