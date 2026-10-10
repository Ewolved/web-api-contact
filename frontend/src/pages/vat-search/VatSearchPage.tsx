import { useState, type FormEvent } from 'react'
import { companiesApi, errorMessage } from '../../api/api'
import ContactChips from '../../components/ContactChips'
import type { Company } from '../../types/company'

export default function VatSearchPage() {
  const [vatNumber, setVatNumber] = useState('')
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState<Company | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setResult(null)
    setError(null)
    if (vatNumber.trim() === '') {
      setError('Saisissez un numéro de TVA')
      return
    }
    setSearching(true)
    try {
      setResult(await companiesApi.searchByVat(vatNumber.trim()))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSearching(false)
    }
  }

  return (
    <section className="card card--narrow">
      <h2>Recherche d'une entreprise par TVA</h2>
      <form className="form" onSubmit={handleSearch} noValidate role="search">
        <div className="field">
          <label htmlFor="vat-search">N° TVA</label>
          <input
            id="vat-search"
            value={vatNumber}
            onChange={(e) => setVatNumber(e.target.value)}
            placeholder="BE0100000001"
          />
        </div>
        <button className="btn" type="submit" disabled={searching}>
          {searching ? 'Recherche…' : 'Rechercher'}
        </button>
      </form>
      <div aria-live="polite">
        {error && <div className="alert alert--error search-result">{error}</div>}
        {result && (
          <dl className="search-result details">
            <dt>ID</dt>
            <dd>{result.id}</dd>
            <dt>Nom</dt>
            <dd>{result.name || '—'}</dd>
            <dt>Adresse</dt>
            <dd>{result.address}</dd>
            <dt>TVA</dt>
            <dd>{result.vatNumber}</dd>
            <dt>Contacts</dt>
            <dd>
              <ContactChips contacts={result.contacts} />
            </dd>
          </dl>
        )}
      </div>
    </section>
  )
}
