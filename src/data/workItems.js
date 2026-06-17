// ── "Our Work" section — editable work-item list ────────────────────────────
//
// The Section-4 layout renders ENTIRELY from this array: add, remove, reorder
// or replace items here and the section updates — no JSX changes needed.
//
// Field reference (per item):
//   id                 unique stable string (used as the React key)
//   number             display number ('01'…). Optional — omit it and the row
//                      auto-numbers from its position in the array.
//   title              project name shown in the list row and preview
//   status             honest label — one of: 'Live Client Site' (real, live
//                      client work) | 'Live Site' (our own live site) |
//                      'Showcase' (fully functional product, no real client data).
//   tier               (optional) 'starter' marks an entry-level / budget build.
//   note               (optional) short caveat shown on the card (e.g. budget tier).
//   external           (optional) true → href is an external live site (opens in a new tab).
//   tags               service chips (small pills; icons matched by keyword)
//   shortDescription   concise one liner (kept in the data for project pages /
//                      future layouts; the preview panel shows previewDescription)
//   previewDescription longer copy for the preview panel
//   highlights         3–4 bullet feature points for the preview panel
//   ctaLabel           preview button text ('View Project', 'View Demo', …)
//   href               internal route. If a real product page exists use it
//                      (see src/data/services.js slugs); otherwise point at the
//                      closest /services/:slug page until a project page exists.
//   mediaType          'image' | 'video' | 'mock'
//   mediaSrc           path/URL of the preview media (image/video types)
//   mockKind           for mediaType 'mock': which ConceptPreview mockup to
//                      render ('website' | 'portal' | 'inspection' | 'menu' |
//                      'chat' | 'dashboard'). Swap to a real image once a
//                      capture exists.
//   mediaAlt           accessible description of the media

export const WORK_SECTION_COPY = {
  eyebrow: 'Proof & Builds',
  title: 'Our Work',
  sub: 'Live client websites and working showcases — from booking-ready starter sites to connected dashboards, automations, and AI tools. Click any preview to browse its screens.',
}

// Build a gallery path list for a build: the cover slide first, then each UI
// screen (01, 02, …). Files live in public/work/<slug>/.
const shots = (slug, n) =>
  ['cover', ...Array.from({ length: n }, (_, i) => String(i + 1).padStart(2, '0'))]
    .map((f) => `/work/${slug}/${f}.png`)

// Real client sites with both desktop + mobile captures: desktop screens
// (pc-NN.png) first, then mobile screens (mobile-NN.jpg). Cover = pc-01.
const mix = (slug, pc, mob) => [
  ...Array.from({ length: pc }, (_, i) => `/work/${slug}/pc-${String(i + 1).padStart(2, '0')}.png`),
  ...Array.from({ length: mob }, (_, i) => `/work/${slug}/mobile-${String(i + 1).padStart(2, '0')}.jpg`),
]

