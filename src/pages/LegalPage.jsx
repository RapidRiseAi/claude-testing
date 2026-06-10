import { useParams, Link } from 'react-router-dom'
import PageLayout from '../components/ui/PageLayout'

/* Placeholder pages for the footer's legal links. The real documents must be
   written/reviewed before publishing — this page only reserves the routes so
   no footer link dead-ends. Add slugs here as new documents are planned. */
const LEGAL_DOCS = {
  'privacy-policy': 'Privacy Policy',
  'terms-of-service': 'Terms of Service',
  'paia-manual': 'PAIA Manual',
  'cookie-notice': 'Cookie Notice',
  'popia-notice': 'POPIA Notice',
  'refund-policy': 'Refund / Cancellation Policy',
}

export default function LegalPage() {
  const { slug } = useParams()
  const title = LEGAL_DOCS[slug] ?? 'Legal Document'

  return (
    <PageLayout>
      <section className="legal-page">
        <p className="legal-eyebrow">Legal</p>
        <h1 className="legal-title">{title}</h1>
        <p className="legal-body">
          This document is being prepared and will be published here. If you need
          this information in the meantime, contact us at{' '}
          <a href="mailto:team@rapidriseai.com">team@rapidriseai.com</a> and we
          will assist you directly.
        </p>
        <Link className="legal-back" to="/">← Back to home</Link>
      </section>
    </PageLayout>
  )
}
