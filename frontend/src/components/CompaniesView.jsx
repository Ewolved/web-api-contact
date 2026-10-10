import { useCallback, useEffect, useRef, useState } from 'react'
import { createCompany, getCompanies } from '../api.js'

const EMPTY_FORM = { name: '', address: '', vatNumber: '' }

export default function CompaniesView() {
  const [companies, setCompanies] = useState([])
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
      setCompanies(await getCompanies())
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

  const update = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFieldErrors({})
    setFormError(null)
    setSuccess(false)
    clearTimeout(timerRef.current)
    const payload = {
      name: form.name.trim() === '' ? null : form.name,
      address: form.address,
      vatNumber: form.vatNumber,
    }
    try {
      await createCompany(payload)
      setForm(EMPTY_FORM)
      setSuccess(true)
      timerRef.current = setTimeout(() => setSuccess(false), 3000)
      await load()
    } catch (err) {
      const errors = err.fieldErrors ?? {}
      setFieldErrors(errors)
      if (Object.keys(errors).length === 0) setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const field = (name, label, required) => (
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

  return (
    <div className="layout">
      <section className="card">
        <h2>Nouvelle entreprise</h2>
        <form className="form" onSubmit={handleSubmit} noValidate>
          {formError && (
            <div className="alert alert--error" role="alert">
              {formError}
            </div>
          )}
          {success && (
            <div className="alert alert--success" role="status">
              Entreprise créée
            </div>
          )}
          {field('name', 'Nom', false)}
          {field('address', 'Adresse', true)}
          {field('vatNumber', 'N° TVA', true)}
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? 'Enregistrement…' : "Créer l'entreprise"}
          </button>
        </form>
      </section>

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
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name || '—'}</td>
                    <td>{c.address}</td>
                    <td>{c.vatNumber}</td>
                    <td>{(c.contacts ?? []).length}</td>
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
