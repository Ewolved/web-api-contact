import { createBrowserRouter, redirect, type RouteObject } from 'react-router'
import AppLayout from './layouts/AppLayout'
import ContactsPage from './pages/contacts/ContactsPage'
import CompaniesPage from './pages/companies/CompaniesPage'
import VatSearchPage from './pages/vat-search/VatSearchPage'

const renderNothing = () => null
const redirectToContacts = () => redirect('/contacts')

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: AppLayout,
    HydrateFallback: renderNothing,
    children: [
      { index: true, loader: redirectToContacts },
      { path: 'contacts', Component: ContactsPage },
      { path: 'companies', Component: CompaniesPage },
      { path: 'vat-search', Component: VatSearchPage },
      { path: '*', loader: redirectToContacts },
    ],
  },
]

// Fonction : createBrowserRouter exige `window` (absent des tests en environnement node).
export function createAppRouter() {
  return createBrowserRouter(routes)
}
