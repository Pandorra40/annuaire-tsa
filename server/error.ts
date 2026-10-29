import type { H3Error, H3Event } from 'h3'
import { send, getResponseStatus, setResponseHeader, getRequestHeader } from 'h3'

/**
 * Erreurs API en JSON `{ "error": "…" }`.
 * Requêtes navigateur (Accept: text/html) : page HTML FR au style du site + noindex.
 */
export default async function errorHandler(error: H3Error, event: H3Event) {
  const status = error.statusCode || getResponseStatus(event) || 500
  const data = (error.data && typeof error.data === 'object')
    ? error.data as Record<string, unknown>
    : null
  const brut = (data && typeof data.error === 'string')
    ? data.error
    : (error.statusMessage || error.message || 'Erreur serveur')

  // Ne jamais afficher le message anglais Nitro « Page not found » tel quel.
  const messageEn = /page not found|not found/i.test(brut)
  const message = messageEn
    ? (status === 404
      ? 'Cette adresse n’existe pas ou a été déplacée.'
      : 'Une erreur inattendue s’est produite.')
    : brut

  setResponseHeader(event, 'Cache-Control', 'no-store')
  setResponseHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
  event.node.res.statusCode = status

  const accept = getRequestHeader(event, 'accept') || ''
  if (accept.includes('text/html')) {
    setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8')
    const titre = status === 404 ? 'Page introuvable' : 'Erreur'
    const safeMsg = message.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${titre} — Annuaire TSA</title>
<style>
  body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#f9fafb;color:#111827}
  header{background:#fff;border-bottom:1px solid #f3f4f6;padding:1rem 1.5rem}
  a{color:#4338ca;text-decoration:none;font-weight:600}
  a:hover{text-decoration:underline}
  .brand{font-weight:900;color:#111827;text-decoration:none}
  main{max-width:36rem;margin:0 auto;padding:4rem 1.5rem;text-align:center}
  .code{font-size:4.5rem;font-weight:900;color:#e5e7eb;line-height:1;margin:0 0 1rem}
  h1{font-size:1.75rem;margin:0 0 .75rem}
  p{color:#4b5563;line-height:1.6}
  .actions{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center;margin-top:2rem}
  .btn{display:inline-flex;padding:.75rem 1.25rem;border-radius:.75rem;font-size:.875rem;font-weight:600}
  .btn-primary{background:#111827;color:#fff}
  .btn-ghost{background:#fff;border:1px solid #e5e7eb;color:#111827}
</style>
</head>
<body>
<header><a class="brand" href="/">Annuaire TSA</a></header>
<main>
  <p class="code" aria-hidden="true">${status}</p>
  <h1>${titre}</h1>
  <p>${safeMsg}</p>
  <div class="actions">
    <a class="btn btn-primary" href="/">← Retour à l'annuaire</a>
    <a class="btn btn-ghost" href="/cra">Centres CRA</a>
    <a class="btn btn-ghost" href="/associations">Associations</a>
  </div>
</main>
</body>
</html>`
    await send(event, html)
    return
  }

  const payload = data && 'error' in data ? data : { error: message }
  setResponseHeader(event, 'Content-Type', 'application/json; charset=utf-8')
  await send(event, JSON.stringify(payload))
}
