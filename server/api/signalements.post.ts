import type { RowDataPacket } from 'mysql2'
import { getDb } from '~~/server/utils/db'
import { apiError } from '~~/server/utils/errors'
import { rateLimit } from '~~/server/utils/request'
import { pushbulletNotify } from '~~/server/utils/pushbullet'
import { validateContactAuteur, validateLength } from '~~/server/utils/validators'
import { MOTIF_RETRAIT, MOTIF_RETRAIT_ASSOCIATION } from '~~/server/utils/signalementsMotifs'

export default defineEventHandler(async (event) => {
  await rateLimit(event, 'signalement', 5, 3600)

  const data = await readBody<Record<string, unknown>>(event)
  if (!data) apiError(400, 'Données invalides')

  const motif = String(data.motif ?? '').trim()
  if (!motif) apiError(400, 'Motif obligatoire')
  validateLength(motif, 200, 'motif')

  const estRetrait = motif === MOTIF_RETRAIT || motif === MOTIF_RETRAIT_ASSOCIATION

  const detail
    = data.detail != null ? String(data.detail).replace(/<[^>]*>/g, '').trim() : null
  if (detail) validateLength(detail, 2000, 'détails')

  if (!estRetrait && (!detail || [...detail].length < 10)) {
    apiError(400, 'Merci de décrire ce qui est inexact.')
  }

  const contactAuteur = validateContactAuteur(data.contact_auteur)

  const praticienId = Number(data.praticien_id ?? 0)
  const associationId = Number(data.association_id ?? 0)
  if (!praticienId && !associationId) apiError(400, 'ID praticien ou association manquant')
  if (praticienId && associationId) {
    apiError(400, 'Un signalement ne peut porter que sur une seule fiche')
  }

  const db = await getDb()

  let entiteNom: string
  if (praticienId) {
    const [rows] = await db.query<RowDataPacket[]>('SELECT nom FROM praticiens WHERE id = ?', [
      praticienId
    ])
    entiteNom = String(rows[0]?.nom ?? `ID ${praticienId}`)
  } else {
    const [rows] = await db.query<RowDataPacket[]>('SELECT nom FROM associations WHERE id = ?', [
      associationId
    ])
    entiteNom = String(rows[0]?.nom ?? `ID ${associationId}`)
  }

  await db.execute(
    `INSERT INTO signalements (praticien_id, praticien_nom, association_id, association_nom, motif, detail, contact_auteur, statut)
     VALUES (?, ?, ?, ?, ?, ?, ?, "ouvert")`,
    [
      praticienId || null,
      praticienId ? entiteNom : null,
      associationId || null,
      associationId ? entiteNom : null,
      motif,
      detail,
      contactAuteur
    ]
  )

  if (estRetrait) {
    const quoi = praticienId ? 'la suppression de sa fiche' : 'le retrait de la fiche de son association'
    await pushbulletNotify(
      '⚠ Demande de retrait — Annuaire TSA',
      `${entiteNom} demande ${quoi}. Délai légal : un mois maximum.`
    )
  } else {
    const joignable = contactAuteur ? `réponse possible : ${contactAuteur}` : 'sans moyen de réponse'
    const type = praticienId ? 'praticien' : 'association'
    await pushbulletNotify('Signalement — Annuaire TSA', `${motif} · ${entiteNom} (${type}) · ${joignable}`)
  }

  setResponseStatus(event, 201)
  return { ok: true }
})
