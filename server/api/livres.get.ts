import type { RowDataPacket } from 'mysql2'
import { getDb } from '~~/server/utils/db'

export default defineEventHandler(async () => {
  const db = await getDb()
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT * FROM livres WHERE statut = "publie" ORDER BY type ASC, titre ASC'
  )
  return rows
})
