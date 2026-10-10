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

function post(path, payload) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export const getContacts = () => request('/api/contacts')
export const createContact = (payload) => post('/api/contacts', payload)
export const getCompanies = () => request('/api/companies')
export const createCompany = (payload) => post('/api/companies', payload)
