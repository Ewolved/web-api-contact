import type { ContactSummary } from '../types/company'

export default function ContactChips({ contacts }: { contacts: ContactSummary[] }) {
  if (contacts.length === 0) return <span className="muted">—</span>
  return (
    <>
      {contacts.map((co) => (
        <span className="chip" key={co.id}>
          {co.firstName} {co.lastName}
        </span>
      ))}
    </>
  )
}
