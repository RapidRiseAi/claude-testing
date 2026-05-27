/**
 * Shared mutable singleton — ExpertiseCarousel writes, CarouselOverlay reads each frame.
 * Keep it a plain object (no React state) so 3-D code can read it in useFrame without
 * subscribing to re-renders.
 */
export const carouselState = {
  activeCard: 0,   // 0–6, set by ExpertiseCarousel on every card change
}
