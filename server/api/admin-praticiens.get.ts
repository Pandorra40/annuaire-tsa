import type { RowDataPacket } from 'mysql2'
import { getQuery } from 'h3'
import { getDb } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import { apiError } from '~~/server/utils/errors'
import { SELECT_ADMIN, normaliserPraticien } from '~~/server/utils/adminPraticienShared'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getQuery(event).id ?? 0)
  const db = await getDb()

  if (id) {
    const [rows] = await db.query<RowDataPacket[]>(SELECT_ADMIN + ' WHERE p.id = ?', [id])
    const row = rows[0]
    if (!row) apiError(404, 'Introuvable')
    return normaliserPraticien(row)
  }

  const [rows] = await db.query<RowDataPacket[]>(SELECT_ADMIN + ' ORDER BY p.nom ASC')
  return rows.map(normaliserPraticien)
})
