import { getDb } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import { apiError } from '~~/server/utils/errors'
import { clientIp, tsaLog } from '~~/server/utils/request'
import { isIP } from 'node:net'
import { validateLength } from '~~/server/utils/validators'

function normaliserIp(ip: unknown): string | null {
  const s = String(ip ?? '').trim()
  if (s === '' || isIP(s) === 0) return null
  return s
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  let db
  try {
    db = await getDb()
  } catch {
    apiError(500, 'Erreur serveur')
  }

  const data = (await readBody<Record<string, unknown>>(event)) ?? {}

  let ip: string | null
  if (data.use_client_ip) {
    ip = clientIp(event)
  } else {
    ip = normaliserIp(data.ip)
  }

  if (ip === null || ip === '0.0.0.0') {
    apiError(400, 'Adresse IP invalide')
  }

  let note = data.note != null ? String(data.note).replace(/<[^>]*>/g, '').trim() : null
  if (note === '') note = null
  if (note !== null) validateLength(note, 100, 'note')

  try {
    await db.query(
      `INSERT INTO stats_ip_exclude (ip, note) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE note = COALESCE(VALUES(note), note)`,
      [ip, note]
    )
  } catch (e) {
    tsaLog('stats_exclude', `insert=${e instanceof Error ? e.message : String(e)}`)
    apiError(500, 'Impossible d\'enregistrer')
  }

  setResponseStatus(event, 201)
  return { ok: true, ip }
})
