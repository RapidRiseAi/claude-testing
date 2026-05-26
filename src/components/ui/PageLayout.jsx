import Navbar from './Navbar'

export default function PageLayout({ children }) {
  return (
    <>
      <Navbar loaded={true} />
      <main className="page-root">
        {children}
      </main>
    </>
  )
}
