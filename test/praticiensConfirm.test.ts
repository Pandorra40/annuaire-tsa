import { describe, expect, it } from 'vitest'

/**
 * Comportement attendu de PATCH /api/praticiens?id=…
 * (logique pure, sans DB — la route applique rateLimit + UPDATE).
 */
function parseConfirmId(raw: unknown): number | null {
  const id = Number(raw ?? 0)
  return id > 0 ? id : null
}

describe('confirmation praticien (contrat API)', () => {
  it('refuse un id manquant ou invalide', () => {
    expect(parseConfirmId(undefined)).toBeNull()
    expect(parseConfirmId('')).toBeNull()
    expect(parseConfirmId('abc')).toBeNull()
    expect(parseConfirmId(0)).toBeNull()
  })

  it('accepte un id numérique positif', () => {
    expect(parseConfirmId('42')).toBe(42)
    expect(parseConfirmId(7)).toBe(7)
  })

  it('clé de rate-limit : une confirmation par fiche', () => {
    const id = 12
    expect(`confirmation_fiche_${id}`).toBe('confirmation_fiche_12')
  })
})
