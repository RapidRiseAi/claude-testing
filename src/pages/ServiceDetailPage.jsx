import { useParams, Link } from 'react-router-dom'
import PageLayout from '../components/ui/PageLayout'
import { ALL_SERVICES, FIXED_PRICE } from '../data/services'

export default function ServiceDetailPage() {
  const { slug } = useParams()
  const service = ALL_SERVICES.find(s => s.slug === slug)

  if (!service) {
    return (
      <PageLayout>
        <div className="placeholder-page">
          <h1>Service Not Found</h1>
          <p>The service you're looking for doesn't exist.</p>
          <Link to="/services" className="service-detail-back">← Back to Services</Link>
        </div>
      </PageLayout>
    )
  }

  const isFixed = FIXED_PRICE.some(s => s.slug === slug)

  return (
    <PageLayout>
      <div className="service-detail-hero">
        <Link to="/services" className="service-detail-back">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          All Services
        </Link>

        <div className="service-detail-badge">
          {isFixed ? 'Fixed Price Product' : 'Custom Service'}
        </div>

        <h1 className="service-detail-h1">{service.name}</h1>
        <p className="service-detail-tagline">{service.tagline}</p>
        <p className="service-detail-desc">{service.description}</p>
      </div>

      <div className="service-coming-soon">
        <h3>Full page coming soon</h3>
        <p>Detailed case studies, process breakdowns, and pricing information will be added here.</p>
      </div>
    </PageLayout>
  )
}
