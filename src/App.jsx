import { Routes, Route, Navigate } from 'react-router-dom'
import CursorTrail from './components/ui/CursorTrail'
import EdgeSpotlight from './components/ui/EdgeSpotlight'
import ScrollManager from './components/ScrollManager'
import AffiliateTracker from './components/AffiliateTracker'
import { SpeedInsights } from '@vercel/speed-insights/react'
import PersistentScene from './components/scene/PersistentScene'
import TransitionProvider from './components/transition/TransitionProvider'
import CookieConsent from './components/ui/CookieConsent'
import GoogleReviewsWidget from './components/ui/GoogleReviewsWidget'
import ObjectDev from './pages/ObjectDev'
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import ServiceDetailPage from './pages/ServiceDetailPage'
import ProofPage from './pages/ProofPage'
import AboutPage from './pages/AboutPage'
import ProcessPage from './pages/ProcessPage'
import IndustriesPage from './pages/IndustriesPage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'
import LegalPage from './pages/LegalPage'
import { LEGAL_NAV } from './data/legalContent'

export default function App() {
  return (
    <>
      <ScrollManager />
      {/* Non-visual: captures ?ref=/?affiliate=/?utm_affiliate= referral codes. */}
      <AffiliateTracker />
      {/* The ONE persistent 3-D object — mounted once here so it survives every
          route change (the basis for "all pages share the same object"). */}
      <PersistentScene />
      {/* EdgeSpotlight (ambient glow) before CursorTrail so the sharp comet
          paints on top and the soft glow rides behind the cursor. */}
      <EdgeSpotlight />
      <CursorTrail />
      <TransitionProvider>
      <Routes>
      <Route path="/" element={<HomePage />} />
      {/* DEV-only: isolated object preview for reference matching (remove before ship) */}
      <Route path="/objdev" element={<ObjectDev />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/services/:slug" element={<ServiceDetailPage />} />
      <Route path="/pricing" element={<Navigate to="/services" replace />} />
      <Route path="/proof" element={<ProofPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/process" element={<ProcessPage />} />
      <Route path="/industries" element={<IndustriesPage />} />
      <Route path="/contact" element={<ContactPage />} />
      {/* Legal documents at top-level routes (/privacy-policy, /paia-manual, …) */}
      {LEGAL_NAV.map((doc) => (
        <Route key={doc.slug} path={`/${doc.slug}`} element={<LegalPage slug={doc.slug} />} />
      ))}
      {/* Catch-all: mistyped URLs render a real 404 page, never a blank screen */}
      <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </TransitionProvider>
      <GoogleReviewsWidget />
      <CookieConsent />
      <SpeedInsights />
    </>
  )
}
