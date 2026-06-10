import Navbar from './Navbar'
import SiteFooter from './SiteFooter'

export default function PageLayout({ children }) {
  return (
    <>
      <Navbar loaded={true} />
      <main className="page-root">
        {children}
      </main>
      <SiteFooter />
    </>
  )
}
