import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiRequestError, errorMessage, request, send } from './httpClient'

function stubFetch(impl: () => Promise<Response>) {
  const fetchMock = vi.fn(impl)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('httpClient', () => {
  it('request resolves the parsed body', async () => {
    const fetchMock = stubFetch(() =>
      Promise.resolve(new Response(JSON.stringify([{ id: 1 }]), { status: 200 })),
    )
    await expect(request('/api/x')).resolves.toEqual([{ id: 1 }])
    expect(fetchMock).toHaveBeenCalledWith('/api/x', undefined)
  })

  it('maps a network failure to ApiRequestError "API injoignable"', async () => {
    stubFetch(() => Promise.reject(new TypeError('failed')))
    await expect(request('/api/x')).rejects.toMatchObject({
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
    const error = await request('/api/x').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiRequestError)
    expect(error).toMatchObject({
      status: 400,
      message: 'Validation',
      fieldErrors: { vatNumber: message },
    })
  })

  it('ignores a malformed message and errors in a 400 body', async () => {
    stubFetch(() =>
      Promise.resolve(
        new Response(JSON.stringify({ message: 42, errors: ['x'] }), { status: 400 }),
      ),
    )
    await expect(request('/api/x')).rejects.toMatchObject({
      message: 'Erreur 400',
      status: 400,
      fieldErrors: {},
    })
  })

  it('keeps the message when errors is null', async () => {
    stubFetch(() =>
      Promise.resolve(
        new Response(JSON.stringify({ message: 'Validation', errors: null }), { status: 400 }),
      ),
    )
    await expect(request('/api/x')).rejects.toMatchObject({
      message: 'Validation',
      status: 400,
      fieldErrors: {},
    })
  })

  it('falls back to "Erreur <status>" for a non-JSON error body', async () => {
    stubFetch(() => Promise.resolve(new Response('<html>', { status: 502 })))
    await expect(request('/api/x')).rejects.toMatchObject({
      message: 'Erreur 502',
      status: 502,
      fieldErrors: {},
    })
  })

  it('resolves on an empty 204', async () => {
    stubFetch(() => Promise.resolve(new Response(null, { status: 204 })))
    await expect(request('/api/x', { method: 'DELETE' })).resolves.toBeNull()
  })

  it('send issues a JSON request with the given method', async () => {
    const fetchMock = stubFetch(() => Promise.resolve(new Response('{}', { status: 200 })))
    await send('PUT', '/api/x', { a: 1 })
    expect(fetchMock).toHaveBeenCalledWith('/api/x', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ a: 1 }),
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
