import { useState } from 'react'
import ContactsView from './components/ContactsView.jsx'
import CompaniesView from './components/CompaniesView.jsx'

const TABS = [
  { id: 'contacts', label: 'Contacts' },
  { id: 'companies', label: 'Entreprises' },
]

export default function App() {
  const [tab, setTab] = useState('contacts')

  return (
    <div className="app">
      <header className="app-header">
        <h1>Gestion de contacts</h1>
        <p className="muted">Gérez vos contacts et les entreprises auxquelles ils sont rattachés.</p>
        <div className="tabs" role="tablist" aria-label="Sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              className="tab"
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>
      <main role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'contacts' ? <ContactsView /> : <CompaniesView />}
      </main>
    </div>
  )
}
