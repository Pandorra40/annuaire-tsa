import { getQuery } from 'h3'
import { getDb } from '~~/server/utils/db'
import { apiError } from '~~/server/utils/errors'
import { rateLimit } from '~~/server/utils/request'

export default defineEventHandler(async (event) => {
  await rateLimit(event, 'confirmation', 20, 3600)

  const id = Number(getQuery(event).id ?? 0)
  if (!id) apiError(400, 'ID manquant')

  const db = await getDb()
  await db.query(
    'UPDATE praticiens SET confirmations = confirmations + 1, derniere_confirmation = NOW() WHERE id = ? AND statut = "publie"',
    [id]
  )

  return { ok: true }
})
