import type { RowDataPacket } from 'mysql2'
import { getDb } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import { apiError } from '~~/server/utils/errors'
import { clientIp, tsaLog } from '~~/server/utils/request'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  let db
  try {
    db = await getDb()
  } catch {
    apiError(500, 'Erreur serveur')
  }

  try {
    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT id, ip, note, created_at FROM stats_ip_exclude ORDER BY created_at DESC, id DESC'
    )
    return {
      client_ip: clientIp(event),
      ips: rows.map(r => ({
        id: Number(r.id),
        ip: r.ip,
        note: r.note,
        created_at: r.created_at
      }))
    }
  } catch (e) {
    tsaLog('stats_exclude', `list=${e instanceof Error ? e.message : String(e)}`)
    apiError(503, 'Liste indisponible (migration à appliquer ?)')
  }
})
