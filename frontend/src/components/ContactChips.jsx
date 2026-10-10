export default function ContactChips({ contacts }) {
  if (!contacts || contacts.length === 0) return <span className="muted">—</span>
  return contacts.map((co) => (
    <span className="chip" key={co.id}>
      {co.firstName} {co.lastName}
    </span>
  ))
}
