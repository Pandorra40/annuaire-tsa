import { getDb } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import { apiError } from '~~/server/utils/errors'
import { validateLength, validateUrl } from '~~/server/utils/validators'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const data = await readBody<Record<string, unknown>>(event)
  if (!data) apiError(400, 'Données invalides')

  const titre = String(data.titre ?? '').trim()
  const auteur = String(data.auteur ?? '').trim()
  const cat = String(data.categorie ?? '').trim()
  const type = String(data.type ?? '').trim()

  if (!titre || !auteur || !cat || !type) {
    apiError(400, 'Champs obligatoires manquants')
  }

  validateLength(titre, 200, 'titre')
  validateLength(auteur, 100, 'auteur')
  validateLength(cat, 50, 'catégorie')

  const description = String(data.description ?? '').trim()
  if (description !== '') validateLength(description, 500, 'description')
  const lien = validateUrl(data.lien as string | null | undefined, 'lien')

  const db = await getDb()
  const [result] = await db.execute(
    `INSERT INTO livres (titre, auteur, annee, categorie, type, description, lien, statut)
     VALUES (?, ?, ?, ?, ?, ?, ?, "publie")`,
    [
      titre,
      auteur,
      Number(data.annee ?? new Date().getFullYear()),
      cat,
      type,
      description !== '' ? description : null,
      lien
    ]
  )

  setResponseStatus(event, 201)
  return { ok: true, id: (result as { insertId: number }).insertId }
})
