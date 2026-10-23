import type { RowDataPacket } from 'mysql2'
import { getDb } from '~~/server/utils/db'

export default defineEventHandler(async () => {
  const db = await getDb()
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT * FROM videos ORDER BY FIELD(type, \'chaine\', \'video\'), created_at DESC'
  )
  return rows
})
