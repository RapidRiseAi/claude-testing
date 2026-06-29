import { useEffect } from 'react'

/* Per-page document title + meta description (+ matching Open Graph tags),
   plus a canonical URL and an explicit robots directive.
   index.html carries the site-wide defaults; this keeps the <head> correct as
   the SPA changes routes (the head persists across client navigation, so every
   field is set explicitly each time — an earlier `noindex` must never stick).

   Production canonical base. The site uses the www host (see index.html og:url
   and the company details in the legal pages). */
const SITE_URL = 'https://www.rapidriseai.com'

/* Build an absolute canonical URL from the current path: drop /index.html and
   any trailing slash so /about and /about/ never look like two pages (root
   stays the bare origin). */
function canonicalFromPath(pathname) {
  const path = pathname.replace(/\/index\.html$/i, '/').replace(/\/+$/, '')
  return SITE_URL + path
}

export default function usePageMeta(title, description, options = {}) {
  const { noindex = false, canonical } = options
  useEffect(() => {
    if (title) document.title = title

    const setMeta = (attr, key, value) => {
      if (value == null) return
      let el = document.head.querySelector(`meta[${attr}="${key}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, key)
        document.head.appendChild(el)
      }
      el.setAttribute('content', value)
    }

    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)

    // Always set robots explicitly so navigating off a noindex page (404,
    // "not found") restores indexability on the next route.
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')

    // Canonical + og:url. Skip (and remove) for noindex pages — they should not
    // claim to be the canonical version of anything.
    const link = document.head.querySelector('link[rel="canonical"]')
    if (noindex) {
      if (link) link.remove()
      return
    }
    const href = canonical
      ? (canonical.startsWith('http') ? canonical : SITE_URL + canonical)
      : canonicalFromPath(window.location.pathname)
    let canonicalLink = link
    if (!canonicalLink) {
      canonicalLink = document.createElement('link')
      canonicalLink.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalLink)
    }
    canonicalLink.setAttribute('href', href)
    setMeta('property', 'og:url', href)
  }, [title, description, noindex, canonical])
}
