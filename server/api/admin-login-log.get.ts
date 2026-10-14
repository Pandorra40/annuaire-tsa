import type { RowDataPacket } from 'mysql2'
import { getQuery } from 'h3'
import { getDb } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import { apiError } from '~~/server/utils/errors'
import { clientIp, tsaLog } from '~~/server/utils/request'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  let limit = Number(getQuery(event).limit ?? 50)
  if (limit < 1) limit = 50
  if (limit > 100) limit = 100

  try {
    const db = await getDb()
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id, created_at, ip, success
       FROM admin_login_log
       ORDER BY created_at DESC, id DESC
       LIMIT ${limit}`
    )

    return {
      client_ip: clientIp(event),
      entries: rows.map(r => ({
        id: Number(r.id),
        created_at: r.created_at,
        ip: r.ip,
        success: Boolean(r.success)
      }))
    }
  } catch (e) {
    tsaLog('admin_login_log', `list=${e instanceof Error ? e.message : String(e)}`)
    apiError(503, 'Journal indisponible (migration à appliquer ?)')
  }
})
