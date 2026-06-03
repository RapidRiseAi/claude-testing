import { useState, useCallback } from 'react'
import Scene from '../components/scene/Scene'
import PricingWave from '../components/scene/PricingWave'
import Navbar from '../components/ui/Navbar'
import HeroSection from '../components/ui/HeroSection'
import ScrollSection from '../components/ui/ScrollSection'
import ExpertiseCarousel from '../components/ui/ExpertiseCarousel'
import FixedPricingSection from '../components/ui/FixedPricingSection'
import LoadingScreen from '../components/ui/LoadingScreen'
import useScrollSnap from '../hooks/useScrollSnap'

export default function HomePage() {
  const [loaded, setLoaded] = useState(false)
  const handleDone = useCallback(() => setLoaded(true), [])

  useScrollSnap()

  return (
    <>
      <LoadingScreen onDone={handleDone} />

      <Navbar loaded={loaded} />

      {/* Section-3 wave on its own layer BEHIND the content (z-index 1) so the
          opaque cards always sit in front of it. */}
      <PricingWave />

      <div id="canvas-container">
        <Scene />
      </div>

      <div id="scroll-content">
        <HeroSection loaded={loaded} />
        <ExpertiseCarousel />
        <FixedPricingSection />
        <ScrollSection
          index={1}
          title="Real-Time Automation"
          body="Triggers, workflows, and intelligent agents respond to your data as it moves, removing the friction between insight and action."
        />
        <ScrollSection
          index={2}
          title="Built to Scale"
          body="The ecosystem grows with you. Add new tools, services, and integrations without breaking what's already working."
        />
      </div>
    </>
  )
}
