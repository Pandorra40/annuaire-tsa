import type { RowDataPacket } from 'mysql2'
import { getQuery } from 'h3'
import { getDb } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const db = await getDb()

  if (query.id != null) {
    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT * FROM associations WHERE id = ? AND statut = "publie"',
      [Number(query.id)]
    )
    return rows
  }

  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT * FROM associations WHERE statut = "publie" ORDER BY nom ASC'
  )
  return rows
})
