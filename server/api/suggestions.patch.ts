import type { RowDataPacket } from 'mysql2'
import { getQuery } from 'h3'
import { getDb } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import { apiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getQuery(event).id ?? 0)
  if (!id) apiError(400, 'ID manquant')

  const data = await readBody<{ statut?: string }>(event)
  const statut = data?.statut ?? ''
  if (!['valide', 'refuse', 'en_attente'].includes(statut)) {
    apiError(400, 'Statut invalide')
  }

  const db = await getDb()

  if (statut === 'valide') {
    const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM suggestions WHERE id = ?', [id])
    const s = rows[0]
    if (!s) apiError(404, 'Suggestion introuvable')

    try {
      await db.execute(
        `INSERT INTO praticiens (nom, type, ville, ville2, departement, departement2, adresse, adresse2, telephone, site_web, teleconsultation, delai, ages, types_intervention, bilans, formations, experience, modalites, tarifs, autres_infos, adeli, fait_bilans, statut, confirmations)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "publie", 0)`,
        [
          s.nom ?? '',
          s.type ?? '',
          s.ville ?? '',
          s.ville2 ?? null,
          s.departement ?? '',
          s.departement2 ?? null,
          s.adresse ?? null,
          s.adresse2 ?? null,
          s.telephone ?? null,
          s.site_web ?? null,
          s.teleconsultation ?? 0,
          s.delai ?? null,
          s.ages ?? null,
          s.types_intervention ?? null,
          s.bilans ?? null,
          s.formations ?? null,
          s.experience ?? null,
          s.modalites ?? null,
          s.tarifs ?? null,
          s.autres_infos ?? null,
          s.adeli ?? null,
          s.fait_bilans ?? null
        ]
      )
    } catch {
      apiError(500, 'Une erreur est survenue lors de la validation.')
    }
  }

  await db.query('UPDATE suggestions SET statut = ? WHERE id = ?', [statut, id])
  return { ok: true }
})
