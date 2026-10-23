import { getDb } from '~~/server/utils/db'
import { apiError } from '~~/server/utils/errors'
import { rateLimit } from '~~/server/utils/request'
import { pushbulletNotify } from '~~/server/utils/pushbullet'
import {
  agesToString,
  isValidPraticienType,
  normaliserIdentifiant,
  validateContactAuteur,
  validateLength,
  validateUrl
} from '~~/server/utils/validators'
import { parseRubriquesPraticien } from '~~/server/utils/suggestionRubriques'

export default defineEventHandler(async (event) => {
  await rateLimit(event, 'suggestion_tentative', 30, 3600)

  const data = await readBody<Record<string, unknown>>(event)
  if (!data) apiError(400, 'Données invalides')

  const nom = String(data.nom ?? '').trim()
  const type = String(data.type ?? '').trim()
  const ville = String(data.ville ?? '').trim()
  const dept = String(data.departement ?? '').trim()

  if (!nom || !type || !ville || !dept) {
    apiError(400, 'Champs obligatoires manquants')
  }

  validateLength(nom, 100, 'nom')
  validateLength(type, 50, 'type')
  validateLength(ville, 100, 'ville')

  if (!isValidPraticienType(type)) {
    apiError(400, 'Type de professionnel invalide')
  }

  const adeli = normaliserIdentifiant(data.adeli as string | null | undefined, type)
  const site_web = validateUrl(data.site_web as string | null | undefined)
  const valeurs = parseRubriquesPraticien(data)

  let ville2 = data.ville2 != null ? String(data.ville2).replace(/<[^>]*>/g, '').trim() : null
  let departement2
    = data.departement2 != null ? String(data.departement2).replace(/<[^>]*>/g, '').trim() : null
  if (ville2 === '') ville2 = null
  if (departement2 === '') departement2 = null

  let adresse = data.adresse != null ? String(data.adresse).replace(/<[^>]*>/g, '').trim() : null
  let adresse2 = data.adresse2 != null ? String(data.adresse2).replace(/<[^>]*>/g, '').trim() : null
  if (adresse === '') adresse = null
  if (adresse2 === '') adresse2 = null
  if (adresse) validateLength(adresse, 255, 'adresse')
  if (adresse2) validateLength(adresse2, 255, 'adresse du second lieu')

  const contactAuteur = validateContactAuteur(data.contact_auteur)
  const faitBilans = data.fait_bilans ? 1 : null

  await rateLimit(event, 'suggestion', 5, 3600)

  const db = await getDb()
  const params: Array<string | number | null> = [
    nom,
    type,
    ville,
    ville2,
    dept,
    departement2,
    adresse,
    adresse2,
    data.telephone != null ? String(data.telephone) : null,
    site_web,
    data.teleconsultation ? 1 : 0,
    data.delai != null ? String(data.delai) : null,
    agesToString((data.ages as string[]) ?? []),
    valeurs.types_intervention ?? null,
    valeurs.bilans ?? null,
    valeurs.formations ?? null,
    valeurs.experience ?? null,
    valeurs.modalites ?? null,
    valeurs.tarifs ?? null,
    valeurs.autres_infos ?? null,
    adeli,
    faitBilans,
    contactAuteur,
    data.source != null ? String(data.source) : 'communaute'
  ]
  await db.execute(
    `INSERT INTO suggestions (nom, type, ville, ville2, departement, departement2, adresse, adresse2, telephone, site_web, teleconsultation, delai, ages, types_intervention, bilans, formations, experience, modalites, tarifs, autres_infos, adeli, fait_bilans, contact_auteur, statut, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "en_attente", ?)`,
    params
  )

  const joignable = contactAuteur ? `réponse possible : ${contactAuteur}` : 'sans moyen de réponse'
  await pushbulletNotify('Nouvelle suggestion — Annuaire TSA', `${type} à ${ville} (${dept}) : ${nom} · ${joignable}`)

  setResponseStatus(event, 201)
  return { ok: true }
})
