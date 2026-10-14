import { join } from 'node:path'
import { copyFileSync, existsSync, unlinkSync } from 'node:fs'
import type { RowDataPacket } from 'mysql2'
import type { Pool } from 'mysql2/promise'

function racinePublique(): string {
  const fromEnv = process.env.TSA_RACINE_PUBLIQUE || process.env.NUXT_PUBLIC_SITE_ROOT
  if (fromEnv) return String(fromEnv)
  return join(process.cwd(), '.output/public')
}

export function invaliderRoute(route: string): boolean {
  if (!/^[a-z]+\/[0-9]{1,7}$/.test(route)) return false

  const dossier = join(racinePublique(), route)
  if (!existsSync(dossier)) return true

  const payload = join(dossier, '_payload.json')
  if (existsSync(payload)) {
    try {
      unlinkSync(payload)
    } catch {
      /* ignore */
    }
  }

  const coquille = join(racinePublique(), '200.html')
  if (!existsSync(coquille)) return false

  try {
    copyFileSync(coquille, join(dossier, 'index.html'))
    return true
  } catch {
    return false
  }
}

export function invaliderPraticien(id: number, departements: Array<string | null | undefined> = []): void {
  if (id > 0) invaliderRoute(`praticien/${id}`)

  for (const dep of [...new Set(departements.filter(Boolean))]) {
    const departement = String(dep).trim()
    if (/^[0-9]{2,3}$/.test(departement)) {
      invaliderRoute(`departement/${departement}`)
    }
  }
}

export function invaliderAssociation(id: number): void {
  if (id > 0) invaliderRoute(`association/${id}`)
  invaliderRoute('associations')
}

export async function departementDe(db: Pool, id: number): Promise<string | null> {
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT departement FROM praticiens WHERE id = ?',
    [id]
  )
  const valeur = rows[0]?.departement
  return valeur == null ? null : String(valeur)
}

export async function departement2De(db: Pool, id: number): Promise<string | null> {
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT departement2 FROM praticiens WHERE id = ?',
    [id]
  )
  const valeur = rows[0]?.departement2
  return valeur == null ? null : String(valeur)
}
