import type { RowDataPacket } from 'mysql2'
import { getDb } from '~~/server/utils/db'
import {
  MAINTENANCE_DEFAULT_MESSAGE,
  sanitizeMaintenanceMessage
} from '~~/server/utils/maintenanceShared'

const CLE_ACTIF = 'maintenance_actif'
const CLE_MESSAGE = 'maintenance_message'
const CACHE_TTL_MS = 3000

export type MaintenanceState = {
  actif: boolean
  message: string
}

let tableReady = false
let cache: { at: number, state: MaintenanceState } | null = null

export function invalidateMaintenanceCache(): void {
  cache = null
}

async function ensureTable(): Promise<void> {
  if (tableReady) return
  const db = await getDb()
  await db.query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      cle VARCHAR(64) NOT NULL PRIMARY KEY,
      valeur TEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)
  tableReady = true
}

async function lireCle(cle: string): Promise<string | null> {
  const db = await getDb()
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT valeur FROM site_settings WHERE cle = ? LIMIT 1',
    [cle]
  )
  const v = rows[0]?.valeur
  return typeof v === 'string' ? v : null
}

export async function getMaintenanceState(): Promise<MaintenanceState> {
  const now = Date.now()
  if (cache && now - cache.at < CACHE_TTL_MS) return cache.state

  await ensureTable()
  const actifBrut = await lireCle(CLE_ACTIF)
  const messageBrut = await lireCle(CLE_MESSAGE)
  const state: MaintenanceState = {
    actif: actifBrut === '1',
    message: sanitizeMaintenanceMessage(messageBrut ?? MAINTENANCE_DEFAULT_MESSAGE)
  }
  cache = { at: now, state }
  return state
}

export async function setMaintenanceState(actif: boolean, message?: unknown): Promise<MaintenanceState> {
  await ensureTable()
  const db = await getDb()
  const msg = sanitizeMaintenanceMessage(
    message === undefined ? (await lireCle(CLE_MESSAGE)) : message
  )

  await db.query(
    `INSERT INTO site_settings (cle, valeur) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE valeur = VALUES(valeur)`,
    [CLE_ACTIF, actif ? '1' : '0']
  )
  await db.query(
    `INSERT INTO site_settings (cle, valeur) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE valeur = VALUES(valeur)`,
    [CLE_MESSAGE, msg]
  )

  const state: MaintenanceState = { actif, message: msg }
  cache = { at: Date.now(), state }
  return state
}
