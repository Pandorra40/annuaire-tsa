import { getDb } from '~~/server/utils/db'
import { readAdminToken, clearAdminCookie } from '~~/server/utils/auth'
import { apiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  const token = readAdminToken(event)
  if (!token) apiError(401, 'Non authentifié')

  const db = await getDb()
  const [rows] = await db.query<Array<{ expires_at: string }>>(
    'SELECT expires_at FROM admin_sessions WHERE token = ? AND expires_at > NOW()',
    [token]
  )
  const row = rows[0]
  if (!row) {
    clearAdminCookie(event)
    apiError(401, 'Session expirée')
  }

  return { ok: true, expires: row.expires_at }
})
