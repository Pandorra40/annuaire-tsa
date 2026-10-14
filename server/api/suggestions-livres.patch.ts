import type { RowDataPacket } from 'mysql2'
import { getQuery } from 'h3'
import { getDb } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import { apiError } from '~~/server/utils/errors'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getQuery(event).id ?? 0)
  if (!id) apiError(400, 'ID manquant')

  const data = await readBody<{ statut?: string }>(event)
  const statut = data?.statut ?? ''
  if (!['valide', 'refuse'].includes(statut)) apiError(400, 'Statut invalide')

  const db = await getDb()

  if (statut === 'valide') {
    const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM suggestions_livres WHERE id = ?', [id])
    const s = rows[0]
    if (!s) apiError(404, 'Suggestion introuvable')

    await db.execute(
      `INSERT INTO livres (titre, auteur, annee, categorie, type, description, lien, statut)
       VALUES (?, ?, ?, ?, "suggestion", ?, ?, "publie")`,
      [s.titre, s.auteur, s.annee, s.categorie || 'témoignage', s.description, s.lien]
    )
  }

  await db.query('UPDATE suggestions_livres SET statut = ? WHERE id = ?', [statut, id])
  return { ok: true }
})
