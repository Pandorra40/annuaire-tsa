import type { RowDataPacket } from 'mysql2'
import { getQuery } from 'h3'
import { getDb } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import { agesToArray } from '~~/server/utils/validators'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const statut = String(getQuery(event).statut ?? 'en_attente')
  const db = await getDb()
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT * FROM suggestions WHERE statut = ? ORDER BY created_at ASC',
    [statut]
  )
  return rows.map(row => ({
    ...row,
    ages: agesToArray(row.ages as string | null),
    teleconsultation: Boolean(row.teleconsultation)
  }))
})
