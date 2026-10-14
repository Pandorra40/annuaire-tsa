import type { RowDataPacket } from 'mysql2'
import { getQuery } from 'h3'
import { getDb } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const statut = String(getQuery(event).statut ?? 'en_attente')
  const db = await getDb()
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT * FROM suggestions_livres WHERE statut = ? ORDER BY created_at ASC',
    [statut]
  )
  return rows
})
