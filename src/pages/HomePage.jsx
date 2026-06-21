import Navbar from '../components/ui/Navbar'
import HeroSection from '../components/ui/HeroSection'
import ExpertiseCarousel from '../components/ui/ExpertiseCarousel'
import FixedPricingSection from '../components/ui/FixedPricingSection'
import OurWorkSection from '../components/ui/OurWorkSection'
import CustomPossibilitiesSection from '../components/ui/CustomPossibilitiesSection'
import SiteFooter from '../components/ui/SiteFooter'
import useScrollSnap from '../hooks/useScrollSnap'

export default function HomePage() {
  // No loading screen: the scene + content animate straight in on mount. `loaded`
  // is permanently true so the Navbar / HeroSection entrance animations still
  // fire immediately (they were previously gated on the loader finishing).
  const loaded = true

  useScrollSnap()

  return (
    <>
      <Navbar loaded={loaded} />

      {/* The 3-D object (#canvas-container) and atmospheric glow (#scene-atmosphere)
          now live at the app root in <PersistentScene> so the object survives
          navigation — they are no longer mounted per-page here. */}

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
