import { describe, expect, it } from 'vitest'
import {
  MAINTENANCE_DEFAULT_MESSAGE,
  MAINTENANCE_MESSAGE_MAX,
  isMaintenanceBypassPath,
  sanitizeMaintenanceMessage
} from '../server/utils/maintenanceShared'

describe('isMaintenanceBypassPath', () => {
  it('laisse passer admin, auth, page maintenance et assets', () => {
    expect(isMaintenanceBypassPath('/admin')).toBe(true)
    expect(isMaintenanceBypassPath('/admin/login')).toBe(true)
    expect(isMaintenanceBypassPath('/admin/stats')).toBe(true)
    expect(isMaintenanceBypassPath('/api/auth')).toBe(true)
    expect(isMaintenanceBypassPath('/api/maintenance')).toBe(true)
    expect(isMaintenanceBypassPath('/maintenance')).toBe(true)
    expect(isMaintenanceBypassPath('/_nuxt/entry.js')).toBe(true)
    expect(isMaintenanceBypassPath('/fonts/Figtree-latin.woff2')).toBe(true)
    expect(isMaintenanceBypassPath('/logo-tsa.svg')).toBe(true)
  })

  it('bloque le site public et les API métier', () => {
    expect(isMaintenanceBypassPath('/')).toBe(false)
    expect(isMaintenanceBypassPath('/praticien/12')).toBe(false)
    expect(isMaintenanceBypassPath('/api/praticiens')).toBe(false)
    expect(isMaintenanceBypassPath('/api/stats-hit')).toBe(false)
    expect(isMaintenanceBypassPath('/mentions')).toBe(false)
  })
})

describe('sanitizeMaintenanceMessage', () => {
  it('retire le HTML et tronque', () => {
    expect(sanitizeMaintenanceMessage('  <b>Hello</b>  ')).toBe('Hello')
    expect(sanitizeMaintenanceMessage('')).toBe(MAINTENANCE_DEFAULT_MESSAGE)
    expect(sanitizeMaintenanceMessage(null)).toBe(MAINTENANCE_DEFAULT_MESSAGE)
    const long = 'a'.repeat(MAINTENANCE_MESSAGE_MAX + 20)
    expect([...sanitizeMaintenanceMessage(long)].length).toBe(MAINTENANCE_MESSAGE_MAX)
  })
})
