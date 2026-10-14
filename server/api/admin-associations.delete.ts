import { getQuery } from 'h3'
import { getDb } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import { apiError } from '~~/server/utils/errors'
import { invaliderAssociation } from '~~/server/utils/prerendu'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getQuery(event).id ?? 0)
  if (!id) apiError(400, 'ID manquant')

  const db = await getDb()
  await db.query('DELETE FROM signalements WHERE association_id = ?', [id])
  await db.query('DELETE FROM associations WHERE id = ?', [id])
  invaliderAssociation(id)
  return { ok: true }
})
