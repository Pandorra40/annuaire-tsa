import { getHeader, readBody, setResponseStatus } from 'h3'
import { getDb } from '~~/server/utils/db'
import { clientIp, rateLimit, tsaLog } from '~~/server/utils/request'
import { isBotUserAgent, normalizeVisitPath } from '~~/server/utils/statsBot'

export default defineEventHandler(async (event) => {
  const ua = getHeader(event, 'user-agent') ?? ''
  if (isBotUserAgent(ua)) {
    setResponseStatus(event, 204)
    return null
  }

  const purpose = String(getHeader(event, 'sec-purpose') ?? getHeader(event, 'purpose') ?? '').toLowerCase()
  if (purpose !== '' && (purpose.includes('prefetch') || purpose.includes('preview'))) {
    setResponseStatus(event, 204)
    return null
  }

  await rateLimit(event, 'stats_hit', 120, 60)

  let data: Record<string, unknown> = {}
  try {
    const raw = await readBody<Record<string, unknown> | string>(event)
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      data = raw
    }
  } catch {
    /* corps vide */
  }

  const path = normalizeVisitPath(String(data.path ?? ''))
  if (path === null) {
    setResponseStatus(event, 204)
    return null
  }

  try {
    const db = await getDb()

    try {
      const [rows] = await db.query<Array<{ 1: number }>>(
        'SELECT 1 FROM stats_ip_exclude WHERE ip = ? LIMIT 1',
        [clientIp(event)]
      )
      if (rows.length) {
        setResponseStatus(event, 204)
        return null
      }
    } catch {
      /* table absente */
    }

    await db.query(
      `INSERT INTO visites_jour (jour, path, hits) VALUES (CURDATE(), ?, 1)
       ON DUPLICATE KEY UPDATE hits = hits + 1`,
      [path]
    )
  } catch (e) {
    tsaLog('stats_hit', `db=${e instanceof Error ? e.message : String(e)}`)
  }

  setResponseStatus(event, 204)
  return null
})
