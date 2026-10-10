import type { Company, CompanyRequest } from '../types/company'
import type { Contact, ContactRequest } from '../types/contact'
import { request, send } from './httpClient'

export { ApiRequestError, errorMessage } from './httpClient'

export const contactsApi = {
  list: () => request<Contact[]>('/api/contacts'),
  create: (payload: ContactRequest) => send<Contact>('POST', '/api/contacts', payload),
  update: (id: number, payload: ContactRequest) =>
    send<Contact>('PUT', `/api/contacts/${id}`, payload),
  remove: async (id: number): Promise<void> => {
    await request<unknown>(`/api/contacts/${id}`, { method: 'DELETE' })
  },
}

export const companiesApi = {
  list: () => request<Company[]>('/api/companies'),
  create: (payload: CompanyRequest) => send<Company>('POST', '/api/companies', payload),
  update: (id: number, payload: CompanyRequest) =>
    send<Company>('PUT', `/api/companies/${id}`, payload),
  searchByVat: (vat: string) =>
    request<Company>(`/api/companies/search?vatNumber=${encodeURIComponent(vat)}`),
  addContact: (companyId: number, contactId: number) =>
    send<Company>('PUT', `/api/companies/${companyId}/contacts/${contactId}`),
}
