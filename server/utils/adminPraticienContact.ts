import type { Pool } from 'mysql2/promise'
import type { RowDataPacket } from 'mysql2'
import { randomBytes } from 'node:crypto'
import { apiError } from '~~/server/utils/errors'
import { validateLength } from '~~/server/utils/validators'

export async function enregistrerContact(
  db: Pool,
  id: number,
  contact: { email?: string, actif?: boolean | number }
): Promise<void> {
  const email = String(contact.email ?? '').trim()
  const actif = contact.actif ? 1 : 0

  if (email === '') {
    await db.query('DELETE FROM praticiens_contact WHERE praticien_id = ?', [id])
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    apiError(400, 'Adresse email invalide.')
  }
  validateLength(email, 255, 'email')

  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT consentement FROM praticiens_contact WHERE praticien_id = ?',
    [id]
  )
  const ligne = rows[0]

  if (!ligne) {
    const token = randomBytes(16).toString('hex')
    const consentement = actif ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null
    await db.query(
      `INSERT INTO praticiens_contact (praticien_id, email, actif, consentement, token_desact)
       VALUES (?, ?, ?, ?, ?)`,
      [id, email, actif, consentement, token]
    )
    return
  }

  const consentement =
    ligne.consentement || (actif ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null)

  await db.query(
    'UPDATE praticiens_contact SET email = ?, actif = ?, consentement = ? WHERE praticien_id = ?',
    [email, actif, consentement, id]
  )
}
