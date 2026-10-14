import type { RowDataPacket } from 'mysql2'
import { readBody } from 'h3'
import { tmpdir } from 'node:os'
import { appendFileSync } from 'node:fs'
import { getDb } from '~~/server/utils/db'
import { apiError } from '~~/server/utils/errors'
import { clientIp, rateLimit, tsaLog } from '~~/server/utils/request'
import { pushbulletNotify } from '~~/server/utils/pushbullet'
import {
  SoftOkResponse,
  envoyerMessage,
  pageDesactivation,
  validerMessageContact
} from '~~/server/utils/contactHelpers'

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)

  if (body?.desactiver != null) {
    await rateLimit(event, 'desactivation', 30, 3600)
    const token = String(body.desactiver).trim()
    if (!/^[a-f0-9]{32}$/.test(token)) {
      pageDesactivation(event, 'invalide')
      return
    }

    const db = await getDb()
    const [result] = await db.execute('UPDATE praticiens_contact SET actif = 0 WHERE token_desact = ?', [
      token
    ])
    if ((result as { affectedRows: number }).affectedRows > 0) {
      tsaLog('contact', 'Désactivation via lien')
      await pushbulletNotify(
        'Formulaire désactivé — Annuaire TSA',
        'Un praticien a coupé son formulaire de contact via le lien.'
      )
    }
    pageDesactivation(event, 'fait')
    return
  }

  await rateLimit(event, 'contact', 10, 3600)
  await rateLimit(event, 'contact_jour', 40, 86400)

  let praticienId: number
  let nom: string
  let email: string
  let message: string
  try {
    ;({ praticien_id: praticienId, nom, email, message } = validerMessageContact(body ?? {}))
  } catch (e) {
    if (e instanceof SoftOkResponse) {
      setResponseStatus(event, e.statusCode)
      return e.body
    }
    throw e
  }

  const db = await getDb()
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT c.email, c.token_desact, p.nom AS praticien_nom
     FROM praticiens_contact c
     JOIN praticiens p ON p.id = c.praticien_id
     WHERE c.praticien_id = ? AND c.actif = 1 AND p.statut = "publie"`,
    [praticienId]
  )
  const contact = rows[0]
  if (!contact?.email) {
    apiError(403, 'Ce praticien ne reçoit pas de messages via le site.')
  }

  const config = useRuntimeConfig()
  if (!String(process.env.SMTP_PASS || config.smtpPass || '')) {
    tsaLog('contact', 'SMTP_PASS vide — envoi impossible')
    apiError(503, 'L\'envoi est momentanément indisponible.')
  }

  await envoyerMessage(
    {
      email: String(contact.email),
      token_desact: String(contact.token_desact),
      praticien_nom: String(contact.praticien_nom)
    },
    nom,
    email,
    message,
    praticienId
  )

  try {
    await db.query('INSERT INTO contact_journal (praticien_id, ip, email_visiteur) VALUES (?, ?, ?)', [
      praticienId,
      clientIp(event),
      email
    ])
    await db.query('DELETE FROM contact_journal WHERE created_at < NOW() - INTERVAL 12 MONTH')
    tsaLog('contact', `Message acheminé vers praticien #${praticienId}`)
    await pushbulletNotify(
      'Message de contact — Annuaire TSA',
      `${contact.praticien_nom} a reçu un message de ${nom}.`
    )
  } catch (e) {
    try {
      appendFileSync(
        `${tmpdir()}/tsa_api.log`,
        `[${new Date().toISOString()}] [contact] journalisation impossible : ${e instanceof Error ? e.message : String(e)}\n`
      )
    } catch {
      /* ignore */
    }
  }

  setResponseStatus(event, 201)
  return { ok: true }
})
