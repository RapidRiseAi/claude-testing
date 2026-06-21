/**
 * Shared mutable singleton describing what the ONE persistent 3-D object should
 * be doing for the current route. Same pattern as carouselState / transitionState:
 * a plain object (not React state) read inside useFrame so the object can react
 * to navigation without re-rendering the tree.
 *
 * The home page, service pages, and the page transition all drive this; the
 * persistent HeroOrb reads it to decide its state (home scroll choreography vs.
 * docking into a service page's hero slot).
 */
export const worldState = {
  // 'home'    — run the home scroll choreography (hero globe → cards → wave)
  // 'service' — dock into the active service page's hero slot, in its shape
  // 'other'   — a page with no object slot; the object parks off-screen / hidden
  mode: 'home',
  slug: null,        // active service slug when mode === 'service'
  index: null,       // object/card index (0–6) for the active service, else null

  // Live screen rect (CSS px) of the destination object slot, published every
  // frame by whichever page owns a slot (ServiceDetailPage's .sd-hero-visual).
  // The persistent object reads this to dock itself onto the slot. null → none.
  slot: null,        // { x, y, w, h } centre+size in CSS px, or null

  // DEV-only (object design loop): when true the docked object holds a fixed
  // orientation (devRotY/devRotX) instead of the idle sway, so reference
  // comparisons are stable. Set by the /objdev preview route.
  freezeSway: false,
  devRotY: 0,
  devRotX: 0,
}
