/**
 * Builds the index-aligned keyframe buffers the transition overlay morphs
 * between: the source object shape (aFrom) → a centre sphere → an exploded
 * cloud → the destination object shape (aTo).
 *
 * The seven object shapes are the EXACT same ones the home carousel and the
 * service hero use — reused via CARD_GENERATORS / normalizeCardShapes exported
 * from HeroOrb (same approach as ServiceHeroObject.getCardBufs). Generating them
 * fresh here (rather than sharing the live arrays) is safe because
 * normalizeCardShapes mutates in place and we don't want to touch the live ones.
 *
 * On mobile we decimate by a stride so every keyframe stays 1:1 index-aligned
 * (orb k samples cardBuf[k*stride] in every shape) — fewer orbs, same code path.
 */
import { CARD_GENERATORS, CARD_COLORS, normalizeCardShapes } from '../scene/HeroOrb'

export { CARD_COLORS }

const SPHERE_R = 1.70        // centre-sphere radius (matches the globe footprint)
const EXPLODE_BASE = 2.6     // minimum outward burst distance, local units
const EXPLODE_RAND = 4.2     // extra random burst distance on top of the base

// Deterministic-ish jitter without Date.now — fine for purely visual scatter.
function rand() { return Math.random() }

let _shapes = null

/**
 * @param {number} maxCount target orb count (desktop ≈ 13824, mobile much less)
 * @returns {{count, stride, full, cardBufs, sphere, explode, sizes, seeds}}
 */
export function getTransitionShapes(maxCount) {
  if (_shapes) return _shapes

  const cardBufs = CARD_GENERATORS.map((g) => {
    const r = g()
    return r instanceof Float32Array ? r : r.pos
  })
  normalizeCardShapes(cardBufs)

  const full = cardBufs[0].length / 3                       // N_ORB (13824)
  const stride = Math.max(1, Math.round(full / Math.max(1, maxCount)))
  const count = Math.floor(full / stride)

  const sphere = new Float32Array(count * 3)
  const explode = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const seeds = new Float32Array(count)

  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let k = 0; k < count; k++) {
    // Even fibonacci sphere — the implosion target, centred on the origin.
    const fy = 1 - (k / (count - 1)) * 2
    const fr = Math.sqrt(Math.max(0, 1 - fy * fy))
    const fa = golden * k
    const jitter = 0.985 + rand() * 0.03
    const x = Math.cos(fa) * fr * SPHERE_R * jitter
    const y = fy * SPHERE_R * jitter
    const z = Math.sin(fa) * fr * SPHERE_R * jitter
    sphere[k * 3] = x
    sphere[k * 3 + 1] = y
    sphere[k * 3 + 2] = z

    // Explosion: push radially outward from centre by a random distance, with a
    // little per-axis scatter so the burst reads organic rather than a clean shell.
    const len = Math.max(1e-3, Math.sqrt(x * x + y * y + z * z))
    const mag = EXPLODE_BASE + rand() * EXPLODE_RAND
    explode[k * 3] = (x / len) * mag + (rand() - 0.5) * 1.1
    explode[k * 3 + 1] = (y / len) * mag + (rand() - 0.5) * 1.1
    explode[k * 3 + 2] = (z / len) * mag + (rand() - 0.5) * 1.1

    sizes[k] = 0.85 + rand() * 0.5
    seeds[k] = rand()
  }

  _shapes = { count, stride, full, cardBufs, sphere, explode, sizes, seeds }
  return _shapes
}

/** Copy one object shape into a target buffer using the active stride. */
export function fillFromCard(target, cardIndex, shapes) {
  const { stride, count, cardBufs } = shapes
  const buf = cardBufs[cardIndex] ?? cardBufs[0]
  for (let k = 0; k < count; k++) {
    const s = k * stride * 3
    target[k * 3] = buf[s]
    target[k * 3 + 1] = buf[s + 1]
    target[k * 3 + 2] = buf[s + 2]
  }
}
