import { NavLink, Outlet } from 'react-router'

const SECTIONS = [
  { to: '/contacts', label: 'Contacts' },
  { to: '/companies', label: 'Entreprises' },
  { to: '/vat-search', label: 'Recherche TVA' },
]

export default function AppLayout() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Gestion de contacts</h1>
        <p className="muted">Gérez vos contacts et les entreprises auxquelles ils sont rattachés.</p>
        <nav aria-label="Sections" className="tabs">
          {SECTIONS.map((section) => (
            <NavLink key={section.to} to={section.to} className="tab">
              {section.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
