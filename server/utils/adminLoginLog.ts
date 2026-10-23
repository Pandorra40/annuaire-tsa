import type { H3Event } from 'h3'
import type { RowDataPacket } from 'mysql2'
import { getDb } from '~~/server/utils/db'
import { clientIp, tsaLog } from '~~/server/utils/request'
import { pushbulletNotify } from '~~/server/utils/pushbullet'

const ADMIN_LOGIN_FAIL_WINDOW = 900
const ADMIN_LOGIN_FAIL_ALERT = 5

export async function recordAdminLogin(event: H3Event, success: boolean): Promise<void> {
  const ip = clientIp(event)
  try {
    const db = await getDb()
    await db.query('INSERT INTO admin_login_log (ip, success) VALUES (?, ?)', [ip, success ? 1 : 0])
    await db.query('DELETE FROM admin_login_log WHERE created_at < NOW() - INTERVAL 12 MONTH')
  } catch (e) {
    tsaLog('admin_login_log', `insert=${e instanceof Error ? e.message : String(e)}`, event)
    return
  }

  if (success) return

  let n: number
  try {
    const db = await getDb()
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS n FROM admin_login_log
       WHERE ip = ? AND success = 0
         AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)`,
      [ip, ADMIN_LOGIN_FAIL_WINDOW]
    )
    n = Number(rows[0]?.n ?? 0)
  } catch (e) {
    tsaLog('admin_login_log', `count=${e instanceof Error ? e.message : String(e)}`, event)
    return
  }

  if (n >= ADMIN_LOGIN_FAIL_ALERT && n % ADMIN_LOGIN_FAIL_ALERT === 0) {
    await pushbulletNotify(
      'Alertes login admin — Annuaire TSA',
      `${n} échecs de connexion en 15 min depuis ${ip}`
    )
  }
}
