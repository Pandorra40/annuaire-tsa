import type { RowDataPacket } from 'mysql2'
import { getDb } from '~~/server/utils/db'
import { readAdminToken, clearAdminCookie } from '~~/server/utils/auth'
import { apiError } from '~~/server/utils/errors'
import { hashSessionToken } from '~~/server/utils/sessionToken'

export default defineEventHandler(async (event) => {
  const token = readAdminToken(event)
  if (!token) apiError(401, 'Non authentifié')

  const db = await getDb()
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT expires_at FROM admin_sessions WHERE token = ? AND expires_at > NOW()',
    [hashSessionToken(token)]
  )
  const row = rows[0] as { expires_at: string } | undefined
  if (!row) {
    clearAdminCookie(event)
    apiError(401, 'Session expirée')
  }

  return { ok: true, expires: row.expires_at }
})
