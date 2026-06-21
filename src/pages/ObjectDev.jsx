import ObjectSlot from '../components/scene/ObjectSlot'

/* DEV-only object design harness. Renders the REAL persistent object (real shader)
   for a given CARD_GENERATORS index, large + centred + held at a fixed orientation,
   so it can be screenshotted and compared 1:1 against the reference tiles.
   Driven by /objdev?i=<index>&ry=<rad>&rx=<rad>. Wired in PersistentScene +
   App routes; remove before shipping. */
export default function ObjectDev() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#04060d', display: 'grid', placeItems: 'center', zIndex: 1 }}>
      <ObjectSlot className="objdev-slot" />
      <style>{`.objdev-slot{width:min(78vmin,820px);height:min(78vmin,820px);}`}</style>
    </div>
  )
}
