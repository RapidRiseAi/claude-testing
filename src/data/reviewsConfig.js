// ── Google Reviews widget — curated, hand-maintained data ────────────────────
//
// These are YOUR real Google reviews, copied in by hand and updated monthly.
// Nothing is fetched live: the widget renders straight from this file, so there
// are NO API keys, NO Google Cloud billing, and NO third-party network calls —
// it stays fully first-party and privacy-clean (consistent with consent.js).
//
// ▶ TO UPDATE EACH MONTH: edit `rating`, `total`, and the `reviews` list below,
//   then redeploy. (Just ask me — paste your latest reviews and I'll refresh it.)

export const REVIEWS_CONFIG = {
  businessName: 'Rapid Rise AI',

  // Your Google Business Profile — where "See more reviews" sends visitors.
  profileUrl: 'https://share.google/99hwOMHhM2R6tQDRq',

  // Your REAL overall Google rating + total review count. These drive the stars
  // and the "N reviews" line, so keep them accurate to your actual profile.
  rating: 5.0, // your actual overall rating shown on Google
  total: 4,    // your actual total number of Google reviews

  // The reviews to feature. The widget shows your top 3 by star rating.
  // Fill one object per review:
  //   author — the reviewer's name exactly as shown on Google
  //   rating — 1–5 (whole number)
  //   text   — the review wording (the quote), kept verbatim from Google
  //   when   — free text like "2 weeks ago" or "March 2026" (optional)
  reviews: [
    {
      author: 'Chantalle Theunissen',
      rating: 5,
      text: 'Excellent service and went out of there way to assist me with alot more. Very grateful. Highly recommended.',
      when: '4 weeks ago',
    },
    {
      author: 'Onyx Details',
      rating: 5,
      text: 'Very professional website and has helped my business grow and clients love the setup easy to use, understand and quick bookings definitely recommend Rapid rise Ai to someone looking for something perfect easy to use and good pricing',
      when: 'a month ago',
    },
    {
      author: 'Zjak Pieterse',
      rating: 5,
      text: 'Valuable training being provided with a strong focus on foundational concepts on how to think when it comes to using AI. Great learning material and wonderful collaboration from service provider',
      when: '10 months ago',
    },
  ],

  // How many reviews to feature (your "top N by rating").
  // Closing the widget collapses it to a small pill (it never disappears), so
  // there's no "reappear" timer to configure. The collapsed/expanded choice is
  // remembered in localStorage — a functional UI preference, not tracking.
  maxReviews: 3,
}
