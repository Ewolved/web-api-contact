import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import {
  ApiRequestError,
  createContact,
  deleteContact,
  errorMessage,
  getContacts,
  updateContact,
} from '../api'
import type { Contact, ContactRequest, ContactType } from '../types/contact'

type ContactForm = {
  firstName: string
  lastName: string
  address: string
  type: ContactType
  vatNumber: string
}

const EMPTY_FORM: ContactForm = { firstName: '', lastName: '', address: '', type: 'EMPLOYEE', vatNumber: '' }

const TYPE_LABELS: Record<ContactType, string> = { EMPLOYEE: 'Employé', FREELANCE: 'Freelance' }

export default function ContactsView() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const load = useCallback(async () => {
    try {
      setContacts(await getContacts())
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

  const showSuccess = (message: string) => {
    setSuccess(message)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setSuccess(null), 3000)
  }

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setFieldErrors({})
    setFormError(null)
  }

  const startEdit = (contact: Contact) => {
    setForm({
      firstName: contact.firstName,
      lastName: contact.lastName,
      address: contact.address,
      type: contact.type,
      vatNumber: contact.vatNumber ?? '',
    })
    setEditingId(contact.id)
    setFieldErrors({})
    setFormError(null)
    setSuccess(null)
  }

  const update = (name: keyof ContactForm) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value
    setForm((f) => ({
      ...f,
      [name]: name === 'type' ? (value === 'FREELANCE' ? 'FREELANCE' : 'EMPLOYEE') : value,
    }))
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
    const payload: ContactRequest = {
      firstName: form.firstName,
      lastName: form.lastName,
      address: form.address,
      type: form.type,
      vatNumber: form.type === 'FREELANCE' ? form.vatNumber : null,
    }
    try {
      if (editingId === null) {
        await createContact(payload)
        showSuccess('Contact créé')
      } else {
        await updateContact(editingId, payload)
        showSuccess('Contact modifié')
      }
      resetForm()
      await load()
    } catch (err) {
      const errors = err instanceof ApiRequestError ? err.fieldErrors : {}
      setFieldErrors(errors)
      const rendered = ['firstName', 'lastName', 'address', 'type']
      if (form.type === 'FREELANCE') rendered.push('vatNumber')
      const hidden = Object.keys(errors).filter((k) => !rendered.includes(k))
      if (hidden.length > 0) setFormError(hidden.map((k) => errors[k]).join(' ; '))
      else if (Object.keys(errors).length === 0) setFormError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (contact: Contact) => {
    if (!window.confirm(`Supprimer le contact ${contact.firstName} ${contact.lastName} ?`)) return
    setDeletingId(contact.id)
    try {
      await deleteContact(contact.id)
      if (editingId === contact.id) resetForm()
      showSuccess('Contact supprimé')
      await load()
    } catch (err) {
      setLoadError(errorMessage(err))
    } finally {
      setDeletingId(null)
    }
  }

  const field = (name: keyof ContactForm, label: string, required: boolean) => (
    <div className="field">
      <label htmlFor={`contact-${name}`}>{label}</label>
      <input
        id={`contact-${name}`}
        value={form[name]}
        onChange={update(name)}
        required={required}
        aria-required={required ? 'true' : undefined}
        aria-invalid={fieldErrors[name] ? 'true' : undefined}
        aria-describedby={fieldErrors[name] ? `contact-${name}-error` : undefined}
      />
      {fieldErrors[name] && (
        <p className="field-error" id={`contact-${name}-error`}>
          {fieldErrors[name]}
        </p>
      )}
    </div>
  )

  const isFreelance = form.type === 'FREELANCE'
  const isEditing = editingId !== null

  return (
    <div className="layout">
      <section className="card">
        <h2>{isEditing ? 'Modifier le contact' : 'Nouveau contact'}</h2>
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
          {field('firstName', 'Prénom', true)}
          {field('lastName', 'Nom', true)}
          {field('address', 'Adresse', true)}
          <div className="field">
            <label htmlFor="contact-type">Type</label>
            <select
              id="contact-type"
              value={form.type}
              onChange={update('type')}
              aria-invalid={fieldErrors.type ? 'true' : undefined}
              aria-describedby={fieldErrors.type ? 'contact-type-error' : undefined}
            >
              <option value="EMPLOYEE">Employé</option>
              <option value="FREELANCE">Freelance</option>
            </select>
            {fieldErrors.type && (
              <p className="field-error" id="contact-type-error">
                {fieldErrors.type}
              </p>
            )}
          </div>
          {isFreelance && field('vatNumber', 'N° TVA', true)}
          <div className="form-actions">
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? 'Enregistrement…' : isEditing ? 'Enregistrer' : 'Créer le contact'}
            </button>
            {isEditing && (
              <button className="btn btn--secondary" type="button" onClick={resetForm} disabled={submitting}>
                Annuler
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="card">
        <h2>Contacts</h2>
        {loadError && (
          <div className="alert alert--error" role="alert">
            {loadError}
          </div>
        )}
        {loading ? (
          <p className="empty">Chargement…</p>
        ) : contacts.length === 0 ? (
          !loadError && <p className="empty">Aucun contact pour l'instant</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Nom</th>
                  <th scope="col">Prénom</th>
                  <th scope="col">Adresse</th>
                  <th scope="col">Type</th>
                  <th scope="col">TVA</th>
                  <th scope="col">Entreprises</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className={c.id === editingId ? 'row--selected' : undefined}>
                    <td data-label="ID" className="cell-id">{c.id}</td>
                    <td data-label="Nom">{c.lastName}</td>
                    <td data-label="Prénom">{c.firstName}</td>
                    <td data-label="Adresse">{c.address}</td>
                    <td data-label="Type">
                      <span className={`badge badge--${c.type === 'FREELANCE' ? 'freelance' : 'employee'}`}>
                        {TYPE_LABELS[c.type] ?? c.type}
                      </span>
                    </td>
                    <td data-label="TVA">{c.vatNumber || '—'}</td>
                    <td data-label="Entreprises">
                      {(c.companies ?? []).map((co) => (
                        <span className="chip" key={co.id}>
                          {co.name || co.vatNumber}
                        </span>
                      ))}
                    </td>
                    <td className="row-actions">
                      <button
                        type="button"
                        className="btn btn--small btn--secondary"
                        onClick={() => startEdit(c)}
                        aria-label={`Modifier ${c.firstName} ${c.lastName}`}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="btn btn--small btn--danger"
                        onClick={() => handleDelete(c)}
                        disabled={deletingId === c.id}
                        aria-label={`Supprimer ${c.firstName} ${c.lastName}`}
                      >
                        Supprimer
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
