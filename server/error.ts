import type { H3Error, H3Event } from 'h3'
import { send, getResponseStatus, setResponseHeader, getRequestHeader } from 'h3'

/**
 * Erreurs API en JSON `{ "error": "…" }`.
 * Requêtes navigateur (Accept: text/html) : mini page HTML + noindex.
 */
export default async function errorHandler(error: H3Error, event: H3Event) {
  const status = error.statusCode || getResponseStatus(event) || 500
  const data = (error.data && typeof error.data === 'object')
    ? error.data as Record<string, unknown>
    : null
  const message = (data && typeof data.error === 'string')
    ? data.error
    : (error.statusMessage || error.message || 'Erreur serveur')

  setResponseHeader(event, 'Cache-Control', 'no-store')
  setResponseHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
  event.node.res.statusCode = status

  const accept = getRequestHeader(event, 'accept') || ''
  if (accept.includes('text/html')) {
    setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8')
    const titre = status === 404 ? 'Page introuvable' : 'Erreur'
    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>${titre} — Annuaire TSA</title></head><body style="font-family:system-ui;max-width:32rem;margin:4rem auto;padding:0 1rem"><h1>${status} — ${titre}</h1><p>${message.replace(/</g, '&lt;')}</p><p><a href="/">← Retour à l'annuaire</a></p></body></html>`
    await send(event, html)
    return
  }

  const payload = data && 'error' in data ? data : { error: message }
  setResponseHeader(event, 'Content-Type', 'application/json; charset=utf-8')
  await send(event, JSON.stringify(payload))
}
