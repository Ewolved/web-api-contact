import { useCallback, useEffect, useRef, useState } from 'react'
import { createContact, getContacts } from '../api.js'

const EMPTY_FORM = { firstName: '', lastName: '', address: '', type: 'EMPLOYEE', vatNumber: '' }

const TYPE_LABELS = { EMPLOYEE: 'Employé', FREELANCE: 'Freelance' }

export default function ContactsView() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [success, setSuccess] = useState(false)
  const timerRef = useRef(null)

  const load = useCallback(async () => {
    try {
      setContacts(await getContacts())
      setLoadError(null)
    } catch (e) {
      setLoadError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    return () => clearTimeout(timerRef.current)
  }, [load])

  const update = (name) => (e) => {
    const value = e.target.value
    setForm((f) => ({ ...f, [name]: value }))
    setFieldErrors((errs) => {
      if (!errs[name]) return errs
      const { [name]: _removed, ...rest } = errs
      return rest
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFieldErrors({})
    setFormError(null)
    setSuccess(false)
    clearTimeout(timerRef.current)
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      address: form.address,
      type: form.type,
      vatNumber: form.type === 'FREELANCE' ? form.vatNumber : null,
    }
    try {
      await createContact(payload)
      setForm(EMPTY_FORM)
      setSuccess(true)
      timerRef.current = setTimeout(() => setSuccess(false), 3000)
      await load()
    } catch (err) {
      const errors = err.fieldErrors ?? {}
      setFieldErrors(errors)
      const rendered = ['firstName', 'lastName', 'address', 'type']
      if (form.type === 'FREELANCE') rendered.push('vatNumber')
      const hidden = Object.keys(errors).filter((k) => !rendered.includes(k))
      if (hidden.length > 0) setFormError(hidden.map((k) => errors[k]).join(' ; '))
      else if (Object.keys(errors).length === 0) setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const field = (name, label, required) => (
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

  return (
    <div className="layout">
      <section className="card">
        <h2>Nouveau contact</h2>
        <form className="form" onSubmit={handleSubmit} noValidate>
          {formError && (
            <div className="alert alert--error" role="alert">
              {formError}
            </div>
          )}
          {success && (
            <div className="alert alert--success" role="status">
              Contact créé
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
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? 'Enregistrement…' : 'Créer le contact'}
          </button>
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
                  <th scope="col">Nom</th>
                  <th scope="col">Prénom</th>
                  <th scope="col">Adresse</th>
                  <th scope="col">Type</th>
                  <th scope="col">TVA</th>
                  <th scope="col">Entreprises</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id}>
                    <td>{c.lastName}</td>
                    <td>{c.firstName}</td>
                    <td>{c.address}</td>
                    <td>
                      <span className={`badge badge--${c.type === 'FREELANCE' ? 'freelance' : 'employee'}`}>
                        {TYPE_LABELS[c.type] ?? c.type}
                      </span>
                    </td>
                    <td>{c.vatNumber || '—'}</td>
                    <td>
                      {(c.companies ?? []).map((co) => (
                        <span className="chip" key={co.id}>
                          {co.name || co.vatNumber}
                        </span>
                      ))}
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
