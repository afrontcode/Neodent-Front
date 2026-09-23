import { API_URL } from './config'

interface ApiErrorBody {
  status?: number
  error?: string
  message?: string
  fieldErrors?: Record<string, string>
}

export class ApiError extends Error {
  status: number
  fieldErrors?: Record<string, string>

  constructor(
    message: string,
    status: number,
    fieldErrors?: Record<string, string>,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

interface ApiRequestOptions extends RequestInit {
  accessToken?: string | null
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { accessToken, headers, ...requestOptions } = options

  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    credentials: 'include',
    headers: {
      ...(requestOptions.body
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {}),
      ...headers,
    },
  })

  if (!response.ok) {
    let body: ApiErrorBody | null = null

    try {
      body = await response.json()
    } catch {
      // Puede existir una respuesta sin JSON.
    }

    throw new ApiError(
      body?.message ?? 'Ocurrió un error al procesar la solicitud.',
      response.status,
      body?.fieldErrors,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}