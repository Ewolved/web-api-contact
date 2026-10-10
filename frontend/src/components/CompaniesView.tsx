import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import {
  addContactToCompany,
  ApiRequestError,
  createCompany,
  errorMessage,
  getCompanies,
  getContacts,
  updateCompany,
} from '../api'
import type { Company, CompanyRequest } from '../types/company'
import type { Contact } from '../types/contact'
import ContactChips from './ContactChips'

type CompanyForm = { name: string; address: string; vatNumber: string }

const EMPTY_FORM: CompanyForm = { name: '', address: '', vatNumber: '' }

export default function CompaniesView() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const load = useCallback(async () => {
    try {
      setCompanies(await getCompanies())
      setLoadError(null)
    } catch (e) {
      setLoadError(errorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    return () => clearTimeout(timerRef.current)
  }, [load])

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setFieldErrors({})
    setFormError(null)
  }

  const startEdit = (company: Company) => {
    setForm({ name: company.name ?? '', address: company.address, vatNumber: company.vatNumber })
    setEditingId(company.id)
    setFieldErrors({})
    setFormError(null)
    setSuccess(null)
  }

  const update = (name: keyof CompanyForm) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setForm((f) => ({ ...f, [name]: value }))
    setFieldErrors((errs) => {
      if (!errs[name]) return errs
      const { [name]: _removed, ...rest } = errs
      return rest
    })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setFieldErrors({})
    setFormError(null)
    setSuccess(null)
    clearTimeout(timerRef.current)
    const payload: CompanyRequest = {
      name: form.name.trim() === '' ? null : form.name,
      address: form.address,
      vatNumber: form.vatNumber,
    }
    try {
      if (editingId === null) {
        await createCompany(payload)
        setSuccess('Entreprise créée')
      } else {
        await updateCompany(editingId, payload)
        setSuccess('Entreprise modifiée')
      }
      timerRef.current = setTimeout(() => setSuccess(null), 3000)
      resetForm()
      await load()
    } catch (err) {
      const errors = err instanceof ApiRequestError ? err.fieldErrors : {}
      setFieldErrors(errors)
      const rendered = ['name', 'address', 'vatNumber']
      const hidden = Object.keys(errors).filter((k) => !rendered.includes(k))
      if (hidden.length > 0) setFormError(hidden.map((k) => errors[k]).join(' ; '))
      else if (Object.keys(errors).length === 0) setFormError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const field = (name: keyof CompanyForm, label: string, required: boolean) => (
    <div className="field">
      <label htmlFor={`company-${name}`}>{label}</label>
      <input
        id={`company-${name}`}
        value={form[name]}
        onChange={update(name)}
        required={required}
        aria-required={required ? 'true' : undefined}
        aria-invalid={fieldErrors[name] ? 'true' : undefined}
        aria-describedby={fieldErrors[name] ? `company-${name}-error` : undefined}
      />
      {fieldErrors[name] && (
        <p className="field-error" id={`company-${name}-error`}>
          {fieldErrors[name]}
        </p>
      )}
    </div>
  )

  const isEditing = editingId !== null

  return (
    <div className="layout">
      <div className="stack">
        <section className="card">
          <h2>{isEditing ? "Modifier l'entreprise" : 'Nouvelle entreprise'}</h2>
          <form className="form" onSubmit={handleSubmit} noValidate>
            {formError && (
              <div className="alert alert--error" role="alert">
                {formError}
              </div>
            )}
            {success && (
              <div className="alert alert--success" role="status">
                {success}
              </div>
            )}
            {field('name', 'Nom', false)}
            {field('address', 'Adresse', true)}
            {field('vatNumber', 'N° TVA', true)}
            <div className="form-actions">
              <button className="btn" type="submit" disabled={submitting}>
                {submitting ? 'Enregistrement…' : isEditing ? 'Enregistrer' : "Créer l'entreprise"}
              </button>
              {isEditing && (
                <button className="btn btn--secondary" type="button" onClick={resetForm} disabled={submitting}>
                  Annuler
                </button>
              )}
            </div>
          </form>
        </section>

        <LinkContactForm companies={companies} onLinked={load} />
      </div>

      <section className="card">
        <h2>Entreprises</h2>
        {loadError && (
          <div className="alert alert--error" role="alert">
            {loadError}
          </div>
        )}
        {loading ? (
          <p className="empty">Chargement…</p>
        ) : companies.length === 0 ? (
          !loadError && <p className="empty">Aucune entreprise pour l'instant</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Nom</th>
                  <th scope="col">Adresse</th>
                  <th scope="col">TVA</th>
                  <th scope="col">Contacts</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id} className={c.id === editingId ? 'row--selected' : undefined}>
                    <td data-label="Nom">{c.name || '—'}</td>
                    <td data-label="Adresse">{c.address}</td>
                    <td data-label="TVA">{c.vatNumber}</td>
                    <td data-label="Contacts">
                      <ContactChips contacts={c.contacts} />
                    </td>
                    <td className="row-actions">
                      <button
                        type="button"
                        className="btn btn--small btn--secondary"
                        onClick={() => startEdit(c)}
                        aria-label={`Modifier ${c.name || c.vatNumber}`}
                      >
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function LinkContactForm({
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
    getContacts()
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
      const company = await addContactToCompany(Number(companyId), Number(contactId))
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
