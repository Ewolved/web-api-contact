export class ApiRequestError extends Error {
  constructor(message, status = 0, fieldErrors = {}) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

async function request(path, options) {
  let response
  try {
    response = await fetch(path, options)
  } catch {
    throw new ApiRequestError('API injoignable', 0)
  }

  let body = null
  try {
    body = await response.json()
  } catch {
    body = null
  }

  if (!response.ok) {
    throw new ApiRequestError(
      body?.message ?? `Erreur ${response.status}`,
      response.status,
      body?.errors ?? {},
    )
  }
  return body
}

function send(method, path, payload) {
  return request(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  })
}

export const getContacts = () => request('/api/contacts')
export const createContact = (payload) => send('POST', '/api/contacts', payload)
export const updateContact = (id, payload) => send('PUT', `/api/contacts/${id}`, payload)
export const deleteContact = (id) => request(`/api/contacts/${id}`, { method: 'DELETE' })

export const getCompanies = () => request('/api/companies')
export const createCompany = (payload) => send('POST', '/api/companies', payload)
export const updateCompany = (id, payload) => send('PUT', `/api/companies/${id}`, payload)
export const searchCompanyByVat = (vatNumber) =>
  request(`/api/companies/search?vatNumber=${encodeURIComponent(vatNumber)}`)
export const addContactToCompany = (companyId, contactId) =>
  send('PUT', `/api/companies/${companyId}/contacts/${contactId}`)
