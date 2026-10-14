import type { RowDataPacket } from 'mysql2'
import { getQuery } from 'h3'
import { getDb } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import { apiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const statut = String(getQuery(event).statut ?? 'en_attente')
  if (!['en_attente', 'valide', 'refuse'].includes(statut)) {
    apiError(400, 'Statut invalide')
  }

  const db = await getDb()
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT * FROM suggestions_associations WHERE statut = ? ORDER BY created_at ASC',
    [statut]
  )
  return rows
})
