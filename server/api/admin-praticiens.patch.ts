import { getQuery } from 'h3'
import { getDb } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import { apiError } from '~~/server/utils/errors'
import {
  agesToString,
  isValidPraticienType,
  normaliserIdentifiant,
  validateLength,
  validateUrl
} from '~~/server/utils/validators'
import { parseRubriquesPraticien } from '~~/server/utils/suggestionRubriques'
import { enregistrerContact } from '~~/server/utils/adminPraticienContact'
import { departement2De, departementDe, invaliderPraticien } from '~~/server/utils/prerendu'

function parseFaitBilans(raw: unknown): number | null {
  if (raw === 1 || raw === '1' || raw === true || raw === 'oui') return 1
  if (raw === 0 || raw === '0' || raw === false || raw === 'non') return 0
  return null
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getQuery(event).id ?? 0)
  if (!id) apiError(400, 'ID manquant')

  const data = await readBody<Record<string, unknown>>(event)
  const db = await getDb()

  if (data.statut != null && Object.keys(data).length === 1) {
    const statut = String(data.statut)
    if (!['publie', 'masquee'].includes(statut)) {
      apiError(400, 'Statut invalide')
    }
    const departement = await departementDe(db, id)
    const departement2 = await departement2De(db, id)
    await db.query('UPDATE praticiens SET statut = ? WHERE id = ?', [statut, id])
    invaliderPraticien(id, [departement, departement2])
    return { ok: true }
  }

  if (data.contact != null && Object.keys(data).length === 1) {
    await enregistrerContact(db, id, data.contact as { email?: string, actif?: boolean })
    invaliderPraticien(id, [await departementDe(db, id), await departement2De(db, id)])
    return { ok: true }
  }

  const nom = String(data.nom ?? '').trim()
  const type = String(data.type ?? '').trim()
  const ville = String(data.ville ?? '').trim()
  const dept = String(data.departement ?? '').trim()

  if (!nom || !type || !ville || !dept) {
    apiError(400, 'Nom, type, ville et département sont obligatoires.')
  }
  validateLength(nom, 100, 'nom')
  validateLength(ville, 100, 'ville')
  validateLength(dept, 10, 'département')
  if (!isValidPraticienType(type)) {
    apiError(400, 'Type de professionnel invalide.')
  }

  const siteWeb = validateUrl(data.site_web as string | null | undefined)
  const adeli = normaliserIdentifiant(data.adeli as string | null | undefined, type)
  const valeurs = parseRubriquesPraticien(data)

  let ville2 = data.ville2 != null ? String(data.ville2).replace(/<[^>]*>/g, '').trim() : null
  let adresse2 = data.adresse2 != null ? String(data.adresse2).replace(/<[^>]*>/g, '').trim() : null
  let departement2 = data.departement2 != null
    ? String(data.departement2).replace(/<[^>]*>/g, '').trim()
    : null
  if (ville2 === '') ville2 = null
  if (adresse2 === '') adresse2 = null
  if (departement2 === '') departement2 = null

  const ancienDepartement = await departementDe(db, id)
  const ancienDepartement2 = await departement2De(db, id)
  const faitBilans = parseFaitBilans(data.fait_bilans)

  const params: Array<string | number | null> = [
    nom,
    type,
    ville,
    ville2,
    dept,
    departement2,
    data.adresse != null ? String(data.adresse) : null,
    adresse2,
    data.telephone != null ? String(data.telephone) : null,
    siteWeb,
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
    id
  ]
  await db.execute(
    `UPDATE praticiens SET
        nom=?, type=?, ville=?, ville2=?, departement=?, departement2=?, adresse=?, adresse2=?,
        telephone=?, site_web=?, teleconsultation=?, delai=?,
        ages=?, types_intervention=?, bilans=?, formations=?, experience=?, modalites=?, tarifs=?, autres_infos=?,
        adeli=?, fait_bilans=?
     WHERE id=?`,
    params
  )

  invaliderPraticien(id, [ancienDepartement, dept, ancienDepartement2, departement2])
  return { ok: true }
})
