import { getHeader, readRawBody, setResponseStatus } from 'h3'
import type { RowDataPacket } from 'mysql2'
import { getDb } from '~~/server/utils/db'
import { clientIp, rateLimit, tsaLog } from '~~/server/utils/request'
import { isBotUserAgent, normalizeVisitPath } from '~~/server/utils/statsBot'
import { parseStatsHitBody } from '~~/server/utils/statsHitBody'

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

  let raw = ''
  try {
    raw = (await readRawBody(event, 'utf8')) || ''
  } catch {
    /* corps vide */
  }

  let formPath: string | null = null
  const trimmed = raw.trim()
  if (trimmed !== '' && !trimmed.startsWith('{') && trimmed.includes('path=')) {
    formPath = new URLSearchParams(raw).get('path')
  }

  const data = parseStatsHitBody(raw, formPath)
  const path = normalizeVisitPath(String(data.path ?? ''))
  if (path === null) {
    setResponseStatus(event, 204)
    return null
  }

  try {
    const db = await getDb()

    try {
      const [rows] = await db.query<RowDataPacket[]>(
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
    await db.query('DELETE FROM visites_jour WHERE jour < CURDATE() - INTERVAL 24 MONTH')
  } catch (e) {
    tsaLog('stats_hit', `db=${e instanceof Error ? e.message : String(e)}`)
  }

  setResponseStatus(event, 204)
  return null
})
