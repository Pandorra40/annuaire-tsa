import { getQuery } from 'h3'
import { getDb } from '~~/server/utils/db'
import { apiError } from '~~/server/utils/errors'
import { rateLimit } from '~~/server/utils/request'

export default defineEventHandler(async (event) => {
  const id = Number(getQuery(event).id ?? 0)
  if (!id) apiError(400, 'ID manquant')

  // Une confirmation par fiche et par IP (30 jours) — anti-gonflage.
  try {
    await rateLimit(event, `confirmation_fiche_${id}`, 1, 30 * 86400)
  } catch (e: unknown) {
    const status = typeof e === 'object' && e && 'statusCode' in e
      ? Number((e as { statusCode: number }).statusCode)
      : 0
    if (status === 429) {
      return { ok: true, already: true }
    }
    throw e
  }

  // Plafond global d'abus (beaucoup de fiches différentes).
  await rateLimit(event, 'confirmation', 20, 3600)

  const db = await getDb()
  await db.query(
    'UPDATE praticiens SET confirmations = confirmations + 1, derniere_confirmation = NOW() WHERE id = ? AND statut = "publie"',
    [id]
  )

  return { ok: true }
})
