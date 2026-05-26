import { Link } from 'react-router-dom'
import PageLayout from '../components/ui/PageLayout'
import { FIXED_PRICE, CUSTOM_SERVICES } from '../data/services'

function ServiceCard({ service }) {
  return (
    <Link to={`/services/${service.slug}`} className="service-card">
      <div className="service-card-badge">{service.badge}</div>
      <div className="service-card-name">{service.name}</div>
      <div className="service-card-tagline">{service.tagline}</div>
    </Link>
  )
}

export default function ServicesPage() {
  return (
    <PageLayout>
      <div className="services-hero">
        <p className="services-hero-eyebrow">What We Build</p>
        <h1 className="services-hero-h1">Services &<br />Products</h1>
        <p className="services-hero-sub">
          Fixed-price products for fast deployment. Custom services for complex, bespoke challenges. Every engagement is built to last.
        </p>
      </div>

      <section className="services-section">
        <div className="services-section-title">Fixed Price Products</div>
        <div className="services-grid">
          {FIXED_PRICE.map(s => <ServiceCard key={s.slug} service={s} />)}
        </div>
      </section>

      <section className="services-section">
        <div className="services-section-title">Custom Services</div>
        <div className="services-grid">
          {CUSTOM_SERVICES.map(s => <ServiceCard key={s.slug} service={s} />)}
        </div>
      </section>
    </PageLayout>
  )
}
