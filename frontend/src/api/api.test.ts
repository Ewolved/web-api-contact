import { afterEach, describe, expect, it, vi } from 'vitest'
import { companiesApi, contactsApi } from './api'
import type { CompanyRequest } from '../types/company'
import type { ContactRequest } from '../types/contact'

function stubFetch(status = 200, body = '{}') {
  const fetchMock = vi.fn(() => Promise.resolve(new Response(body, { status })))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function jsonInit(method: string, payload?: unknown) {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

const contactPayload: ContactRequest = {
  firstName: 'A',
  lastName: 'B',
  address: 'C',
  type: 'EMPLOYEE',
  vatNumber: null,
}
const companyPayload: CompanyRequest = { name: null, address: 'C', vatNumber: 'BE0123456789' }

describe('contactsApi', () => {
  it('list GETs /api/contacts', async () => {
    const contacts = [{ id: 1, firstName: 'A', lastName: 'B' }]
    const fetchMock = stubFetch(200, JSON.stringify(contacts))
    await expect(contactsApi.list()).resolves.toEqual(contacts)
    expect(fetchMock).toHaveBeenCalledWith('/api/contacts', undefined)
  })

  it('create POSTs the payload', async () => {
    const fetchMock = stubFetch(201)
    await contactsApi.create(contactPayload)
    expect(fetchMock).toHaveBeenCalledWith('/api/contacts', jsonInit('POST', contactPayload))
  })

  it('update PUTs the payload', async () => {
    const fetchMock = stubFetch()
    await contactsApi.update(4, contactPayload)
    expect(fetchMock).toHaveBeenCalledWith('/api/contacts/4', jsonInit('PUT', contactPayload))
  })

  it('remove resolves on an empty 204 with a plain DELETE', async () => {
    const fetchMock = stubFetch(204, '')
    await expect(contactsApi.remove(3)).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledWith('/api/contacts/3', { method: 'DELETE' })
  })
})

describe('companiesApi', () => {
  it('list GETs /api/companies', async () => {
    const fetchMock = stubFetch(200, '[]')
    await expect(companiesApi.list()).resolves.toEqual([])
    expect(fetchMock).toHaveBeenCalledWith('/api/companies', undefined)
  })

  it('create POSTs the payload', async () => {
    const fetchMock = stubFetch(201)
    await companiesApi.create(companyPayload)
    expect(fetchMock).toHaveBeenCalledWith('/api/companies', jsonInit('POST', companyPayload))
  })

  it('update PUTs the payload', async () => {
    const fetchMock = stubFetch()
    await companiesApi.update(7, companyPayload)
    expect(fetchMock).toHaveBeenCalledWith('/api/companies/7', jsonInit('PUT', companyPayload))
  })

  it('searchByVat encodes the VAT number', async () => {
    const fetchMock = stubFetch()
    await companiesApi.searchByVat('BE 01/2')
    expect(fetchMock).toHaveBeenCalledWith('/api/companies/search?vatNumber=BE%2001%2F2', undefined)
  })

  it('addContact PUTs the link without body', async () => {
    const fetchMock = stubFetch()
    await companiesApi.addContact(1, 2)
    expect(fetchMock).toHaveBeenCalledWith('/api/companies/1/contacts/2', jsonInit('PUT'))
  })
})
