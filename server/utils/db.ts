import mysql from 'mysql2/promise'
import type { Pool } from 'mysql2/promise'

let pool: Pool | null = null

export async function getDb(): Promise<Pool> {
  if (pool) return pool

  const config = useRuntimeConfig()
  // Préférer les variables d'env runtime (DB_*) au runtimeConfig figé au build.
  pool = mysql.createPool({
    host: process.env.DB_HOST || String(config.dbHost || '127.0.0.1'),
    port: Number(process.env.DB_PORT || config.dbPort || 3306),
    user: process.env.DB_USER || String(config.dbUser || ''),
    password: process.env.DB_PASSWORD || process.env.DB_PASS || String(config.dbPassword || ''),
    database: process.env.DB_NAME || String(config.dbName || ''),
    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4',
    dateStrings: true
  })
  return pool
}
