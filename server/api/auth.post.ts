import bcrypt from 'bcryptjs'
import { getDb } from '~~/server/utils/db'
import { setAdminCookie } from '~~/server/utils/auth'
import { apiError } from '~~/server/utils/errors'
import { rateLimit, tsaLog } from '~~/server/utils/request'
import { recordAdminLogin } from '~~/server/utils/adminLoginLog'
import { createSessionToken, hashSessionToken } from '~~/server/utils/sessionToken'

const SESSION_DURATION = 7200

export default defineEventHandler(async (event) => {
  await rateLimit(event, 'auth_login', 10, 900)

  const data = await readBody<{ password?: string }>(event)
  const mdp = data?.password ?? ''
  const config = useRuntimeConfig()
  const adminHash = String(process.env.ADMIN_HASH || config.adminHash || '')

  if (!mdp || !adminHash || !bcrypt.compareSync(mdp, adminHash)) {
    tsaLog('auth', 'Failed admin login attempt')
    await recordAdminLogin(event, false)
    apiError(401, 'Mot de passe incorrect')
  }

  const token = createSessionToken()
  const expires = new Date(Date.now() + SESSION_DURATION * 1000)
  const expiresStr = expires.toISOString().slice(0, 19).replace('T', ' ')

  const db = await getDb()
  await db.query('DELETE FROM admin_sessions WHERE expires_at < NOW()')
  await db.query('INSERT INTO admin_sessions (token, expires_at) VALUES (?, ?)', [
    hashSessionToken(token),
    expiresStr
  ])

  await recordAdminLogin(event, true)
  setAdminCookie(event, token, expiresStr)

  return { ok: true, expires: expiresStr }
})
