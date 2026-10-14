import { getQuery } from 'h3'
import { getDb } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import { apiError } from '~~/server/utils/errors'
import { departement2De, departementDe, invaliderPraticien } from '~~/server/utils/prerendu'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getQuery(event).id ?? 0)
  if (!id) apiError(400, 'ID manquant')

  const db = await getDb()
  const departement = await departementDe(db, id)
  const departement2 = await departement2De(db, id)

  await db.query('DELETE FROM signalements WHERE praticien_id = ?', [id])
  await db.query('DELETE FROM praticiens WHERE id = ?', [id])

  invaliderPraticien(id, [departement, departement2])
  return { ok: true }
})
