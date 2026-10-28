import { getDb } from '~~/server/utils/db'
import { apiError } from '~~/server/utils/errors'
import { rateLimit, tsaLog } from '~~/server/utils/request'
import { pushbulletNotify } from '~~/server/utils/pushbullet'
import { stripHtmlField } from '~~/server/utils/stripHtml'
import { validateContactAuteur, validateLength, validateUrl } from '~~/server/utils/validators'
import { TYPES_ASSOCIATION } from '~~/server/utils/associationTypes'

export default defineEventHandler(async (event) => {
  await rateLimit(event, 'suggestion_asso_tentative', 30, 3600)

  const data = await readBody<Record<string, unknown>>(event)
  if (!data) apiError(400, 'Données invalides')

  if (data.hp) {
    tsaLog('suggestion_asso', 'Honeypot déclenché')
    setResponseStatus(event, 201)
    return { ok: true }
  }

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
  const contactAuteur = validateContactAuteur(data.contact_auteur)

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

  await rateLimit(event, 'suggestion_asso', 5, 3600)

  const db = await getDb()
  await db.execute(
    `INSERT INTO suggestions_associations
        (nom, type_association, ville, departement, adresse, telephone, email, site_web, services, age_public, description, contact_auteur)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nom,
      type || null,
      ville,
      dept,
      adresse || null,
      telephone,
      email || null,
      site,
      services || null,
      agePublic || null,
      description || null,
      contactAuteur
    ]
  )

  const joignable = contactAuteur ? `réponse possible : ${contactAuteur}` : 'sans moyen de réponse'
  await pushbulletNotify('Suggestion association — Annuaire TSA', `${nom} · ${ville} (${dept}) · ${joignable}`)

  setResponseStatus(event, 201)
  return { ok: true }
})
