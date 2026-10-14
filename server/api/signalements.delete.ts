import { getQuery } from 'h3'
import { getDb } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import { apiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const praticienId = Number(getQuery(event).praticien_id ?? 0)
  if (!praticienId) apiError(400, 'ID praticien manquant')

  const db = await getDb()
  await db.query('DELETE FROM signalements WHERE praticien_id = ?', [praticienId])
  return { ok: true }
})