export const WORK_ITEMS = [
  {
    id: 'rapid-rise-website',
    number: '01',
    title: 'Rapid Rise AI Website',
    status: 'Live Site',
    tags: ['Website Design', '3D Experience', 'Web Development', 'Brand System'],
    shortDescription:
      'A premium interactive website built to position Rapid Rise AI as a modern AI, software, and connected systems company.',
    previewDescription:
      'A dark, 3D driven website experience with interactive objects, premium service sections, fixed pricing cards, and conversion focused CTAs.',
    highlights: [
      'Premium 3D hero experience',
      'Interactive service sections',
      'Fixed pricing package layout',
      'Conversion focused design system',
    ],
    ctaLabel: 'View Project',
    href: '/services/website-development',
    mediaType: 'image',
    mediaSrc: '/work/rapid-rise-website/cover.png',
    gallery: shots('rapid-rise-website', 4),
    mockKind: 'website',
    mediaAlt: 'Rapid Rise AI website — interactive 3D homepage, services, pricing, and work',
  },
  {
    id: 'onyx-details',
    title: 'Onyx Details',
    status: 'Live Client Site',
    tier: 'starter',
    tags: ['Starter Website', 'Online Booking', 'Lead Capture', 'Mobile First'],
    shortDescription:
      'A live starter website for a mobile car-detailing business, with online booking and lead capture built in.',
    previewDescription:
      'A clean, fast starter site for Onyx Details: service and package listings, an online booking flow, and lead capture — everything a new service business needs to start taking jobs online.',
    highlights: [
      'Service and package listing',
      'Online booking flow',
      'Lead capture built in',
      'Mobile first and fast loading',
    ],
    note: 'Our most affordable build, and sophisticated for the price. Best suited to new and small businesses. Established brands should choose a more advanced build.',
    ctaLabel: 'Visit Live Site',
    href: 'https://onyxdetails.co.za/',
    external: true,
    mediaType: 'image',
    mediaSrc: '/work/onyx-details/pc-01.png',
    gallery: mix('onyx-details', 7, 9),
    mediaAlt: 'Onyx Details live mobile car detailing website: desktop and mobile screens',
  },
  {
    id: 'commando-gym',
    title: 'Commando Gym',
    status: 'Live Client Site',
    tier: 'starter',
    tags: ['Starter Website', 'Memberships', 'Lead Capture', 'Bookings'],
    shortDescription:
      'A live starter website for a 24/7 gym and wellness studio in Sabie, with memberships and lead capture.',
    previewDescription:
      'A starter site for Commando: membership tiers, wellness-studio booking prompts, FAQs, location, and lead capture — a complete online presence for an independent gym at an entry-level price.',
    highlights: [
      'Membership tiers',
      'Wellness studio bookings',
      'Lead capture built in',
      'Mobile first and fast loading',
    ],
    note: 'Our most affordable build, and sophisticated for the price. Best suited to new and small businesses. Established brands should choose a more advanced build.',
    ctaLabel: 'Visit Live Site',
    href: 'https://www.commandoonline.co.za/',
    external: true,
    mediaType: 'image',
    mediaSrc: '/work/commando/pc-01.png',
    gallery: mix('commando', 8, 8),
    mediaAlt: 'Commando 24/7 gym and wellness live website: desktop and mobile screens',
  },
  {
    id: 'client-portal-system',
    number: '02',
    title: 'Client Portal System',
    status: 'Showcase',
    tags: ['Client Portals', 'Dashboards', 'Document Collection', 'Automation'],
    shortDescription:
      'A client portal concept for businesses that need to collect documents, manage clients, track progress, and reduce repetitive admin.',
    previewDescription:
      'A central portal where customers can submit information, upload documents, track status, and access updates without constant back and forth messages.',
    highlights: [
      'Client login area',
      'Document and form collection',
      'Status tracking',
      'Dashboard ready data',
    ],
    ctaLabel: 'View Product',
    href: '/services/client-portal',
    mediaType: 'image',
    mediaSrc: '/work/client-portal/cover.png',
    gallery: shots('client-portal', 6),
    mockKind: 'portal',
    mediaAlt: 'Client portal demo: secure login, document collection, and status tracking',
  },
  {
    id: 'building-inspection-system',
    number: '03',
    title: 'Building Inspection System',
    status: 'Showcase',
    tags: ['Custom Software', 'Inspection Tools', 'Mobile App', 'Reporting'],
    shortDescription:
      'A mobile first inspection system concept designed for building inspection teams that need structured checklists, image capture, severity tracking, and reporting.',
    previewDescription:
      'A field ready inspection workflow where teams can complete custom checklists, upload evidence, mark severity, and prepare structured reports.',
    highlights: [
      'Mobile first checklist flow',
      'Image and note capture',
      'Severity tracking',
      'Template builder concept',
    ],
    ctaLabel: 'View Prototype',
    href: '/services/software-development',
    mediaType: 'image',
    mediaSrc: '/work/inspection/cover.png',
    gallery: shots('inspection', 5),
    mockKind: 'inspection',
    mediaAlt: 'Building inspection mobile checklist and reporting prototype',
  },
  {
    id: 'digital-menu-system',
    number: '04',
    title: 'Digital Menu & Branch Management System',
    status: 'Showcase',
    tags: ['Digital Menu', 'QR System', 'Management Portal', 'Hospitality'],
    shortDescription:
      'A branded digital menu concept for restaurants and bars with a single QR per branch and a management portal for updating menu items.',
    previewDescription:
      'A mobile first menu experience designed to make browsing easier for customers while giving the business control over pricing, items, categories, and branch menus.',
    highlights: [
      'Single QR per branch',
      'Mobile first menu',
      'Branch level menu control',
      'Admin management portal',
    ],
    ctaLabel: 'View Demo',
    href: '/services/web-app-development',
    mediaType: 'image',
    mediaSrc: '/work/qr-menu/cover.png',
    gallery: shots('qr-menu', 5),
    mockKind: 'menu',
    mediaAlt: 'Restaurant digital menu on a phone with management portal',
  },
  {
    id: 'ai-communication-agent',
    number: '05',
    title: 'AI Communication Agent',
    status: 'Showcase',
    tags: ['AI Agents', 'Support Automation', 'WhatsApp', 'Website Chat'],
    shortDescription:
      'An AI communication system concept for businesses that need to answer common questions, route enquiries, capture leads, and support customers faster.',
    previewDescription:
      'A connected AI assistant designed to handle website or WhatsApp conversations, answer from a knowledge base, and route important enquiries to the right team.',
    highlights: [
      'Website and WhatsApp support concept',
      'Knowledge base answers',
      'Lead capture flow',
      'Human handover path',
    ],
    ctaLabel: 'View Product',
    href: '/services/ai-communication-agent',
    mediaType: 'image',
    mediaSrc: '/work/ai-agent/cover.png',
    gallery: shots('ai-agent', 4),
    mockKind: 'chat',
    mediaAlt: 'AI communication agent answering and routing customer questions',
  },
  {
    id: 'smart-business-dashboard',
    number: '06',
    title: 'Smart Business Dashboard',
    status: 'Showcase',
    tags: ['Smart Dashboards', 'Analytics', 'Reporting', 'Automation'],
    shortDescription:
      'A dashboard concept that turns business activity, leads, tasks, and operational data into clear visual reporting.',
    previewDescription:
      'A smart dashboard built to help businesses understand performance, track activity, and make better decisions using live or automated data flows.',
    highlights: [
      'KPI overview',
      'Lead and task tracking',
      'Automated reporting',
      'Business performance visibility',
    ],
    ctaLabel: 'View Product',
    href: '/services/smart-dashboards',
    mediaType: 'image',
    mediaSrc: '/work/dashboard/cover.png',
    gallery: shots('dashboard', 3),
    mockKind: 'dashboard',
    mediaAlt: 'Smart business dashboard with KPIs, charts, and reporting',
  },
]
