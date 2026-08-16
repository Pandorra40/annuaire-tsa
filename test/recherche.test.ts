import { describe, expect, it } from 'vitest'
import { normaliserRecherche } from '../app/utils/recherche'

describe('normaliserRecherche', () => {
  it('retire les accents', () => {
    expect(normaliserRecherche('BÉZIERS')).toBe('beziers')
  })

  it('traite la cédille et le tréma', () => {
    expect(normaliserRecherche('Besançon')).toBe('besancon')
    expect(normaliserRecherche('Maël')).toBe('mael')
  })

  it('laisse intact un texte sans accent', () => {
    expect(normaliserRecherche('Saumur')).toBe('saumur')
  })

  it('conserve espaces, traits d\'union et apostrophes des noms composés', () => {
    expect(normaliserRecherche('L\'ISLE-D\'ABEAU')).toBe('l\'isle-d\'abeau')
  })

  it('permet à une saisie sans accent de trouver une donnée accentuée', () => {
    expect(normaliserRecherche('SAINT-MAUR-DES-FOSSÉS').includes(normaliserRecherche('fosses'))).toBe(true)
  })
})
