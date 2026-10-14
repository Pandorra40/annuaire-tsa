import type { RowDataPacket } from 'mysql2'
import { agesToArray } from '~~/server/utils/validators'

export const SELECT_ADMIN = `
    SELECT p.*, c.email AS contact_email, c.actif AS contact_actif, c.consentement AS contact_consentement
    FROM praticiens p
    LEFT JOIN praticiens_contact c ON c.praticien_id = p.id
`

export function normaliserPraticien(row: RowDataPacket): Record<string, unknown> {
  return {
    ...row,
    ages: agesToArray(row.ages as string | null),
    teleconsultation: Boolean(row.teleconsultation),
    confirmations: Number(row.confirmations),
    contact_actif: Boolean(row.contact_actif)
  }
}
