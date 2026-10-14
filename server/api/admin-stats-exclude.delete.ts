import { getQuery } from 'h3'
import { getDb } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import { apiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = Number(getQuery(event).id ?? 0)
  if (!id) apiError(400, 'ID manquant')

  const db = await getDb()
  try {
    const [result] = await db.execute('DELETE FROM stats_ip_exclude WHERE id = ?', [id])
    if ((result as { affectedRows: number }).affectedRows === 0) {
      apiError(404, 'Introuvable')
    }
  } catch {
    apiError(500, 'Impossible de supprimer')
  }

  return { ok: true }
})
