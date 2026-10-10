interface ApiErrorBody {
  message?: string
  errors?: Record<string, string>
}

export class ApiRequestError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string>

  constructor(message: string, status = 0, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Erreur inattendue'
}

function isApiErrorBody(body: unknown): body is ApiErrorBody {
  return typeof body === 'object' && body !== null
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(path, init)
  } catch {
    throw new ApiRequestError('API injoignable', 0)
  }

  let body: unknown = null
  try {
    body = await response.json()
  } catch {
    body = null
  }

  if (!response.ok) {
    const errorBody = isApiErrorBody(body) ? body : {}
    throw new ApiRequestError(
      errorBody.message ?? `Erreur ${response.status}`,
      response.status,
      errorBody.errors ?? {},
    )
  }
  // Frontière réseau : le corps JSON est supposé conforme au contrat du backend.
  return body as T
}

export function send<T>(method: 'POST' | 'PUT', path: string, payload?: unknown): Promise<T> {
  return request<T>(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  })
}
