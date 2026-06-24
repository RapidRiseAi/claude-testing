/* Small "swipe" affordance shown UNDER a horizontal card row on mobile (hidden on
   desktop via CSS). Makes it obvious the cards scroll sideways. */
export default function SwipeHint({ label = 'Swipe' }) {
  return (
    <p className="swipe-hint" aria-hidden="true">
      <svg className="swipe-hint-ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 9.5 3.5 13 7 16.5M17 9.5 20.5 13 17 16.5M4.5 13h15" />
      </svg>
      {label}
    </p>
  )
}
