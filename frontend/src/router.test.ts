import { describe, expect, it } from 'vitest'
import type { LoaderFunctionArgs, RouteObject } from 'react-router'
import { routes } from './router'

const loaderArgs: LoaderFunctionArgs = {
  request: new Request('http://localhost/x'),
  params: {},
  context: undefined,
}

const children: RouteObject[] = routes[0]?.children ?? []

async function runLoader(route: RouteObject | undefined): Promise<unknown> {
  if (typeof route?.loader !== 'function') throw new Error('loader manquant')
  return route.loader(loaderArgs)
}

function expectRedirectToContacts(result: unknown): void {
  if (!(result instanceof Response)) throw new Error('Response attendue')
  expect(result.status).toBe(302)
  expect(result.headers.get('Location')).toBe('/contacts')
}

describe('routes', () => {
  it('déclare les pages sous la racine', () => {
    const paths = children.map((route) => route.path)
    expect(paths).toEqual(expect.arrayContaining(['contacts', 'companies', 'vat-search', '*']))
  })

  it('redirige la route index vers /contacts', async () => {
    expectRedirectToContacts(await runLoader(children.find((route) => route.index === true)))
  })

  it('redirige les chemins inconnus vers /contacts', async () => {
    expectRedirectToContacts(await runLoader(children.find((route) => route.path === '*')))
  })
})
