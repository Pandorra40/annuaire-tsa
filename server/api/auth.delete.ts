import { getDb } from '~~/server/utils/db'
import { readAdminToken, clearAdminCookie } from '~~/server/utils/auth'
import { hashSessionToken } from '~~/server/utils/sessionToken'

export default defineEventHandler(async (event) => {
  const token = readAdminToken(event)
  if (token) {
    const db = await getDb()
    await db.query('DELETE FROM admin_sessions WHERE token = ?', [hashSessionToken(token)])
  }
  clearAdminCookie(event)
  return { ok: true }
})
