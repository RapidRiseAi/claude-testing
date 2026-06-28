/* Generate public/sitemap.xml from the live route data.
   Runs as the first step of `npm run build` so the sitemap can never drift
   from the real services / legal pages. Only PUBLIC, indexable, 200 URLs go in
   — no redirects (/pricing, /solutions, …), no affiliate /r/ endpoints, no
   dev-only routes, no 404.                                                    */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { ALL_SERVICES } from '../src/data/services.js'
import { LEGAL_NAV } from '../src/data/legalContent.js'

const ORIGIN = 'https://www.rapidriseai.com'
const TODAY = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

// path, changefreq, priority. lastmod is the build date for every URL.
const urls = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/services', changefreq: 'monthly', priority: '0.9' },
  ...ALL_SERVICES.map((s) => ({
    path: `/services/${s.slug}`,
    changefreq: 'monthly',
    priority: '0.8',
  })),
  { path: '/contact', changefreq: 'monthly', priority: '0.8' },
  { path: '/proof', changefreq: 'monthly', priority: '0.7' },
  { path: '/about', changefreq: 'monthly', priority: '0.7' },
  { path: '/process', changefreq: 'monthly', priority: '0.7' },
  { path: '/industries', changefreq: 'monthly', priority: '0.7' },
  ...LEGAL_NAV.map((d) => ({
    path: `/${d.slug}`,
    changefreq: 'yearly',
    priority: '0.3',
  })),
]

const body = urls
  .map(
    ({ path, changefreq, priority }) =>
      `  <url>\n` +
      `    <loc>${ORIGIN}${path}</loc>\n` +
      `    <lastmod>${TODAY}</lastmod>\n` +
      `    <changefreq>${changefreq}</changefreq>\n` +
      `    <priority>${priority}</priority>\n` +
      `  </url>`,
  )
  .join('\n')

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  `${body}\n` +
  `</urlset>\n`

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../public/sitemap.xml')
writeFileSync(out, xml)
console.log(`sitemap.xml written with ${urls.length} URLs → ${out}`)
