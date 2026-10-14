import { getDb } from '~~/server/utils/db'
import { readAdminToken, clearAdminCookie } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const token = readAdminToken(event)
  if (token) {
    const db = await getDb()
    await db.query('DELETE FROM admin_sessions WHERE token = ?', [token])
  }
  clearAdminCookie(event)
  return { ok: true }
})
