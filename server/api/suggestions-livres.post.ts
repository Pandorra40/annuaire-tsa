import { getDb } from '~~/server/utils/db'
import { apiError } from '~~/server/utils/errors'
import { rateLimit } from '~~/server/utils/request'
import { pushbulletNotify } from '~~/server/utils/pushbullet'
import { stripHtmlField } from '~~/server/utils/stripHtml'
import { validateContactAuteur, validateLength, validateUrl } from '~~/server/utils/validators'

const CATS_VALIDES = ['témoignage', 'guide pratique', 'scientifique', 'jeunesse', 'roman', '']

export default defineEventHandler(async (event) => {
  await rateLimit(event, 'suggestion_livre_tentative', 30, 3600)

  const data = await readBody<Record<string, unknown>>(event)
  if (!data) apiError(400, 'Données invalides')

  const titre = String(data.titre ?? '').trim()
  const auteur = String(data.auteur ?? '').trim()

  if (!titre || !auteur) apiError(400, 'Titre et auteur obligatoires')

  validateLength(titre, 200, 'titre')
  validateLength(auteur, 100, 'auteur')

  const desc = stripHtmlField(data.description)
  if (desc) validateLength(desc, 500, 'description')

  const lien = validateUrl(data.lien as string | null | undefined, 'lien')
  const contactAuteur = validateContactAuteur(data.contact_auteur)

  let categorie = String(data.categorie ?? '')
  if (!CATS_VALIDES.includes(categorie)) categorie = ''

  await rateLimit(event, 'suggestion_livre', 5, 3600)

  const db = await getDb()
  await db.execute(
    `INSERT INTO suggestions_livres (titre, auteur, annee, categorie, description, lien, contact_auteur, statut)
     VALUES (?, ?, ?, ?, ?, ?, ?, "en_attente")`,
    [
      titre,
      auteur,
      Number(data.annee ?? 0) || null,
      categorie || null,
      desc,
      lien,
      contactAuteur
    ]
  )

  const joignable = contactAuteur ? `réponse possible : ${contactAuteur}` : 'sans moyen de réponse'
  await pushbulletNotify('Suggestion livre — Annuaire TSA', `${titre} · ${auteur} · ${joignable}`)

  setResponseStatus(event, 201)
  return { ok: true }
})
