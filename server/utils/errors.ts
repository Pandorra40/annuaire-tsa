export class ApiError extends Error {
  statusCode: number
  data: Record<string, unknown>

  constructor(statusCode: number, data: Record<string, unknown> | string) {
    const payload = typeof data === 'string' ? { error: data } : data
    super(String(payload.error ?? 'Erreur'))
    this.statusCode = statusCode
    this.data = payload
  }
}

export function apiError(statusCode: number, data: Record<string, unknown> | string): never {
  throw createError({
    statusCode,
    data: typeof data === 'string' ? { error: data } : data,
    message: typeof data === 'string' ? data : String((data as { error?: string }).error ?? 'Erreur')
  })
}
