import { describe, expect, it } from 'vitest'
import { createSessionToken, hashSessionToken } from '../server/utils/sessionToken'

describe('sessionToken', () => {
  it('crée un jeton opaque de 64 hex', () => {
    const token = createSessionToken()
    expect(token).toMatch(/^[0-9a-f]{64}$/)
  })

  it('hashe de façon déterministe (SHA-256)', () => {
    const token = 'a'.repeat(64)
    const h1 = hashSessionToken(token)
    const h2 = hashSessionToken(token)
    expect(h1).toBe(h2)
    expect(h1).toMatch(/^[0-9a-f]{64}$/)
    expect(h1).not.toBe(token)
  })

  it('ne permet pas de retrouver le jeton depuis le hash', () => {
    const token = createSessionToken()
    const hash = hashSessionToken(token)
    expect(hashSessionToken(hash)).not.toBe(token)
    expect(hash).not.toEqual(token)
  })
})
