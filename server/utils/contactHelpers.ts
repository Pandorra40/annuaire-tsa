import type { H3Event } from 'h3'
import { setResponseHeader, setResponseStatus } from 'h3'
import { apiError } from '~~/server/utils/errors'
import { sendMail } from '~~/server/utils/mail'
import { tsaLog } from '~~/server/utils/request'
import { validateLength } from '~~/server/utils/validators'

export const DELAI_MINIMUM_MS = 3000

/** Réponse 201 factice (honeypot / envoi trop rapide) — ne pas traiter comme erreur. */
export class SoftOkResponse {
  statusCode = 201
  body = { ok: true as const }
}

export function validerMessageContact(data: Record<string, unknown>): {
  praticien_id: number
  nom: string
  email: string
  message: string
} {
  if (data.hp) {
    tsaLog('contact', 'Honeypot déclenché')
    throw new SoftOkResponse()
  }

  if (Number(data.elapsed ?? 0) < DELAI_MINIMUM_MS) {
    tsaLog('contact', 'Envoi trop rapide')
    throw new SoftOkResponse()
  }

  const praticienId = Number(data.praticien_id ?? 0)
  if (!praticienId) apiError(400, 'Praticien manquant')

  const nom = String(data.nom ?? '').trim()
  const email = String(data.email ?? '').trim()
  const message = String(data.message ?? '').trim()

  if (nom === '') apiError(400, 'Merci d\'indiquer votre nom.')
  if (message === '') apiError(400, 'Le message est vide.')
  validateLength(nom, 100, 'nom')
  validateLength(message, 2000, 'message')

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    apiError(400, 'Adresse email invalide — c\'est à elle que le praticien répondra.')
  }

  return { praticien_id: praticienId, nom, email, message }
}

export async function envoyerMessage(
  contact: { email: string, token_desact: string, praticien_nom: string },
  nom: string,
  emailVisiteur: string,
  message: string,
  praticienId: number
): Promise<void> {
  const lienDesact = `https://www.annuaire-tsa.fr/api/contact?desactiver=${contact.token_desact}`
  const fiche = `https://www.annuaire-tsa.fr/praticien/${praticienId}`

  const corps = `Bonjour,

Vous avez reçu un message depuis votre fiche de l'Annuaire TSA.
Répondez directement à ce courriel : votre réponse partira vers ${emailVisiteur},
sans passer par le site.

De : ${nom} <${emailVisiteur}>

------------------------------------------------------------
${message}
------------------------------------------------------------

Votre fiche : ${fiche}

Vous ne souhaitez plus recevoir de messages ? Ce lien coupe le formulaire
immédiatement, sans avoir à écrire à qui que ce soit :
${lienDesact}

Annuaire TSA — https://www.annuaire-tsa.fr`

  try {
    await sendMail({
      to: contact.email,
      replyTo: { email: emailVisiteur, name: nom },
      subject: `Annuaire TSA — message de ${nom}`,
      text: corps
    })
  } catch (e) {
    tsaLog('contact', `Échec SMTP : ${e instanceof Error ? e.message : String(e)}`)
    apiError(502, 'L\'envoi a échoué. Réessayez plus tard, ou contactez le praticien par téléphone.')
  }
}

export function pageDesactivation(event: H3Event, etat: 'confirmer' | 'fait' | 'invalide', token = ''): void {
  let titre: string
  let texte: string
  let formulaire = ''

  if (etat === 'confirmer') {
    titre = 'Couper le formulaire de contact'
    texte =
      'Vous êtes sur le point de désactiver le formulaire de contact de votre fiche. Les visiteurs ne pourront plus vous écrire depuis le site, et votre fiche restera en ligne.<br><br>Rien n\'est fait tant que vous n\'avez pas confirmé ci-dessous.'
    const jeton = token.replace(/"/g, '&quot;')
    formulaire = `<form method="post" action="/api/contact">
          <input type="hidden" name="desactiver" value="${jeton}">
          <button type="submit">Confirmer la désactivation</button>
        </form>`
  } else if (etat === 'fait') {
    titre = 'Formulaire désactivé'
    texte =
      'Le formulaire de contact de votre fiche est désormais coupé. Les visiteurs ne peuvent plus vous écrire depuis le site, et votre fiche reste en ligne.<br><br>Pour le réactiver, ou pour toute autre demande concernant vos données, écrivez à <a href="mailto:annuaire.tsa@gmail.com">annuaire.tsa@gmail.com</a>.'
  } else {
    titre = 'Lien invalide'
    texte =
      'Ce lien est incomplet ou a été tronqué par votre messagerie. Écrivez à <a href="mailto:annuaire.tsa@gmail.com">annuaire.tsa@gmail.com</a> et le formulaire sera coupé manuellement.'
  }

  setResponseStatus(event, etat === 'invalide' ? 400 : 200)
  setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'no-store')
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
  setResponseHeader(event, 'X-Frame-Options', 'DENY')
  setResponseHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin')
  setResponseHeader(
    event,
    'Content-Security-Policy',
    "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'"
  )

  event.node.res.end(`<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>${titre} — Annuaire TSA</title>
  <style>
    body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; background: #f9fafb;
           color: #111827; margin: 0; padding: 2rem 1rem; line-height: 1.6; }
    main { max-width: 34rem; margin: 3rem auto; background: #fff; border: 1px solid #e5e7eb;
           border-radius: 1rem; padding: 2rem; }
    h1 { font-size: 1.35rem; margin: 0 0 1rem; }
    a { color: #4f46e5; }
    p.pied { margin-top: 2rem; font-size: .85rem; color: #6b7280; }
    button { margin-top: 1.5rem; padding: .75rem 1.25rem; font: inherit; font-weight: 600;
             color: #fff; background: #4f46e5; border: 0; border-radius: .75rem; cursor: pointer; }
    button:hover { background: #4338ca; }
  </style>
</head>
<body>
  <main>
    <h1>${titre}</h1>
    <p>${texte}</p>
    ${formulaire}
    <p class="pied">Annuaire TSA — <a href="https://www.annuaire-tsa.fr">www.annuaire-tsa.fr</a></p>
  </main>
</body>
</html>`)
}
