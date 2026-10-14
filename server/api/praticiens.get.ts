import type { RowDataPacket } from 'mysql2'
import { getQuery } from 'h3'
import { getDb } from '~~/server/utils/db'
import { agesToArray } from '~~/server/utils/validators'

const SELECT_PUBLIC = `
    SELECT
        p.id, p.nom, p.type, p.ville, p.ville2, p.departement, p.departement2,
        p.adresse, p.adresse2, p.telephone, p.site_web, p.teleconsultation, p.delai,
        p.ages, p.types_intervention, p.bilans, p.formations, p.experience,
        p.modalites, p.tarifs, p.autres_infos, p.adeli, p.fait_bilans,
        p.confirmations, p.created_at,
        (c.actif = 1 AND c.email IS NOT NULL) AS contact_actif
    FROM praticiens p
    LEFT JOIN praticiens_contact c ON c.praticien_id = p.id
`

function mapRow(row: RowDataPacket) {
  return {
    ...row,
    ages: agesToArray(row.ages as string | null),
    teleconsultation: Boolean(row.teleconsultation),
    confirmations: Number(row.confirmations),
    contact_actif: Boolean(row.contact_actif)
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const db = await getDb()

  let rows: RowDataPacket[]

  if (query.id != null) {
    const [r] = await db.query<RowDataPacket[]>(
      SELECT_PUBLIC + ' WHERE p.id = ? AND p.statut = "publie"',
      [Number(query.id)]
    )
    rows = r
  } else if (query.departement != null) {
    const dep = String(query.departement).trim().toUpperCase()
    const [r] = await db.query<RowDataPacket[]>(
      SELECT_PUBLIC + ' WHERE (p.departement = ? OR p.departement2 = ?) AND p.statut = "publie" ORDER BY p.nom ASC',
      [dep, dep]
    )
    rows = r
  } else {
    const [r] = await db.query<RowDataPacket[]>(
      SELECT_PUBLIC + ' WHERE p.statut = "publie" ORDER BY p.nom ASC'
    )
    rows = r
  }

  return rows.map(mapRow)
})
