/**
 * PricingWave — a wide, horizontal particle-wave field that spans the bottom of
 * a section as ambient decoration. Built from the same orb language as the rest
 * of the site (the shared glow-dot texture + additive points + blue palette),
 * just arranged into a flowing perspective grid instead of a sculpture.
 *
 * Design goals:
 *   · landscape, low in the composition, behind the content
 *   · many tiny glowing orbs forming smooth contour lanes (a digital surface)
 *   · gentle, slow, seamless wave motion (computed in the vertex shader)
 *   · depth: nearer rows brighter/larger, far rows dim into the dark
 *   · reusable + modular — drop <PricingWave /> into any section
 *
 * Performance: a single points draw, the wave is GPU-computed, and the render
 * loop pauses while the host element is scrolled out of view.
 */

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useRef, useMemo, useState, useEffect } from 'react'
import * as THREE from 'three'
import { getGlowDotTexture } from '../../utils/iconTextures'

/* Grid resolution — modest; the glow texture does the visual heavy lifting */
const COLS  = 150   // particles across (width)
const ROWS  = 40    // particles deep (perspective rows)
const WIDTH = 34    // world units across
const NEAR  = 5.0   // nearest row z (toward camera)
const FAR   = -22.0 // farthest row z (recedes to the horizon)

const VERT = `
  uniform float uTime;
  uniform float uSize;
  uniform float uScale;
  attribute float aRand;
  varying float vBright;
  varying float vFade;

  void main() {
    vec3 p = position;
    float x = p.x;
    float z = p.z;

    // Broad, smooth, overlapping swells — slow + seamless. A faint lift toward
    // the far left/right edges so the field gently rolls in toward the middle.
    float y = 0.0;
    y += 0.62 * sin(x * 0.42 + uTime * 0.46);
    y += 0.40 * sin(x * 0.26 - z * 0.34 + uTime * 0.34);
    y += 0.30 * sin(z * 0.50 + uTime * 0.40);
    y += 0.18 * sin((x + z) * 0.60 - uTime * 0.27);
    y += 0.16 * (x * x) / ${(WIDTH * WIDTH).toFixed(1)};   // gentle lift at the far L/R edges
    p.y = y;

    float depth = clamp((z - (${FAR.toFixed(1)})) / (${(NEAR - FAR).toFixed(1)}), 0.0, 1.0); // 0 far -> 1 near
    float crest = clamp(0.5 + y * 0.40, 0.0, 1.0);
    vBright = clamp(crest * (0.5 + aRand * 0.65), 0.0, 1.0);
    vFade = depth * depth;              // far rows recede into the dark

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    // Small, defined dots: standard perspective shrink with distance, then a
    // hard cap so no near particle ever balloons into a big soft bloom.
    gl_PointSize = clamp(uSize * (0.55 + aRand * 0.8) * (uScale / -mv.z), 1.0, 22.0);
  }
`

const FRAG = `
  uniform sampler2D uTex;
  uniform float uOpacity;
  uniform vec3 uColorDim;
  uniform vec3 uColorHot;
  varying float vBright;
  varying float vFade;

  void main() {
    vec4 tex = texture2D(uTex, gl_PointCoord);
    vec3 col = mix(uColorDim, uColorHot, vBright);
    // Brightness rides on alpha, NOT an over-1 colour multiply, so stacked
    // additive dots stay within the blue palette instead of clipping to white.
    float a = tex.a * uOpacity * vFade * (0.18 + vBright * 0.55);
    gl_FragColor = vec4(col, a);
  }
`

function WaveField() {
  const { size } = useThree()

  const { positions, rands } = useMemo(() => {
    const pos = new Float32Array(COLS * ROWS * 3)
    const rnd = new Float32Array(COLS * ROWS)
    let i = 0
    for (let r = 0; r < ROWS; r++) {
      const z = NEAR + (FAR - NEAR) * (r / (ROWS - 1))
      for (let c = 0; c < COLS; c++) {
        pos[i * 3]     = (c / (COLS - 1) - 0.5) * WIDTH
        pos[i * 3 + 1] = 0
        pos[i * 3 + 2] = z
        rnd[i] = Math.random()
        i++
      }
    }
    return { positions: pos, rands: rnd }
  }, [])

  const uniforms = useMemo(() => ({
    uTime:     { value: 0 },
    uSize:     { value: 0.42 },          // world-size scale for the perspective dots
    uScale:    { value: size.height / 2 },
    uTex:      { value: getGlowDotTexture() },
    uOpacity:  { value: 0.6 },
    uColorDim: { value: new THREE.Color('#1763c8') },  // deep electric blue
    uColorHot: { value: new THREE.Color('#7fdcff') },  // cyan-blue highlight
  }), [size.height])

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime()
    uniforms.uScale.value = size.height / 2
  })

  return (
    <points renderOrder={1} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aRand" count={rands.length} array={rands} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function PricingWave() {
  const wrapRef = useRef()
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!wrapRef.current) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '200px' })
    io.observe(wrapRef.current)
    return () => io.disconnect()
  }, [])

  return (
    <div className="fp-wave" aria-hidden="true" ref={wrapRef}>
      <Canvas
        frameloop={inView ? 'always' : 'never'}
        camera={{ position: [0, 3.0, 8.5], fov: 46 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.6]}
        onCreated={({ camera }) => camera.lookAt(0, -0.6, -6)}
      >
        <WaveField />
      </Canvas>
    </div>
  )
}
