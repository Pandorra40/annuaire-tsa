import { getQuery } from 'h3'
import type { RowDataPacket } from 'mysql2'
import { getDb } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import { apiError } from '~~/server/utils/errors'
import { stripHtmlField } from '~~/server/utils/stripHtml'
import { validateLength, validateUrl } from '~~/server/utils/validators'
import { TYPES_ASSOCIATION } from '~~/server/utils/associationTypes'
import { invaliderAssociation } from '~~/server/utils/prerendu'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getQuery(event).id ?? 0)
  if (!id) apiError(400, 'ID manquant')

  const data = await readBody<Record<string, unknown>>(event)
  if (!data) apiError(400, 'Données invalides')

  const nom = String(data.nom ?? '').trim()
  const ville = String(data.ville ?? '').trim()
  const dept = String(data.departement ?? '').trim()

  if (!nom || !ville || !dept) {
    apiError(400, 'Nom, ville et département sont obligatoires.')
  }
  validateLength(nom, 255, 'nom')
  validateLength(ville, 100, 'ville')
  validateLength(dept, 10, 'département')

  const type = String(data.type_association ?? '').trim()
  if (type !== '' && !TYPES_ASSOCIATION.includes(type as (typeof TYPES_ASSOCIATION)[number])) {
    apiError(400, 'Type d\'association inconnu.')
  }

  const email = String(data.email ?? '').trim()
  if (email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    apiError(400, { error: 'Adresse email invalide.', field: 'email' })
  }
  if (email !== '') validateLength(email, 255, 'email')

  const site = validateUrl(data.site_web as string | null | undefined, 'site_web')

  const services = stripHtmlField(data.services)
  const description = stripHtmlField(data.description)
  const adresse = stripHtmlField(data.adresse)
  const agePublic = stripHtmlField(data.age_public)
  const telephone = stripHtmlField(data.telephone)

  if (services) validateLength(services, 500, 'services')
  if (description) validateLength(description, 2000, 'description')
  if (adresse) validateLength(adresse, 255, 'adresse')
  if (agePublic) validateLength(agePublic, 500, 'public concerné')
  if (telephone) validateLength(telephone, 50, 'téléphone')

  const db = await getDb()
  const [exists] = await db.query<RowDataPacket[]>('SELECT id FROM associations WHERE id = ?', [id])
  if (!exists[0]) apiError(404, 'Introuvable')

  try {
    await db.execute(
      `UPDATE associations SET
          nom = ?, type_association = ?, ville = ?, departement = ?,
          adresse = ?, telephone = ?, email = ?, site_web = ?,
          services = ?, age_public = ?, description = ?
       WHERE id = ?`,
      [
        nom,
        type !== '' ? type : null,
        ville,
        dept,
        adresse,
        telephone,
        email !== '' ? email : null,
        site,
        services,
        agePublic,
        description,
        id
      ]
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    const code = (e as { code?: string }).code
    if (code === 'ER_DATA_TOO_LONG' || code === '22001' || msg.includes('1406')) {
      apiError(
        400,
        'Une valeur dépasse la taille autorisée en base (souvent le téléphone ou le site web). Raccourcissez le champ ou élargissez la colonne.'
      )
    }
    throw e
  }

  invaliderAssociation(id)
  return { ok: true }
})
