import { getQuery } from 'h3'
import { getDb } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'
import { apiError } from '~~/server/utils/errors'
import { tsaLog } from '~~/server/utils/request'
import type { Pool } from 'mysql2/promise'

const PERIODES: Record<string, number> = {
  '7j': 7,
  '30j': 30,
  '3m': 90,
  '6m': 180
}

async function countSafe(db: Pool, sql: string): Promise<number> {
  try {
    const [rows] = await db.query<Array<{ c: number }>>(sql)
    const row = rows[0] as unknown as { 'COUNT(*)': number } | undefined
    const val = row && ('COUNT(*)' in row ? row['COUNT(*)'] : (row as { c: number }).c)
    if (typeof val === 'number') return val
    const [r2] = await db.query<Array<Record<string, number>>>(sql)
    const first = r2[0]
    if (!first) return 0
    const key = Object.keys(first)[0]
    return Number(first[key] ?? 0)
  } catch {
    return 0
  }
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  let key = String(getQuery(event).periode ?? '7j')
  if (!(key in PERIODES)) key = '7j'
  const jours = PERIODES[key]

  let db: Pool
  try {
    db = await getDb()
  } catch {
    apiError(500, 'Erreur serveur')
  }

  const sinceDate = new Date()
  sinceDate.setHours(0, 0, 0, 0)
  sinceDate.setDate(sinceDate.getDate() - (jours - 1))
  const since = sinceDate.toISOString().slice(0, 10)

  let visitesPeriode = 0
  let visitesAujourdhui = 0
  const serie: Array<{ jour: string, hits: number }> = []
  let topPages: Array<{ path: string, hits: number }> = []

  try {
    const [pRows] = await db.query<Array<{ s: number }>>(
      'SELECT COALESCE(SUM(hits), 0) AS s FROM visites_jour WHERE jour >= ?',
      [since]
    )
    visitesPeriode = Number((pRows[0] as { s: number })?.s ?? 0)

    const [tRows] = await db.query<Array<{ s: number }>>(
      'SELECT COALESCE(SUM(hits), 0) AS s FROM visites_jour WHERE jour = CURDATE()'
    )
    visitesAujourdhui = Number((tRows[0] as { s: number })?.s ?? 0)

    const [dayRows] = await db.query<Array<{ jour: string, hits: number }>>(
      `SELECT jour, SUM(hits) AS hits
       FROM visites_jour
       WHERE jour >= ?
       GROUP BY jour
       ORDER BY jour ASC`,
      [since]
    )
    const byDay: Record<string, number> = {}
    for (const row of dayRows) {
      byDay[String(row.jour).slice(0, 10)] = Number(row.hits)
    }

    const cursor = new Date(since + 'T12:00:00')
    const end = new Date()
    end.setHours(0, 0, 0, 0)
    while (cursor <= end) {
      const d = cursor.toISOString().slice(0, 10)
      serie.push({ jour: d, hits: byDay[d] ?? 0 })
      cursor.setDate(cursor.getDate() + 1)
    }

    const [topRows] = await db.query<Array<{ path: string, hits: number }>>(
      `SELECT path, SUM(hits) AS hits
       FROM visites_jour
       WHERE jour >= ?
       GROUP BY path
       ORDER BY hits DESC
       LIMIT 15`,
      [since]
    )
    topPages = topRows.map(r => ({ path: r.path, hits: Number(r.hits) }))
  } catch (e) {
    tsaLog('stats', `visites=${e instanceof Error ? e.message : String(e)}`)
  }

  const metier = {
    praticiens_publies: await countSafe(db, "SELECT COUNT(*) FROM praticiens WHERE statut = 'publie'"),
    associations_publiees: await countSafe(db, "SELECT COUNT(*) FROM associations WHERE statut = 'publie'"),
    suggestions_praticiens: await countSafe(db, "SELECT COUNT(*) FROM suggestions WHERE statut = 'en_attente'"),
    suggestions_associations: await countSafe(
      db,
      "SELECT COUNT(*) FROM suggestions_associations WHERE statut = 'en_attente'"
    ),
    suggestions_livres: await countSafe(db, "SELECT COUNT(*) FROM suggestions_livres WHERE statut = 'en_attente'"),
    signalements_ouverts: await countSafe(db, "SELECT COUNT(*) FROM signalements WHERE statut = 'ouvert'"),
    livres: await countSafe(db, "SELECT COUNT(*) FROM livres WHERE statut = 'publie'"),
    videos: await countSafe(db, 'SELECT COUNT(*) FROM videos')
  }

  return {
    periode: key,
    jours,
    depuis: since,
    visites: {
      aujourdhui: visitesAujourdhui,
      periode: visitesPeriode,
      serie,
      top_pages: topPages
    },
    metier
  }
})
