import { useState, type ComponentType } from 'react'
import ContactsView from './components/ContactsView'
import CompaniesView from './components/CompaniesView'
import VatSearchView from './components/VatSearchView'

type TabId = 'contacts' | 'companies' | 'vat-search'

const TABS: { id: TabId; label: string; View: ComponentType }[] = [
  { id: 'contacts', label: 'Contacts', View: ContactsView },
  { id: 'companies', label: 'Entreprises', View: CompaniesView },
  { id: 'vat-search', label: 'Recherche TVA', View: VatSearchView },
]

export default function App() {
  const [tab, setTab] = useState<TabId>('contacts')
  const ActiveView = (TABS.find((t) => t.id === tab) ?? TABS[0]).View

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
        <ActiveView />
      </main>
    </div>
  )
}
