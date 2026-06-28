import Navbar from '../components/ui/Navbar'
import HeroBackdropOrbs from '../components/ui/HeroBackdropOrbs'
import HeroSection from '../components/ui/HeroSection'
import ExpertiseCarousel from '../components/ui/ExpertiseCarousel'
import FixedPricingSection from '../components/ui/FixedPricingSection'
import OurWorkSection from '../components/ui/OurWorkSection'
import CustomPossibilitiesSection from '../components/ui/CustomPossibilitiesSection'
import SiteFooter from '../components/ui/SiteFooter'
import useScrollSnap from '../hooks/useScrollSnap'
import usePageMeta from '../hooks/usePageMeta'

export default function HomePage() {
  // No loading screen: the scene + content animate straight in on mount. `loaded`
  // is permanently true so the Navbar / HeroSection entrance animations still
  // fire immediately (they were previously gated on the loader finishing).
  const loaded = true

  // Mirrors the site-wide defaults in index.html and sets the homepage canonical.
  usePageMeta(
    'Rapid Rise AI | Custom Software, AI Systems & Business Automation',
    'Rapid Rise AI builds custom websites, client portals, smart dashboards, AI agents, automations, IoT systems and connected digital ecosystems for businesses in South Africa.',
  )

  useScrollSnap()

  return (
    <>
      <Navbar loaded={loaded} />

      {/* The 3-D object (#canvas-container) and atmospheric glow (#scene-atmosphere)
          now live at the app root in <PersistentScene> so the object survives
          navigation — they are no longer mounted per-page here. */}

      {/* Viewport-pinned ambient orb field. Sits ABOVE this comment / BEFORE
          #scroll-content in the DOM on purpose: at z-index 2 it ties the content
          layer, so source order is what keeps it behind every section's text. */}
      <HeroBackdropOrbs />

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
