import type { RowDataPacket } from 'mysql2'
import { getQuery } from 'h3'
import { getDb } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import { MOTIF_RETRAIT, MOTIF_RETRAIT_ASSOCIATION } from '~~/server/utils/signalementsMotifs'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const statut = String(getQuery(event).statut ?? 'ouvert')
  const db = await getDb()
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT s.*,
        COALESCE(p.nom, s.praticien_nom) AS praticien_nom,
        COALESCE(a.nom, s.association_nom) AS association_nom
     FROM signalements s
     LEFT JOIN praticiens p ON p.id = s.praticien_id
     LEFT JOIN associations a ON a.id = s.association_id
     WHERE s.statut = ?
     ORDER BY (s.motif IN (?, ?)) DESC, s.created_at DESC`,
    [statut, MOTIF_RETRAIT, MOTIF_RETRAIT_ASSOCIATION]
  )
  return rows
})
