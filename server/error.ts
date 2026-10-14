import type { H3Error, H3Event } from 'h3'
import { send, getResponseStatus, setResponseHeader } from 'h3'

/**
 * Format d'erreur aligné sur l'ancienne API PHP : `{ "error": "…" }`.
 * Remplace le plugin `error` hook qui appelait res.end() et faisait pendre les 4xx.
 */
export default async function errorHandler(error: H3Error, event: H3Event) {
  const status = error.statusCode || getResponseStatus(event) || 500
  const data = (error.data && typeof error.data === 'object')
    ? error.data as Record<string, unknown>
    : null
  const payload = data && 'error' in data
    ? data
    : { error: error.statusMessage || error.message || 'Erreur serveur' }

  setResponseHeader(event, 'Content-Type', 'application/json; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'no-store')
  event.node.res.statusCode = status
  await send(event, JSON.stringify(payload))
}
