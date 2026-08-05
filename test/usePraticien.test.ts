import { describe, expect, it } from 'vitest'
import { initiales, isNew } from '../app/composables/usePraticien'

describe('initiales', () => {
  it('prend les initiales du prénom et nom sans Dr', () => {
    expect(initiales('Dr Jean Dupont')).toBe('JD')
  })

  it('prend les deux premières lettres si un seul mot', () => {
    expect(initiales('Dupont')).toBe('DU')
  })
})

describe('isNew', () => {
  it('retourne false sans date', () => {
    expect(isNew()).toBe(false)
    expect(isNew(undefined)).toBe(false)
  })

  it('retourne true pour une fiche de moins de 7 jours', () => {
    const recent = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    expect(isNew(recent)).toBe(true)
  })

  it('retourne false pour une fiche ancienne', () => {
    const old = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    expect(isNew(old)).toBe(false)
  })
})
