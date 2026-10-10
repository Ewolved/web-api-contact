import { useEffect, useState, type FormEvent } from 'react'
import { companiesApi, contactsApi, errorMessage } from '../../api/api'
import type { Company } from '../../types/company'
import type { Contact } from '../../types/contact'

export default function LinkContactForm({
  companies,
  onLinked,
}: {
  companies: Company[]
  onLinked: () => Promise<void>
}) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [companyId, setCompanyId] = useState('')
  const [contactId, setContactId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    contactsApi.list()
      .then(setContacts)
      .catch((e: unknown) => setError(errorMessage(e)))
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (companyId === '' || contactId === '') {
      setError('Choisissez une entreprise et un contact')
      return
    }
    setSubmitting(true)
    try {
      const company = await companiesApi.addContact(Number(companyId), Number(contactId))
      const contact = contacts.find((c) => String(c.id) === contactId)
      const target = company.name || company.vatNumber
      setSuccess(
        contact === undefined
          ? `Contact rattaché à ${target}`
          : `${contact.firstName} ${contact.lastName} rattaché(e) à ${target}`,
      )
      setContactId('')
      await onLinked()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="card">
      <h2>Rattacher un contact</h2>
      <form className="form" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="alert alert--error" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert--success" role="status">
            {success}
          </div>
        )}
        <div className="field">
          <label htmlFor="link-company">Entreprise</label>
          <select id="link-company" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
            <option value="">— Choisir —</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name ? `${c.name} (${c.vatNumber})` : c.vatNumber}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="link-contact">Contact</label>
          <select id="link-contact" value={contactId} onChange={(e) => setContactId(e.target.value)}>
            <option value="">— Choisir —</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.lastName} {c.firstName}
              </option>
            ))}
          </select>
        </div>
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Rattachement…' : 'Rattacher'}
        </button>
      </form>
    </section>
  )
}
