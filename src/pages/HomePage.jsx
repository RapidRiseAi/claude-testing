import { useState, useCallback } from 'react'
import Scene from '../components/scene/Scene'
import Navbar from '../components/ui/Navbar'
import HeroSection from '../components/ui/HeroSection'
import ExpertiseCarousel from '../components/ui/ExpertiseCarousel'
import FixedPricingSection from '../components/ui/FixedPricingSection'
import OurWorkSection from '../components/ui/OurWorkSection'
import CustomPossibilitiesSection from '../components/ui/CustomPossibilitiesSection'
import SiteFooter from '../components/ui/SiteFooter'
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

      {/* Fixed atmospheric glow that lives BEHIND the wave (z-index 0). Eased in/
          out by the scroll handler so it's a calm, persistent background — not a
          foreground filter on the section. */}
      <div id="scene-atmosphere" aria-hidden="true" />

      <div id="canvas-container">
        <Scene />
      </div>

      <div id="scroll-content">
        <HeroSection loaded={loaded} />
        <ExpertiseCarousel />
        <FixedPricingSection />
        <OurWorkSection />
        <CustomPossibilitiesSection />
        <SiteFooter />
      </div>
    </>
  )
}
