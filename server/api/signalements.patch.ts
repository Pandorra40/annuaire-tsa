import { getQuery } from 'h3'
import { getDb } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import { apiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getQuery(event).id ?? 0)
  if (!id) apiError(400, 'ID manquant')

  const data = await readBody<{ statut?: string }>(event)
  const statut = data?.statut ?? 'ignore'
  if (!['ouvert', 'ignore', 'resolu'].includes(statut)) {
    apiError(400, 'Statut invalide')
  }

  const db = await getDb()
  await db.query('UPDATE signalements SET statut = ? WHERE id = ?', [statut, id])
  return { ok: true }
})
