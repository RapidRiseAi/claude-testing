/* Service slug → 3-D object/card index (0–6, into CARD_GENERATORS / the home
   carousel order). The ONE persistent object reads this to morph into the right
   shape when docking into a service page.

   Object indices (home carousel order):
     0 globe · 1 gear · 2 code block · 3 workflow clock
     4 intelligence sparkle · 5 connected rings · 6 funnel */
export const SLUG_TO_OBJECT = {
  'website-development': 0,    // globe
  'software-development': 1,   // gear
  'web-app-development': 10,   // browser + phone (App Development)
  'automated-workflow': 3,     // clock
  'ai-implementation': 4,      // sparkle
  ecosystems: 5,               // interlocking rings
  'marketing-seo': 6,          // funnel
  // dedicated new objects (indices 7–11 in CARD_GENERATORS)
  'client-portal': 7,          // arched portal + figure
  'smart-dashboards': 8,       // dashboard panel + charts
  'ai-communication-agent': 9, // chat bubbles + nodes
  'iot-development': 11,        // chip network
}
