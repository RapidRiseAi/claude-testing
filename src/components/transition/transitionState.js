/**
 * Shared mutable singleton for the cinematic page transition.
 *
 * Same pattern as utils/carouselState.js: a plain object (NOT React state) that
 * the controller (TransitionProvider) writes every animation frame and the 3-D
 * overlay (TransitionCanvas) reads inside useFrame. Keeping it off React's
 * render path is what lets 13k orbs morph at 60fps without re-rendering the tree.
 *
 * Phases (see TransitionProvider for the timeline):
 *   'idle'        — nothing running; the overlay canvas is hidden / not drawing
 *   'flyup'       — scrolling the current page to the top (service→x only)
 *   'gather'      — orbs appear in the source shape, pull into a centre sphere
 *   'suck'        — black hole: page sucked in, route swapped under the mask
 *   'explode'     — orbs burst outward, the destination hero blooms from centre
 *   'reassemble'  — orbs settle into the destination object at its screen anchor
 *   'handoff'     — overlay fades out as the destination's real object fades in
 */
export const transitionState = {
  phase: 'idle',
  active: false,

  // Source / destination object indices (0–6 into CARD_GENERATORS). null = a
  // page with no live 3-D object (the morph never runs for those — see scope).
  fromIndex: 0,
  toIndex: 0,

  // Per-phase normalised progress 0→1. The overlay shader reads these directly.
  gather: 0,
  suck: 0,
  explode: 0,
  reassemble: 0,

  // Whole-overlay opacity (fade the orbs in at the start, out at handoff).
  opacity: 0,

  // On-screen anchor of the source / destination object. Each is a full handoff
  // descriptor { x, y, r, rotY, rotX } in CSS pixels (centre + on-screen radius)
  // plus the object's live rotation, so the overlay can reproduce the real
  // object's exact size + orientation and hand off without a snap. null →
  // screen centre / default size. srcAnchor is captured at click time; the
  // destination is tracked LIVE from the published screen data below while it
  // reassembles (dstAnchor is the frozen fallback measured once it mounts).
  srcAnchor: null,
  dstAnchor: null,

  // Which kind of object the source / destination owns ('home' | 'service'), so
  // the persistent object knows whether to collapse the home hero decoration
  // away (leaving home) or expand it back in (arriving home) during the morph.
  fromKind: null,
  toKind: null,

  // Live screen descriptors { x, y, r, rotY, rotX } (CSS px) published every
  // frame by the real objects while they are mounted: HeroOrb writes
  // homeOrbScreen, ServiceHeroObject writes svcObjScreen. The overlay reads the
  // source one at gather and the destination one while reassembling, so the
  // orbs settle onto the real object at its exact live position/size/rotation.
  homeOrbScreen: null,
  svcObjScreen: null,

  // Snapshot of the source page's visible elements (rects + colours, in CSS px)
  // captured at the start of a morph. The swarm spawns its particles FROM these
  // so the real content visibly disintegrates into particles. swarmSeedId bumps
  // each transition so the canvas knows to redistribute its particles.
  pageCells: null,
  swarmSeedId: 0,
}

export function resetTransitionProgress() {
  transitionState.gather = 0
  transitionState.suck = 0
  transitionState.explode = 0
  transitionState.reassemble = 0
  transitionState.opacity = 0
}
