import type { H3Event } from 'h3'
import { getCookie, setCookie, deleteCookie } from 'h3'
import type { RowDataPacket } from 'mysql2'
import { getDb } from '~~/server/utils/db'
import { apiError } from '~~/server/utils/errors'
import { tsaLog } from '~~/server/utils/request'
import { hashSessionToken } from '~~/server/utils/sessionToken'

export const ADMIN_COOKIE = 'tsa_admin'

function adminCookieSecure(event: H3Event): boolean {
  const proto = event.node.req.headers['x-forwarded-proto']
  if (proto === 'https') return true
  const encrypted = (event.node.req.socket as { encrypted?: boolean }).encrypted
  return Boolean(encrypted)
}

export function readAdminToken(event: H3Event): string | null {
  const token = getCookie(event, ADMIN_COOKIE) ?? ''
  return token !== '' ? token : null
}

export function setAdminCookie(event: H3Event, token: string, expiresAt: string): void {
  const expires = new Date(expiresAt.includes('T') ? expiresAt : expiresAt.replace(' ', 'T') + 'Z')
  setCookie(event, ADMIN_COOKIE, token, {
    expires,
    path: '/',
    secure: adminCookieSecure(event),
    httpOnly: true,
    sameSite: 'strict'
  })
}

export function clearAdminCookie(event: H3Event): void {
  deleteCookie(event, ADMIN_COOKIE, {
    path: '/',
    secure: adminCookieSecure(event),
    httpOnly: true,
    sameSite: 'strict'
  })
}

export async function requireAdmin(event: H3Event): Promise<void> {
  const token = readAdminToken(event)
  if (!token) {
    tsaLog('auth', 'Admin access without token', event)
    apiError(401, 'Non authentifié')
  }
  const db = await getDb()
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT id FROM admin_sessions WHERE token = ? AND expires_at > NOW()',
    [hashSessionToken(token)]
  )
  if (!rows[0]) {
    tsaLog('auth', 'Admin access with invalid or expired token', event)
    apiError(401, 'Session expirée')
  }
}
