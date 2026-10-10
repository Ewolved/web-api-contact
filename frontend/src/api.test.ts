import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ApiRequestError,
  createContact,
  deleteContact,
  errorMessage,
  getContacts,
  searchCompanyByVat,
} from './api'
import type { ContactRequest } from './types/contact'

function stubFetch(impl: () => Promise<Response>) {
  const fetchMock = vi.fn(impl)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('api client', () => {
  it('getContacts resolves the parsed array', async () => {
    const contacts = [{ id: 1, firstName: 'A', lastName: 'B' }]
    const fetchMock = stubFetch(() =>
      Promise.resolve(new Response(JSON.stringify(contacts), { status: 200 })),
    )
    await expect(getContacts()).resolves.toEqual(contacts)
    expect(fetchMock).toHaveBeenCalledWith('/api/contacts', undefined)
  })

  it('maps a network failure to ApiRequestError "API injoignable"', async () => {
    stubFetch(() => Promise.reject(new TypeError('failed')))
    await expect(getContacts()).rejects.toMatchObject({
      name: 'ApiRequestError',
      message: 'API injoignable',
      status: 0,
    })
  })

  it('exposes message and field errors from a 400 body', async () => {
    const message = 'Un freelance doit avoir un numéro de TVA'
    stubFetch(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({ status: 400, message: 'Validation', errors: { vatNumber: message } }),
          { status: 400 },
        ),
      ),
    )
    const error = await getContacts().catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiRequestError)
    expect(error).toMatchObject({
      status: 400,
      message: 'Validation',
      fieldErrors: { vatNumber: message },
    })
  })

  it('falls back to "Erreur <status>" for a non-JSON error body', async () => {
    stubFetch(() => Promise.resolve(new Response('<html>', { status: 502 })))
    await expect(getContacts()).rejects.toMatchObject({
      message: 'Erreur 502',
      status: 502,
      fieldErrors: {},
    })
  })

  it('deleteContact resolves on an empty 204 and uses a plain DELETE request', async () => {
    const fetchMock = stubFetch(() => Promise.resolve(new Response(null, { status: 204 })))
    await expect(deleteContact(3)).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledWith('/api/contacts/3', { method: 'DELETE' })
  })

  it('searchCompanyByVat encodes the VAT number', async () => {
    const fetchMock = stubFetch(() => Promise.resolve(new Response('{}', { status: 200 })))
    await searchCompanyByVat('BE 01/2')
    expect(fetchMock).toHaveBeenCalledWith('/api/companies/search?vatNumber=BE%2001%2F2', undefined)
  })

  it('createContact sends a JSON POST', async () => {
    const payload: ContactRequest = {
      firstName: 'A',
      lastName: 'B',
      address: 'C',
      type: 'EMPLOYEE',
      vatNumber: null,
    }
    const fetchMock = stubFetch(() => Promise.resolve(new Response('{}', { status: 201 })))
    await createContact(payload)
    expect(fetchMock).toHaveBeenCalledWith('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  })
})

describe('errorMessage', () => {
  it('returns the message of an Error', () => {
    expect(errorMessage(new Error('x'))).toBe('x')
  })
  it('returns a default for non-Error values', () => {
    expect(errorMessage('x')).toBe('Erreur inattendue')
  })
})
