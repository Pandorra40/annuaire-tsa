import type { RowDataPacket } from 'mysql2'
import { getQuery } from 'h3'
import { getDb } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import { apiError } from '~~/server/utils/errors'
import { invaliderAssociation } from '~~/server/utils/prerendu'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getQuery(event).id ?? 0)
  if (!id) apiError(400, 'ID manquant')

  const data = await readBody<{ statut?: string }>(event)
  const statut = data?.statut ?? ''
  if (!['valide', 'refuse'].includes(statut)) {
    apiError(400, 'Statut invalide')
  }

  const db = await getDb()

  if (statut === 'valide') {
    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT * FROM suggestions_associations WHERE id = ?',
      [id]
    )
    const s = rows[0]
    if (!s) apiError(404, 'Suggestion introuvable')

    const [result] = await db.execute(
      `INSERT INTO associations
          (nom, type_association, ville, departement, adresse, telephone, email, site_web, services, age_public, description, statut)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "publie")`,
      [
        s.nom,
        s.type_association,
        s.ville,
        s.departement,
        s.adresse,
        s.telephone,
        s.email,
        s.site_web,
        s.services,
        s.age_public,
        s.description
      ]
    )
    invaliderAssociation((result as { insertId: number }).insertId)
  }

  await db.query('UPDATE suggestions_associations SET statut = ? WHERE id = ?', [statut, id])
  return { ok: true }
})
