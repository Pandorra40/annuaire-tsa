import { getDb } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import { apiError } from '~~/server/utils/errors'
import { validateLength } from '~~/server/utils/validators'
import { idVideoYoutube, urlChaineYoutube } from '~~/server/utils/youtube'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const data = await readBody<Record<string, unknown>>(event)
  if (!data) apiError(400, 'Données invalides')

  const adresse = String(data.adresse ?? '').trim()
  const titre = String(data.titre ?? '').trim()
  const chaine = String(data.chaine ?? '').trim()
  const pourquoi = String(data.pourquoi ?? '').trim()
  const duree = String(data.duree ?? '').trim()
  // Colonne encore NOT NULL en base : valeur neutre, plus de saisie/validation catégorie.
  const cat = ''

  if (!adresse || !titre || !chaine || !pourquoi) {
    apiError(400, 'Adresse, titre, chaîne et description sont obligatoires.')
  }

  validateLength(titre, 255, 'titre')
  validateLength(chaine, 255, 'chaîne')
  validateLength(pourquoi, 600, 'description')
  validateLength(duree, 16, 'durée')

  const idVideo = idVideoYoutube(adresse)
  const urlChaine = idVideo ? null : urlChaineYoutube(adresse)

  if (!idVideo && !urlChaine) {
    apiError(
      400,
      'Adresse non reconnue. Attendu : une vidéo (youtu.be/…, youtube.com/watch?v=…, /shorts/…) ou une chaîne (youtube.com/@nom, /channel/UC…).'
    )
  }

  const db = await getDb()
  const [result] = await db.execute(
    `INSERT INTO videos (type, titre, chaine, youtube_id, url, categorie, duree, pourquoi)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      idVideo ? 'video' : 'chaine',
      titre,
      chaine,
      idVideo,
      urlChaine,
      cat,
      idVideo && duree !== '' ? duree : null,
      pourquoi
    ]
  )

  setResponseStatus(event, 201)
  return { ok: true, id: (result as { insertId: number }).insertId }
})
